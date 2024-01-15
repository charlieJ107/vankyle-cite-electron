import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { BrowserWindow, app } from "electron";
import { PluginManifest } from "./PluginManifest";
import path from "path";
import fs from "fs";

const ENABLE_PLUGIN = "pluginService.enablePlugin";
const DISABLE_PLUGIN = "pluginService.disablePlugin";
const IS_ENABLED = "pluginService.isEnabled";
export class PluginServiceServer {
    private rpcAgent: IRpcAgent;
    private runningPlugins: Map<string, { window: BrowserWindow, manifest: PluginManifest }>;
    constructor(rpcAgent: IRpcAgent) {
        this.rpcAgent = rpcAgent;
        this.runningPlugins = new Map();
        this.rpcAgent.register(ENABLE_PLUGIN, (manifest: PluginManifest, dir: string) => this.enablePlugin(manifest, dir));
        this.rpcAgent.register(DISABLE_PLUGIN, (manifest: PluginManifest) => this.disablePlugin(manifest));
        this.rpcAgent.register(IS_ENABLED, (name: string) => this.isEnabled(name));
    }

    private async enablePlugin(manifest: PluginManifest, dir: string) {
        if (this.runningPlugins.has(manifest.name)) {
            console.warn(`Plugin ${manifest.name} already enabled, skip enable`);
            return;
        }
        let browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        };
        if (manifest.show && manifest.show.window) {
            browserWindowOptions.show = true;
            browserWindowOptions.width = manifest.show.window.width;
            browserWindowOptions.height = manifest.show.window.height;
        }
        let loadFile = path.join(dir, "index.html");
        if (manifest.main) {
            if (manifest.main.endsWith(".html")) {
                loadFile = path.join(dir, manifest.main);
            } else if (manifest.main.endsWith(".js")) {
                const jsContent = fs.readFileSync(path.join(dir, manifest.main), "utf-8");
                const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${manifest.name}</title></head><body><script>${jsContent}</script></body></html>`;
                fs.writeFileSync(loadFile, htmlContent);
            } else {
                console.warn(`Plugin ${manifest.name} main is not html or js, skip enable`);
                return;
            }
        } else {
            if (!fs.existsSync(path.join(dir, "index.html"))) {
                console.warn(`Plugin ${manifest.name} does not have index.html, skip enable`);
                return;
            }
        }

        const window = new BrowserWindow(browserWindowOptions);
        window.loadFile(loadFile);

        // if in dev mode, open dev tools
        if (process.env.NODE_ENV === "development") {
            window.webContents.openDevTools();
        }

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
        const isEnabledFunc = await this.rpcAgent.resolve<(name: string) => Promise<boolean>>(IS_ENABLED);
        return await isEnabledFunc(name);
    }
}