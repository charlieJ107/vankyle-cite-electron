import { contextBridge, ipcRenderer } from "electron";
import { MessagePortRpcAgent } from "./common/rpc/MessagePortRpcAgent";
import { ServiceProvider } from "./services/ServiceProvider";
import { Paper } from "./models/paper";

const pluginServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    ipcRenderer.postMessage("REGISTER_AGENT", message, transfer as MessagePort[])
});

const serviceProvider = new ServiceProvider(pluginServiceAgent);

contextBridge.exposeInMainWorld("PluginAPI", {
    get Services() {
        return serviceProvider.getAppServices();
    },
    set onPaperDrop(func: (filePath: string) => Paper) {
        pluginServiceAgent.register("onPaperDrop", func);
    }
});
