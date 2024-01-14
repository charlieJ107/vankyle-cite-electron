import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { BrowserWindow, app } from "electron";
import { PluginManifest } from "./PluginManifest";
import path from "path";

const ENABLE_PLUGIN = "pluginService.enablePlugin";
const DISABLE_PLUGIN = "pluginService.disablePlugin";
const IS_ENABLED = "pluginService.isEnabled";
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

        this.rpcAgent.register(IS_ENABLED, (name: string) => {
            this.isEnabled(name);
        });
    }

    private async enablePlugin(manifest: PluginManifest, dir: string) {
        if (this.runningPlugins.has(manifest.name)) {
            console.warn(`Plugin ${manifest.name} already enabled, skip enable`);
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
            console.warn(`Plugin ${manifest.name} not enabled, skip disable`);
            return;
        }
        plugin.window.close();
        plugin.window.on("closed", () => {
            this.runningPlugins.delete(manifest.name);
        });
    }

    async isEnabled(name: string) {
        return this.runningPlugins.has(name);
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
        await this.rpcAgent.resolve<(manifest: PluginManifest) => Promise<void>>(DISABLE_PLUGIN)(manifest);
    }

    async isEnabled(name: string) {
        return await this.rpcAgent.resolve<(name: string) => Promise<boolean>>(IS_ENABLED)(name);
    }
}