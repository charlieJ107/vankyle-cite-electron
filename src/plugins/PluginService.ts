import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { BrowserWindow, app } from "electron";
import { PluginManifest } from "./PluginManifest";
import path from "path";

const ENABLE_PLUGIN = "pluginService.enablePlugin";
const DISABLE_PLUGIN = "pluginService.disablePlugin";
export class PluginServiceServer {
    private rpcAgent: IRpcAgent;
    private runningPlugins: Map<string, { window: BrowserWindow, manifest: PluginManifest }>;
    constructor(rpcAgent: IRpcAgent) {
        this.rpcAgent = rpcAgent;
        this.runningPlugins = new Map();
        this.rpcAgent.register(ENABLE_PLUGIN, (manifest: PluginManifest, dir: string) => {
            this.enablePlugin(manifest, dir);
        });
        this.rpcAgent.register(DISABLE_PLUGIN, (manifest: PluginManifest) => {
            this.disablePlugin(manifest);
        });
    }

    private async enablePlugin(manifest: PluginManifest, dir: string) {
        if (this.runningPlugins.has(manifest.name)) {
            console.warn(`Plugin ${manifest.name} already enabled`);
            return;
        }
        let browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
            show: false,
            webPreferences: {
                preload: "preload.js"
            }
        };
        if (manifest.browsers && manifest.browsers.window) {
            browserWindowOptions.show = true;
            browserWindowOptions.width = manifest.browsers.window.width;
            browserWindowOptions.height = manifest.browsers.window.height;
        }
        const window = new BrowserWindow(browserWindowOptions);
        window.loadFile(path.resolve(dir, "index.html"));
        this.runningPlugins.set(manifest.name, { manifest, window });

    }

    private async disablePlugin(manifest: PluginManifest) {
        const plugin = this.runningPlugins.get(manifest.name);
        if (!plugin) {
            console.warn(`Plugin ${manifest.name} not enabled`);
            return;
        }
        plugin.window.close();
        plugin.window.on("closed", () => {
            this.runningPlugins.delete(manifest.name);
        });
    }

}

export class PluginService {
    private rpcAgent: IRpcAgent;
    constructor(rpcAgent: IRpcAgent) {
        this.rpcAgent = rpcAgent;
    }

    async enablePlugin(manifest: PluginManifest, dir: string) {
        await this.rpcAgent.resolve(ENABLE_PLUGIN)(manifest, dir);
    }

    async disablePlugin(manifest: PluginManifest) {
        await this.rpcAgent.resolve<(manifest: PluginManifest)=>void>(DISABLE_PLUGIN)(manifest);
    }
}