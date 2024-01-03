import { utilityProcess } from "electron";
import { createAppWindow } from "./app-window";
import { APP_SERVICE_MANAGER } from "./constrants";
import path from "path";
import { RpcFactory } from "../rpc/RpcFactory";

export function init() {
    const serviceReigistry = RpcFactory.createServiceRegistry();

    const serviceProcess = utilityProcess.fork(path.resolve(__dirname, "service.js"));
    serviceReigistry.registerServiceManager(
        APP_SERVICE_MANAGER,
        (message, ports) => serviceProcess.postMessage(message, ports)
    );
    
    const mainWindow = createAppWindow();
}