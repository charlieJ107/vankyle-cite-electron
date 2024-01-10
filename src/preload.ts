// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";
import { REGISTER_AGENT } from "./common/rpc/IMessages";

const appServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    ipcRenderer.postMessage(REGISTER_AGENT, message, transfer as MessagePort[]);
});
const appService = {
    PaperService: {
        getAllPapers: async () => {
            const func = await appServiceAgent.resolve("getAllPapers");
            return await func();
        }
    }
};
// TODO: Add proxied service
contextBridge.exposeInMainWorld("AppServices", appService)