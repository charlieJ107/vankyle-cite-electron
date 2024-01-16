import { MessagePortMain, ipcMain, utilityProcess } from "electron";
import { REGISTER_AGENT } from "../rpc/IMessages";
import { createAppWindow } from "./app-window";
import { PluginService, PluginServiceServer } from "@/plugins/PluginService";
import { MessagePortRpcAgent } from "../rpc/MessagePortRpcAgent";
import { ServiceProvider } from "@/services/ServiceProvider";
import { FileSystemService } from "@/main/services/FileSystemService";
import path from "path";
import { PluginManager } from "@/services/PluginManager/PluginManager";

export function init() {

    const serviceProcess = utilityProcess.fork(path.resolve(__dirname, "service.js"));
    ipcMain.on(REGISTER_AGENT, (event, message) => {
        // Just forward the message to the service process to reduce the complexity of the main process
        serviceProcess.postMessage(message, event.ports);
    });
    const rpcAgent = new MessagePortRpcAgent((message, transfer) => { serviceProcess.postMessage(message, transfer as MessagePortMain[]) });
    const serviceProvider = new ServiceProvider(rpcAgent);
    const pluginServer = new PluginServiceServer(rpcAgent);
    serviceProvider.registerServiceServer("PluginService", pluginServer);
    serviceProvider.registerService("FileSystemService", new FileSystemService());
    serviceProvider.registerPrivateServiceClient("PluginService", () => new PluginService(rpcAgent))
    // Show the app window as soon as possible
    const mainWindow = createAppWindow();
    mainWindow.on("closed", () => {
        pluginServer.disableAllPlugins();
    })

    // TODO: Initialize services and provider

    // * Initialize System Service
    // * Initialize Service Provider
    // * Register Service
}