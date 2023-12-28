import fs from "fs/promises";
import path from "path";
import { IConfig, IPluginConfig } from "../config/ConfigInterfaces";
import { IPlugin, IPluginManifest, IPluginService } from "@charliej107/vankyle-cite-plugin";
import { PluginServiceProvider } from "./PluginServiceProvider";

export class PluginManager {
    private config: IPluginConfig;
    private installedPlugins: IPluginManifest[];
    private enabledPlugins: IPlugin[];
    private pluginServiceProvider: PluginServiceProvider;
    private pluginInstances: { [key: string]: IPluginService } = {};
    constructor(config: IConfig, pluginServiceProvider: PluginServiceProvider) {
        this.config = config.plugins;
        this.installedPlugins = [];
        this.enabledPlugins = [];
        this.pluginServiceProvider = pluginServiceProvider;
    }

    public async init() {
        await this.scanPlugins();
        if (this.config.enabled_plugins.length > 0) {
            const pluginPromises = this.installedPlugins.filter(
                (menifest) => menifest.uuid in this.config.enabled_plugins)
                .map(async (manifest) => await this.getPluginFromPluginManifest(manifest));
            this.enabledPlugins = await Promise.all(pluginPromises);
        }
    }
    public async loadPlugins() {
        for (const plugin of this.enabledPlugins) {
            const instance = this.pluginServiceProvider.resolveService(plugin);
            instance.init();
            this.pluginInstances[plugin.toString()] = instance;
        }
    }
    public async getInstalledPlugins(): Promise<IPluginManifest[]> {
        return this.installedPlugins;
    }

    public async enablePlugin(plugin_manifest: IPluginManifest): Promise<void> {
        const plugin: IPlugin = await this.getPluginFromPluginManifest(plugin_manifest);
        this.enabledPlugins.push(plugin);

    }

    public async getEnabledPlugins(): Promise<IPlugin[]> {
        return this.enabledPlugins;
    }



    private async scanPlugins() {

        const items = await fs.readdir(this.config.plugin_dir);

        const promises: Promise<IPluginManifest | null>[] = items.map(async (item) => {
            if (await this.isValidPlugin(item)) {
                return await this.getPluginManifestFromPluginPath(item);
            }
            return null;
        });

        const validPlugins: (IPluginManifest | null)[] = await Promise.all(promises);
        this.installedPlugins = validPlugins.filter((plugin) => plugin !== null) as IPluginManifest[];
    }

    private async isValidPlugin(dir_or_file: string): Promise<boolean> {
        const itemPath = path.join(this.config.plugin_dir, dir_or_file);
        try {
            const itemStats = await fs.stat(itemPath);
            if (itemStats.isDirectory()) {
                const manifest = await this.getPluginManifestFromPluginPath(itemPath);
                if (this.isValidManifest(manifest)) {
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

    private isValidManifest(manifest: IPluginManifest): boolean {
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

        return true;
    }

}