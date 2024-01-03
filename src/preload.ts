// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from "electron";
import { RpcFactory } from "./common/rpc/RpcFactory";

const AppServiceProvider = RpcFactory.createServiceProvider();


AppServiceProvider.getServices().then(services => {
    contextBridge.exposeInMainWorld("AppServices", services);
});