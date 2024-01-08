// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MessagePortServiceProvider } from "./common/rpc/MessagePortServiceProvider";
import { REGISTER_SERVICE_PROVIDER } from "./common/rpc/IMessage";
import { IAppService, IService } from "./services/IService";

const AppServiceProvider = new MessagePortServiceProvider((message, transfer) => {
    ipcRenderer.postMessage(REGISTER_SERVICE_PROVIDER, message, transfer as MessagePort[]);
});

contextBridge.exposeInMainWorld("ServiceProvider", {

    AppServices: (): IAppService => AppServiceProvider.AppServices(),

    registerService(name: string, service: new (...args: (IService | undefined)[]) => IService) {
        AppServiceProvider.registerService(name, service);
    }

});