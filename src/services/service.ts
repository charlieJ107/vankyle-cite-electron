/**
 * @fileoverview Entrypoint of the service process.
 */
import { PaperService } from "./PaperService/PaperService";
import { DropService } from "./DropService/DropService";
import { MessagePortServiceManager } from "@/common/rpc/MessagePortServiceManager";
import { MessagePortServiceProvider } from "@/common/rpc/MessagePortServiceProvider";
import { REGISTER_SERVICE_PROVIDER } from "@/common/rpc/IMessage";
import { JsonFileDatabase } from "@/data/database/local/JsonFileDatabase";
import { Paper } from "@/models/paper";
import path from "path";

const ServiceManager = new MessagePortServiceManager();
const ServiceProvider = new MessagePortServiceProvider((message, transfer) => {
    if (message.channel === REGISTER_SERVICE_PROVIDER) {
        const [port] = transfer;
        ServiceManager.registerServiceProvider(message.payload, port);
    } else {
        console.warn("Invalid Service provider message channel: ", message);
    }
});

const paperDatabase = new JsonFileDatabase<Paper>(path.join(__dirname, "data.json"));

ServiceProvider.registerService("PaperService", new PaperService(paperDatabase));
ServiceProvider.registerService("DropService", new DropService());

