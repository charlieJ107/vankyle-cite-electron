import { utilityProcess } from "electron";
import { createAppWindow } from "./app-window";
import { APP_SERVICE_MANAGER } from "./constrants";
import { RpcFactory } from "../rpc/RpcFactory";
import { PluginsManager } from "@/plugins/PluginsManager";
import path from "path";

export function init() {
    const serviceReigistry = RpcFactory.createServiceRegistry();

    const serviceProcess = utilityProcess.fork(path.resolve(__dirname, "service.js"));

    // Service managers must be registered before any service providers are initialized
    serviceReigistry.registerServiceManager(
        APP_SERVICE_MANAGER,
        (message, ports) => serviceProcess.postMessage(message, ports)
    );

    const pluginsManager = new PluginsManager(serviceProcess);

    createAppWindow();
}