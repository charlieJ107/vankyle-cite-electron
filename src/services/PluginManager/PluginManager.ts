import { IConfig } from "@/data/config/IConfig";
import { IPlugin, PluginManifest, isValidPluginManifest } from "@/plugins/PluginManifest";
import { PluginService } from "@/plugins/PluginService";
import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import { ConfigService } from "../ConfigService/ConfigService";

type InstalledPlugin = {
    dir: string;
} & IPlugin;

export class PluginManager {
    private installedPlugins: Map<string, InstalledPlugin>;
    private pluginService: PluginService;
    private configService: ConfigService;
    constructor(initialConfig: IConfig, pluginService: PluginService, configService: ConfigService) {
        // create config.plugins.plugin_dir if not exists
        fsExtra.ensureDirSync(initialConfig.plugins.plugin_dir);
        this.installedPlugins = new Map();
        this.pluginService = pluginService;
        this.configService = configService;
    }

    /**
     * 目前的逻辑：扫描，然后按照配置的开关来启停插件
     * expected behavior: 分成两个函数
     * 1. 扫描安装的插件，刷新插件列表和插件状态，然后刷新配置开关（因为config中插件的状态和实际插件的状态可能不一致）
     * 2. 根据配置的开关来启停插件
     * 
     */
    async getInstalledPlugins(): Promise<InstalledPlugin[]> {
        const config = await this.configService.getConfig();
        const installedPlugins = await Promise.all((await fs.promises.readdir(config.plugins.plugin_dir)).filter((dir) => {
            const packageJsonPath = path.join(config.plugins.plugin_dir, dir, "package.json");
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
        }).map((dir) => {
            const packageJsonPath = path.join(config.plugins.plugin_dir, dir, "package.json");
            const contnet = fs.readFileSync(packageJsonPath, "utf-8");
            const manifest = JSON.parse(contnet);
            if (config.plugins.enabled_plugins.includes(manifest.name)) {
                return {
                    manifest,
                    dir,
                    status: "enabled"
                } as InstalledPlugin
            } else {
                return {
                    manifest,
                    dir,
                    status: "disabled"
                } as InstalledPlugin
            }
        }));

        this.installedPlugins.clear();
        for (const plugin of installedPlugins) {
            this.installedPlugins.set(plugin.manifest.name, plugin);
            if (plugin.status === "enabled") {
                const pluginDir = path.join(config.plugins.plugin_dir, plugin.dir);
                await this.pluginService.isEnabled(plugin.manifest.name).then((enabled) => {
                    if (!enabled) {
                        this.pluginService.enablePlugin(plugin.manifest, pluginDir);
                    }
                });
            } else if (plugin.status === "disabled") {
                await this.pluginService.isEnabled(plugin.manifest.name).then((enabled) => {
                    if (enabled) {
                        this.pluginService.disablePlugin(plugin.manifest);
                    }
                });
            }
        }
        return installedPlugins;
    }

    async enablePlugin(plugin: PluginManifest): Promise<void> {
        const config = await this.configService.getConfig();
        const installedPlugin = this.installedPlugins.get(plugin.name);
        if (!installedPlugin) {
            throw new Error(`Plugin ${plugin.name} is not installed`);
        }
        const dir = installedPlugin.dir;
        const pluginDir = path.join(config.plugins.plugin_dir, dir);
        const operationPromise = this.pluginService.isEnabled(plugin.name).then((enabled) => {
            if (!enabled) {
                this.pluginService.enablePlugin(plugin, pluginDir);
            }
        });
        if (!config.plugins.enabled_plugins.includes(plugin.name)) {
            config.plugins.enabled_plugins.push(plugin.name);
            await this.configService.updateConfig(config);
        }
        await operationPromise;
    }

    async disablePlugin(plugin: PluginManifest): Promise<void> {
        if (!this.installedPlugins.has(plugin.name)) {
            throw new Error(`Plugin ${plugin.name} is not installed`);
        }
        const enabled = await this.pluginService.isEnabled(plugin.name);
        if (enabled) {
            await this.pluginService.disablePlugin(plugin);
        }
        await this.configService.getConfig().then((config) => {
            config.plugins.enabled_plugins = config.plugins.enabled_plugins.filter((name) => name !== plugin.name);
            return this.configService.updateConfig(config);
        });

    }

}