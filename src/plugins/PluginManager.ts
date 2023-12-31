import fs from "fs/promises";
import path from "path";
import { IPluginConfig } from "../common/config/ConfigInterfaces";
import { IPlugin, IPluginManifest, IPluginService } from "@charliej107/vankyle-cite-plugin";

export class PluginManager {
    private config: IPluginConfig;
    private pluginInstances: { [key: string]: IPluginService } = {};
    constructor(config: IPluginConfig) {
        this.config = config;
    }


    public async scanPlugins() {

        const items = await fs.readdir(this.config.plugin_dir);

        const promises: Promise<IPluginManifest | null>[] = items.map(async (item) => {
            if (await this.isValidPlugin(item)) {
                return await this.getPluginManifestFromPluginPath(item);
            }
            return null;
        });

        const validPlugins: (IPluginManifest | null)[] = await Promise.all(promises);
        const installedPlugins = validPlugins.filter((plugin) => plugin !== null) as IPluginManifest[];
    }

    private async isValidPlugin(dir_or_file: string): Promise<boolean> {
        const itemPath = path.join(this.config.plugin_dir, dir_or_file);
        try {
            const itemStats = await fs.stat(itemPath);
            if (itemStats.isDirectory()) {
                const manifest = await this.getPluginManifestFromPluginPath(itemPath);
                if (await this.isValidManifest(manifest)) {
                    const entryPath = path.join(itemPath, manifest.entry);

                    const entryStats = await fs.stat(entryPath);
                    if (entryStats.isFile() && entryPath.endsWith('.js')) {
                        const plugin = await this.getPluginFromPluginManifest(manifest);
                        if (this.isIPlugin(plugin)) {
                            return true;
                        } else {
                            console.error(`Plugin entry file does not export a plugin: ${entryPath}`);
                            return false;
                        }
                    } else {
                        console.error(`Plugin entry file does not exist or is not a .js file: ${entryPath}`);
                        return false;
                    }
                }
            }
        } catch (error) {
            console.error(`Error checking plugin directory:`, error);
        }
        return false; // Default to false
    }

    private isIPlugin(plugin: any): plugin is IPlugin {
        if (plugin !== undefined) {
            if (plugin.init !== undefined) {
                return true;
            }
        }
        return false;

    }

    private async getPluginManifestFromPluginPath(plugin_path: string): Promise<IPluginManifest> {
        const manifestPath = path.join(plugin_path, 'manifest.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest: IPluginManifest = JSON.parse(manifestContent);
        return manifest;
    }
    private async getPluginFromPluginManifest(manifest: IPluginManifest): Promise<IPlugin> {
        const pluginPath = path.join(this.config.plugin_dir, manifest.uuid, manifest.entry);
        const plugin = await import(pluginPath);
        return plugin;
    }

    private async isValidManifest(manifest: IPluginManifest): Promise<boolean> {
        const requiredFields = ['manifest-version', 'name', 'uid', 'version', 'entry'];

        for (const field of requiredFields) {
            if (!(field in manifest)) {
                console.error(`Plugin manifest is missing required field: ${field}`);
                return false;
            }
        }

        // Check if the entry field points to a .js file
        // Duplicate check with isValidPlugin, but it's better to be safe than sorry
        if (!manifest.entry.endsWith('.js')) {
            console.error(`Plugin entry field does not point to a .js file: ${manifest.entry}`);
            return false;
        }
        // Chekc if the entry field points to a file that exists use fs/promises.stat
        const entryPath = path.join(this.config.plugin_dir, manifest.uuid, manifest.entry);
        try {
            const entryStats = await fs.stat(entryPath);
            if (!entryStats.isFile()) {
                console.error(`Plugin entry field does not point to a file: ${manifest.entry}`);
                return false;
            }
        } catch (error) {
            console.error(`Error checking plugin entry file:`, error);
            return false;
        }

        return true;
    }

}