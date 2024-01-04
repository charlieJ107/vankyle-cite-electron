import { BrowserWindow, UtilityProcess } from "electron";
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
            case "plugin-manager-response":
                switch (message.method) {
                    case "startPlugin":
                        this.startPlugin(message.params.dir, message.params.manifest);
                        break;
                    case "stopPlugin":
                        this.plugins.get(message.params.manifest.name)?.close();
                    case "showPlugin":
                        break;
                    case "hidePlugin":
                        break;
                }
                break;
        }
    }

    public startPlugin(dir: string, manifest: PluginManifest) {
        this.startHiddentPlugin(dir, manifest);
        // TODO: Support window / board / panel plugins
    }

    public startHiddentPlugin(dir: string, manifest: PluginManifest) {
        const plugin = new BrowserWindow({
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            },
        });
        plugin.loadFile(path.join(dir, 'index.html'));
        this.plugins.set(manifest.name, plugin);
    }
}