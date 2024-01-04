import { IProcessMessage, IRpcMessage } from "@/common/rpc/IRpcMessage";
import { IConfig } from "@/data/config/IConfig";
import { PluginManifest, isValidPluginManifest } from "@/plugins/PluginManifest";
import fs from "fs";
import path from "path";

export class PluginService {
    private cofnig: IConfig;
    private plugins: Map<string, {
        manifest: PluginManifest, status: {
            running: boolean,
            visible: boolean,
        }
    }> = new Map();
    constructor(config: IConfig) {
        this.cofnig = config;
    }

    getInstalledPlugins = () => {
        // Find any package.json files in the subdirectories of the plugins directory
        const installedPluginsManifest = fs.readdirSync(this.cofnig.plugins.plugin_dir).filter((dir) => {
            const packageJsonPath = path.join(this.cofnig.plugins.plugin_dir, dir, "package.json");
            try {
                const valid = fs.existsSync(packageJsonPath) &&
                    // Only include directories that contain a valid package.json file
                    isValidPluginManifest(JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")));
                return valid;
            } catch (e) {
                console.warn(`Failed to read plugin manifest at ${packageJsonPath}`, e);
                return false;
            }
        }).map((dir) => {
            const packageJsonPath = path.join(this.cofnig.plugins.plugin_dir, dir, "package.json");
            const manifest = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            return manifest as PluginManifest;
        });
        return installedPluginsManifest;
    }

    enablePlugin = (manifest: PluginManifest) => {
        const startPluginMessage: IProcessMessage = {
            chennel: "plugin-manager-request",
            method: "startPlugin",
            params: { manifest, dir: this.cofnig.plugins.plugin_dir },
        };
        process.parentPort.postMessage(startPluginMessage);
    }

    disablePlugin = (manifest: PluginManifest) => {
        const stopPluginMessage: IProcessMessage = {
            chennel: "plugin-manager-request",
            method: "stopPlugin",
            params: { manifest },
        };
        process.parentPort.postMessage(stopPluginMessage);
    }

    handlePluginManagerResponse = (message: IProcessMessage) => {
        switch (message.chennel) {
            case "plugin-manager-response":
                switch (message.method) {
                    case "startPlugin":
                        const plugin = this.plugins.get(message.params.manifest.name);
                        if (plugin) {
                            plugin.status.running = true;
                        } else {
                            this.plugins.set(message.params.manifest.name, {
                                manifest: message.params.manifest,
                                status: {
                                    running: true,
                                    visible: true,
                                },
                            });
                        }
                        break;
                    case "stopPlugin":
                        const plugin2 = this.plugins.get(message.params.manifest.name);
                        if (plugin2) {
                            plugin2.status.running = false;
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