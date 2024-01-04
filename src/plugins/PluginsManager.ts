import { BrowserWindow, UtilityProcess, app } from "electron";
import path from "path";
import { PluginManifest } from "./PluginManifest";
import { IProcessMessage } from "@/common/rpc/IRpcMessage";

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
            console.warn("Invalid message from service process: ", msg);
            return;
        }
        const message = msg as IProcessMessage;
        switch (message.chennel) {
            case "plugin-manager-request":
                switch (message.method) {
                    // TODO: respond to plugin service
                    case "startPlugin":
                        this.startPlugin(message.params.dir, message.params.manifest);
                        break;
                    case "stopPlugin":
                        const plugin = this.plugins.get(message.params.manifest.name);
                        if (plugin) {
                            plugin.close();
                            plugin.on("closed", () => {
                                this.plugins.delete(message.params.manifest.name);
                            });
                        }
                    case "showPlugin":
                        // TODO: show plugin
                        break;
                    case "hidePlugin":
                        // TODO: hide plugin
                        break;
                }
                break;
            default:
                console.warn("Invalid message from service process: ", msg);
                break;
        }
    }

    public startPlugin(dir: string, manifest: PluginManifest) {
        this.startHiddentPlugin(dir, manifest);
        // TODO: Support window / board / panel plugins
    }

    public startHiddentPlugin(dir: string, manifest: PluginManifest) {
        console.log("dir: ", dir, "manifest: ", manifest);
        if (this.plugins.has(manifest.name)) {
            console.warn(`Plugin ${manifest.name} is already running.`);
            return;
        }
        const plugin = new BrowserWindow({
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            },
        });
        const pluginIndex = path.join(dir, 'index.html');
        console.log("pluginIndex: ", pluginIndex);
        plugin.loadFile(pluginIndex);
        plugin.webContents.openDevTools();
        this.plugins.set(manifest.name, plugin);
    }
}