import { utilityProcess } from "electron";
import { createAppWindow } from "./app-window";
import { APP_SERVICE_MANAGER } from "./constrants";
import path from "path";
import { RpcFactory } from "../rpc/RpcFactory";

export function init() {
    const serviceReigistry = RpcFactory.createServiceRegistry();

    const serviceProcess = utilityProcess.fork(path.resolve(__dirname, "service.js"));
    
    // Service managers must be registered before any service providers are initialized
    serviceReigistry.registerServiceManager(
        APP_SERVICE_MANAGER,
        (message, ports) => serviceProcess.postMessage(message, ports)
    );
    
    createAppWindow();
}