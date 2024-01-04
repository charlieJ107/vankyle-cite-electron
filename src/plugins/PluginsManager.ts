import { BrowserWindow, ipcMain } from "electron";
import path from "path";

export class PluginsProcessManager {
    private plugins: Map<string, BrowserWindow>;
    constructor() {
        this.plugins = new Map<string, BrowserWindow>();
        ipcMain.on("plugin-start", (event, pluginPath) => {
            this.startPlugin(pluginPath as string);
        });
    }

    public scanPlugins() {
    }

    public startPlugin(pluginPath: string) {
        const plugin = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
                
            },
        });
        plugin.loadFile(path.join(pluginPath, 'index.html'));
        this.plugins.set(pluginPath, plugin);
    }
}