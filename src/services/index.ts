/**
 * App 后台服务进程
 */
import { RPCMessage } from "@charliej107/vankyle-cite-rpc";
import { AppServiceManager } from "./AppServiceManager";


const serviceManager = new AppServiceManager();
process.parentPort.on("message", (event) => {
    const message = event.data as RPCMessage;
    switch (message.header.method) {
        case "register-service":
            serviceManager.reigisterService(message.header.service, message.body);
            break;
        case "register-service-provider":
            const [port] = event.ports;
            serviceManager.registerServiceProvider(message.header.service, port);
            break;
        default:
            break;
    }
});


