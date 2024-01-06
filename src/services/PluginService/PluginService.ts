import { IRpcMessage } from "@/common/rpc/IMessage";
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
    }>;
    private pendingCalls: Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>;
    constructor(config: IConfig) {
        this.cofnig = config;
        // create config.plugins.plugin_dir if not exists
        if (!fs.existsSync(this.cofnig.plugins.plugin_dir)) {
            fs.mkdirSync(this.cofnig.plugins.plugin_dir);
        }
        this.plugins = new Map();
        this.pendingCalls = new Map();
    }

    getPlugins = async (): Promise<IPlugin[]> => {
        if (this.plugins.size > 0) {
            return Array.from(this.plugins.values()).map((plugin) => {
                return {
                    manifest: plugin.manifest,
                    status: plugin.status.running ? "enabled" : "disabled",
                } as IPlugin;
            });
        }
        // Find any package.json files in the subdirectories of the plugins directory

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
            return {
                manifest,
                dir,
                status: {
                    running: false,
                    visible: false,
                },
            };
        }));

        for (const plugin of installedPlugins) {
            if (this.cofnig.plugins.enabled_plugins.includes(plugin.manifest.name)) {
                await this.enablePlugin(plugin.manifest);
                this.plugins.set(plugin.manifest.name, {
                    ...plugin,
                    status: {
                        ...plugin.status,
                        running: true,
                    }
                });
            } else {
                this.plugins.set(plugin.manifest.name, plugin);
            }
        }

        return Array.from(this.plugins.values()).map((plugin) => {
            return {
                manifest: plugin.manifest,
                status: plugin.status.running ? "enabled" : "disabled",
            } as IPlugin;
        });
    };

    enablePlugin = async (manifest: PluginManifest) => {
        return new Promise((resolve, reject) => {
            const callId = Date.now();
            this.pendingCalls.set(callId, { resolve, reject });
            const plugin = this.plugins.get(manifest.name);
            if (!plugin) {
                console.error("Plugin not found", manifest);
                return "error";
            }
            const startPluginMessage: IRpcMessage = {
                id: callId,
                type: "RPC",
                direction: "REQUEST",
                method: "startPlugin",
                params: { manifest: plugin.manifest, dir: path.join(this.cofnig.plugins.plugin_dir, plugin.dir) },
            };
            process.parentPort.postMessage(startPluginMessage);
        });
    }

    disablePlugin = async (manifest: PluginManifest) => {
        return new Promise((resolve, reject) => {
            const callId = Date.now();
            this.pendingCalls.set(callId, { resolve, reject });
            const plugin = this.plugins.get(manifest.name);
            if (!plugin) {
                console.error("Plugin not found", manifest);
                return "error";
            }
            const stopPluginMessage: IProcessMessage = {
                callId,
                chennel: "plugin-manager-request",
                method: "stopPlugin",
                params: { manifest },
            };
            process.parentPort.postMessage(stopPluginMessage);
        });
    }

    handlePluginManagerResponse = (message: IPluginManagerMessage) => {
        const call = this.pendingCalls.get(message.callId);
        switch (message.chennel) {
            case "plugin-manager-response":
                switch (message.method) {
                    case "startPlugin":
                        this.startPluginCallback(message, call);
                        break;
                    case "stopPlugin":
                        this.stopPluginCallback(message, call);
                        break;
                    default:
                        throw new Error(`Unknown method ${message.method}`);
                }
                break;
            default:
                throw new Error(`Unknown channel ${message.chennel}`);
        }
    }

    private startPluginCallback(message: IPluginManagerMessage, call: { resolve: (value: any) => void, reject: (reason: any) => void }) {
        if (message.result === "ok") {
            const plugin = this.plugins.get(message.params.manifest.name);
            if (plugin) {
                if (plugin.status.running) {
                    console.warn("Plugin is already running", plugin);
                    call.resolve("Plugin is already running");
                } else {
                    this.plugins.set(message.params.manifest.name, {
                        ...plugin,
                        status: {
                            ...plugin.status,
                            running: true,
                        },
                    });
                    call.resolve("ok");
                }
            } else {
                call.reject("Plugin not found when ");
            }
        } else {
            call.reject(message.result);
        }
    }

    private stopPluginCallback(message: IPluginManagerMessage, call: { resolve: (value: any) => void, reject: (reason: any) => void }) {
        if (message.result === "ok") {
            const plugin = this.plugins.get(message.params.manifest.name);
            if (plugin) {
                if (plugin.status.running) {
                    this.plugins.set(message.params.manifest.name, {
                        ...plugin,
                        status: {
                            ...plugin.status,
                            running: false,
                        },
                    });
                    call.resolve("ok");
                } else {
                    console.warn("Plugin is already stopped", plugin);
                    call.resolve("Plugin is already stopped");
                }
            } else {
                call.reject("Plugin not found");
            }
        } else {
            call.reject(message.result);
        }
    }




}