// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";
import { REGISTER_AGENT } from "./common/rpc/IMessages";
import { ServiceProvider } from "./services/ServiceProvider";

const appServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    ipcRenderer.postMessage(REGISTER_AGENT, message, transfer as MessagePort[]);
});

const serviceProvider = new ServiceProvider(appServiceAgent);
console.log(serviceProvider.getAppServices());
contextBridge.exposeInMainWorld("App", {
    get Services() {
        const services = serviceProvider.getAppServices();
        console.log("getting services: ", services);
        return services;
    }
});