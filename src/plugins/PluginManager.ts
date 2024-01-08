import { BrowserWindow, app, ipcMain } from "electron";
import { PluginManifest } from "./PluginManifest";
import path from "path";

export class PluginManager {
    private runningPlugins: Map<string, { manifest: PluginManifest, window: BrowserWindow }>;
    constructor() {
        this.runningPlugins = new Map();
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

        window.loadFile(path.resolve(app.getAppPath(), "plugins", dir, "index.html"));
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