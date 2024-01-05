import { BrowserWindow, UtilityProcess, app } from "electron";
import path from "path";
import { IPluginManagerMessage, IProcessMessage } from "@/common/rpc/IRpcMessage";

export class PluginsManager {
    private plugins: Map<string, BrowserWindow>;
    private serviceProcess: UtilityProcess;
    constructor(serviceProcess: UtilityProcess) {
        this.plugins = new Map<string, BrowserWindow>();
        this.serviceProcess = serviceProcess;
        this.serviceProcess.on("message", (message) => {
            this.handleServiceProcessMessage(message);
        });
    }

    public handleServiceProcessMessage(msg: any) {
        if (!msg.chennel) {
            console.warn("Invalid message format from service process: ", msg);
            return;
        }
        const message = msg as IProcessMessage;
        switch (message.chennel) {
            case "plugin-manager-request":
                switch (message.method) {
                    // TODO: respond to plugin service
                    case "startPlugin":
                        this.startPlugin(message as IPluginManagerMessage);
                        break;
                    case "stopPlugin":
                        this.stopPlugin(message as IPluginManagerMessage);
                        break;
                    // TODO: Hide and show window / board / panel plugins
                    default:
                        console.warn("Invalid message method from service process,: ", msg);
                        break;
                }
                break;
            default:
                console.warn("Invalid message cannel from service process: ", msg);
                break;
        }
    }

    public startPlugin(message: IPluginManagerMessage) {
        this.startHiddentPlugin(message);
        // TODO: Support window / board / panel plugins
    }

    public stopPlugin(message: IPluginManagerMessage) {
        const plugin = this.plugins.get(message.params.manifest.name);
        if (plugin) {
            plugin.close();
            plugin.on("closed", () => {
                this.plugins.delete(message.params.manifest.name);
            });
            const responseMessage: IProcessMessage = {
                callId: message.callId,
                chennel: "plugin-manager-response",
                method: "stopPlugin",
                params: { manifest: message.params.manifest },
                result: "ok"
            };
            this.serviceProcess.postMessage(responseMessage);
        } else {
            const responseMessage: IProcessMessage = {
                callId: message.callId,
                chennel: "plugin-manager-response",
                method: "stopPlugin",
                params: { manifest: message.params.manifest },
                result: "error: Plugin not found"
            };
            this.serviceProcess.postMessage(responseMessage);
        }
    }

    private startHiddentPlugin(message: IPluginManagerMessage) {
        const manifest = message.params.manifest;
        if (this.plugins.has(manifest.name)) {
            console.warn(`Plugin ${manifest.name} is already running.`);
            const responseMessage: IProcessMessage = {
                callId: message.callId,
                chennel: "plugin-manager-response",
                method: "startPlugin",
                params: { manifest },
                result: "error: Plugin is already running."
            };
            this.serviceProcess.postMessage(responseMessage);
            return;
        }
        const plugin = new BrowserWindow({
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            },
        });
        const pluginIndex = path.join(message.params.dir, 'index.html');
        plugin.loadFile(pluginIndex);
        plugin.webContents.openDevTools();
        this.plugins.set(manifest.name, plugin);
        const responseMessage: IProcessMessage = {
            callId: message.callId,
            chennel: "plugin-manager-response",
            method: "startPlugin",
            params: { manifest },
            result: "ok"
        };
        this.serviceProcess.postMessage(responseMessage);
    }
}