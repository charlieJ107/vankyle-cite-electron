import { IProcessMessage } from "@/common/rpc/IRpcMessage";
import { IConfig } from "@/data/config/IConfig";
import { IPlugin, PluginManifest, isValidPluginManifest } from "@/plugins/PluginManifest";
import fs from "fs";
import path from "path";

export class PluginService {
    private cofnig: IConfig;
    private plugins: Map<string, {
        manifest: PluginManifest,
        dir: string,
        status: {
            running: boolean,
            visible: boolean,
        }
    }> = new Map();
    constructor(config: IConfig) {
        this.cofnig = config;
        // create config.plugins.plugin_dir if not exists
        if (!fs.existsSync(this.cofnig.plugins.plugin_dir)) {
            fs.mkdirSync(this.cofnig.plugins.plugin_dir);
        }
    }

    getPlugins = async (): Promise<IPlugin[]> => {
        return new Promise((resolve, _reject) => {
            // Find any package.json files in the subdirectories of the plugins directory
            const installedPlugins = fs.readdirSync(this.cofnig.plugins.plugin_dir).filter((dir) => {
                const packageJsonPath = path.join(this.cofnig.plugins.plugin_dir, dir, "package.json");
                try {
                    const valid = fs.existsSync(packageJsonPath) &&
                        // Only include directories that contain a valid package.json file
                        isValidPluginManifest(JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")));
                    if (!valid) {
                        console.warn(`Invalid plugin manifest at ${packageJsonPath}`);
                    }
                    return valid;
                } catch (e) {
                    console.warn(`Failed to read plugin manifest at ${packageJsonPath}`, e);
                    return false;
                }
            }).map((dir) => {
                const packageJsonPath = path.join(this.cofnig.plugins.plugin_dir, dir, "package.json");
                const manifest = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
                return {
                    manifest,
                    dir,
                    status: {
                        running: false,
                        visible: false,
                    },
                }
            });

            for (const plugin of installedPlugins) {
                this.plugins.set(plugin.manifest.name, plugin);
            }

            console.log("installedPlugins", installedPlugins);

            resolve(installedPlugins.map((plugin) => {
                if (this.cofnig.plugins.enabled_plugins.includes(plugin.manifest.name)) {
                    process.parentPort.postMessage({
                        chennel: "plugin-manager-request",
                        method: "startPlugin",
                        params: { manifest: plugin.manifest, dir: plugin.dir },
                    });
                    return {
                        manifest: plugin.manifest,
                        status: "enabled"
                    } as IPlugin;
                }
                return {
                    manifest: plugin.manifest,
                    status: "disabled"
                } as IPlugin;
            }));
        });
    }

    enablePlugin = async (manifest: PluginManifest) => {
        const plugin = this.plugins.get(manifest.name);
        if (!plugin) {
            console.error("Plugin not found", manifest);
            return "error";
        }
        const startPluginMessage: IProcessMessage = {
            chennel: "plugin-manager-request",
            method: "startPlugin",
            params: { manifest: plugin.manifest, dir: path.join(this.cofnig.plugins.plugin_dir, plugin.dir) },
        };
        process.parentPort.postMessage(startPluginMessage);
        // TODO: get response from plugin manager
        return "ok";
    }

    disablePlugin = async (manifest: PluginManifest) => {
        console.log("disablePlugin", manifest);
        const stopPluginMessage: IProcessMessage = {
            chennel: "plugin-manager-request",
            method: "stopPlugin",
            params: { manifest },
        };
        process.parentPort.postMessage(stopPluginMessage);
        // TODO: Get response from plugin manager
        return "ok";
    }

    handlePluginManagerResponse = (message: IProcessMessage) => {
        switch (message.chennel) {
            case "plugin-manager-response":
                switch (message.method) {
                    case "startPlugin":
                        if (message.result === "ok") {
                            const plugin = this.plugins.get(message.params.manifest.name);
                            if (plugin) {
                                plugin.status.running = true;
                            } else {
                                this.plugins.set(message.params.manifest.name, {
                                    ...plugin,
                                    status: {
                                        running: true,
                                        visible: true,
                                    },
                                });
                            }
                        } else {
                            console.error("Failed to start plugin", message);
                        }
                        break;
                    case "stopPlugin":
                        if (message.result === "ok") {
                            const plugin = this.plugins.get(message.params.manifest.name);
                            if (plugin) {
                                plugin.status.running = false;
                            }
                        } else {
                            console.error("Failed to stop plugin", message);
                        }
                        break;
                    default:
                        throw new Error(`Unknown method ${message.method}`);
                }
                break;
            default:
                throw new Error(`Unknown channel ${message.chennel}`);
        }
    }


}