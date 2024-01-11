import { IConfig } from "@/data/config/IConfig";
import { IPlugin, PluginManifest, isValidPluginManifest } from "@/plugins/PluginManifest";
import { PluginService } from "@/plugins/PluginService";
import fs from "fs";
import path from "path";

type InstalledPlugin = {
    dir: string;
} & IPlugin;

export class PluginManager {
    private cofnig: IConfig;
    private plugins: Map<string, InstalledPlugin>;
    private pluginService: PluginService;
    constructor(config: IConfig, puginService: PluginService) {
        this.cofnig = config;
        // create config.plugins.plugin_dir if not exists
        if (!fs.existsSync(this.cofnig.plugins.plugin_dir)) {
            fs.mkdirSync(this.cofnig.plugins.plugin_dir);
        }
        this.plugins = new Map();
    }

    async getInstalledPlugins(): Promise<IPlugin[]> {
        const installedPlugins = await Promise.all((await fs.promises.readdir(this.cofnig.plugins.plugin_dir)).filter((dir) => {
            const packageJsonPath = path.join(this.cofnig.plugins.plugin_dir, dir, "package.json");
            try {
                if (!fs.existsSync(packageJsonPath)) {
                    return false;
                }
                const contnet = fs.readFileSync(packageJsonPath, "utf-8");
                const valid = isValidPluginManifest(JSON.parse(contnet));
                if (!valid) {
                    console.warn(`Invalid plugin manifest at ${packageJsonPath}`);
                    return false;
                }
                return true;
            } catch (e) {
                console.warn(`Failed to read plugin manifest at ${packageJsonPath}`, e);
                return false;
            }
        }).map(async (dir) => {
            const packageJsonPath = path.join(this.cofnig.plugins.plugin_dir, dir, "package.json");
            const contnet = await fs.promises.readFile(packageJsonPath, "utf-8");
            const manifest = JSON.parse(contnet);
            if (this.cofnig.plugins.enabled_plugins.includes(manifest.name)) {
                await this.enablePlugin(manifest, dir);
                return {
                    manifest,
                    dir,
                    status: "enabled"
                } as InstalledPlugin
            } else {
                await this.disablePlugin(manifest);
                return {
                    manifest,
                    dir,
                    status: "disabled"
                } as InstalledPlugin
            }
        }));
        this.plugins.clear();
        for (const plugin of installedPlugins) {
            this.plugins.set(plugin.manifest.name, plugin);
        }
        return installedPlugins;
    }

    async enablePlugin(plugin: PluginManifest, dir: string): Promise<void> {
        const pluginDir = path.join(this.cofnig.plugins.plugin_dir, dir);
        await this.pluginService.enablePlugin(plugin, pluginDir);
    }

    async disablePlugin(plugin: PluginManifest): Promise<void> {
        await this.pluginService.disablePlugin(plugin);
    }


}