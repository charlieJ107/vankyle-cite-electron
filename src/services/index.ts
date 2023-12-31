/**
 * App 后台服务进程
 */
import { RPCMessage } from "@charliej107/vankyle-cite-rpc";
import { AppServiceManager } from "./AppServiceManager";
import { ConfigService } from "./ConfigService/ConfigService";
import { DatabaseService } from "./DatabaseService/DatabaseService";

const serviceManager = new AppServiceManager();
serviceManager.reigisterService("config-service", new ConfigService());
serviceManager.reigisterService("database-service", new DatabaseService());

process.parentPort.on("message", (event) => {
    const message = event.data as RPCMessage;
    console.log(`AppServiceProcess received message ${JSON.stringify(message)}`);
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


