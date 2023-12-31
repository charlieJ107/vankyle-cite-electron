import { contextBridge, ipcRenderer } from "electron";
import { PluginServiceProvider } from "./PluginServiceProvider";

declare global {
    interface Window {
        PluginServiceProvider: PluginServiceProvider
    }
}

const pluginServiceProvider = new PluginServiceProvider();

ipcRenderer.on('init-service-provider', (e) => {
    const [port] = e.ports;
    pluginServiceProvider.init(port);
});

contextBridge.exposeInMainWorld('PluginServiceProvider', pluginServiceProvider);