import fs from "fs/promises";
import Path from "path";
import { IPluginConfig } from "../common/config/ConfigInterfaces";
import { IPluginManifest } from "@charliej107/vankyle-cite-plugin";
import { BrowserWindow, MessageChannelMain } from "electron";
import { PluginServiceManager } from "./PluginServiceManager";

export class PluginManager {
    private config: IPluginConfig;
    private installedPlugins: IPluginManifest[] = [];
    private pluginWindows: Map<string, BrowserWindow> = new Map();
    private pluginServiceManager: PluginServiceManager;
    constructor(config: IPluginConfig, pluginServiceManager: PluginServiceManager) {
        this.config = config;
        this.pluginServiceManager = pluginServiceManager;
        console.log('PluginManager initialized');
    }

    public async scanPlugins() {
        console.log('Scanning plugins in directory: ', this.config.plugin_dir);
        const items = await fs.readdir(this.config.plugin_dir);
        const promises: Promise<{ valid: true, path: string, manifest: IPluginManifest } | { valid: false }>[] = items.map((item) => {
            return this.validatePlugin(item);
        });

        const validPlugins = await Promise.all(promises);
        this.installedPlugins = (validPlugins
            .filter(({ valid }) => valid) as { valid: true, path: string, manifest: IPluginManifest }[])
            .map(({ path, manifest }) => {
                manifest['path'] = path; // Add path to manifest for later use
                return manifest;
            });
    }

    public getInstalledPlugins(): IPluginManifest[] {
        return this.installedPlugins;
    }

    public async loadPlugin(plugin: IPluginManifest): Promise<void> {
        const pluginBrowserWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                preload: "plugins/perload.js",
                contextIsolation: true,
                sandbox: true,
            }
        });
        pluginBrowserWindow.loadFile(Path.join(this.config.plugin_dir, plugin.path, "index.html"));
        const pluginMessageChannel = new MessageChannelMain();
        pluginBrowserWindow.webContents.postMessage("init-service-provider", null, [pluginMessageChannel.port1]);
        this.pluginServiceManager.registerServiceProvider(plugin.uuid, pluginMessageChannel.port2);
        this.pluginWindows.set(plugin.uuid, pluginBrowserWindow);
    }

    private async validatePlugin(dir_or_file: string): Promise<
        { valid: true, path: string, manifest: IPluginManifest } | { valid: false }
    > {
        const itemPath = Path.join(this.config.plugin_dir, dir_or_file);
        try {
            const itemStats = await fs.stat(itemPath);
            if (itemStats.isDirectory()) {
                const manifestPath = Path.join(itemPath, 'manifest.json');
                const manifestContent = await fs.readFile(manifestPath, 'utf-8');
                const manifest: IPluginManifest = JSON.parse(manifestContent);

                const requiredFields = ['manifest-version', 'name', 'uid', 'version'];
                for (const field of requiredFields) {
                    if (!(field in manifest)) {
                        console.error(`Plugin manifest is missing required field: ${field}`);
                        return { valid: false };
                    }
                }
                const entryPath = Path.join(this.config.plugin_dir, dir_or_file, "index.html");
                try {
                    const entryStats = await fs.stat(entryPath);
                    if (!entryStats.isFile() ) {
                        console.error(`Plugin entry is not a file: ${entryPath}`);
                        return { valid: false };
                    }
                    return { valid: true, path: dir_or_file, manifest: manifest };

                } catch (error) {
                    console.error(`Error checking plugin entry file:`, error);
                    return { valid: false };
                }
            }
        } catch (error) {
            console.error(`Error checking plugin directory:`, error);
        }
        return { valid: false }; // Default to false
    }

}