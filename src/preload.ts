// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";
import { REGISTER_AGENT } from "./common/rpc/IMessages";
import { ServiceProvider } from "./services/ServiceProvider";
import { DropService } from "./services/DropService/DropService";
import { Paper } from "./models/paper";

const appServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    ipcRenderer.postMessage(REGISTER_AGENT, message, transfer as MessagePort[]);
});

const serviceProvider = new ServiceProvider(appServiceAgent);
serviceProvider.whenServiceReady().then(() => {
    console.log("service provider ready");
    const dropService = new DropService(appServiceAgent);
    contextBridge.exposeInMainWorld("App", {
        get Services() {
            const services = serviceProvider.getAppServices();
            // DropService is a special case, because it is containing rpc agents
            services["DropService"] = {
                registerDropHandler: (handler: (filePaths: string[]) => Paper[]): void => {
                    dropService.registerDropHandler(handler);
                },
                handleDropEvent: (filePaths: string[]): void => {
                    dropService.handleDropEvent(filePaths);
                }
            }
            return services;
        }
    });
});