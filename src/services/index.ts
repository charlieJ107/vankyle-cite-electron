/**
 * App 后台服务进程
 */

import { RPCMessage } from "../common/rpc/IMessage";
import { AppServiceManager } from "./AppServiceManager";
import { ConfigService } from "./ConfigService/ConfigService";
import { DatabaseService } from "./DatabaseService/DatabaseService";

const serviceManager = new AppServiceManager();
process.parentPort.on("message", (message) => {
    console.log("AppServiceProcess.handle: " + JSON.stringify(message));
    const data = message.data as RPCMessage;
    switch (data.header.method) {
        case "init-rpc":
            const port = message.ports[0];
            const serviceManager = new AppServiceManager();
            serviceManager.init();
            break;
        default:
            break;
    }
});



serviceManager.reigisterService("ConfigService", new ConfigService());

const databaseService = new DatabaseService();
databaseService.initDefaultDatabases();
serviceManager.reigisterService("DatabaseService", databaseService);

