// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MessagePortServiceProvider } from "./common/rpc/MessagePortServiceProvider";
import { REGISTER_SERVICE_PROVIDER } from "./common/rpc/IMessage";

const AppServiceProvider = new MessagePortServiceProvider((message, transfer) => {
    ipcRenderer.postMessage(REGISTER_SERVICE_PROVIDER, message, transfer as MessagePort[]);
});

AppServiceProvider.getServices().then(services => {
    console.log("AppServices: ", services);
    contextBridge.exposeInMainWorld("AppServices", services);
});