// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";
import { REGISTER_AGENT } from "./common/rpc/IMessages";
import { ServiceProvider } from "./services/ServiceProvider";
import { DropService } from "./services/DropService/DropService";

const appServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    ipcRenderer.postMessage(REGISTER_AGENT, message, transfer as MessagePort[]);
});

const serviceProvider = new ServiceProvider(appServiceAgent);

serviceProvider.registerServiceClient("DropService", () => new DropService(appServiceAgent));
serviceProvider.waitForServices(
    "FileSystemService",
    "ConfigService",
    "PluginManager",
    "DropService",
    "PaperService"
).then(() => {
    contextBridge.exposeInMainWorld("App", {
        get Services() {
            return serviceProvider.getAppServices();
        }
    });
});
