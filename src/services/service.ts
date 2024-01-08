/**
 * @fileoverview Entrypoint of the service process.
 */
import { PaperService } from "./PaperService/PaperService";
import { DropService } from "./DropService/DropService";
import { MessagePortServiceManager } from "@/common/rpc/MessagePortServiceManager";
import { MessagePortServiceProvider } from "@/common/rpc/MessagePortServiceProvider";
import { REGISTER_SERVICE_PROVIDER } from "@/common/rpc/IMessage";

const ServiceManager = new MessagePortServiceManager();
const ServiceProvider = new MessagePortServiceProvider((message, transfer) => {
    if (message.channel === REGISTER_SERVICE_PROVIDER) {
        const [port] = transfer;
        ServiceManager.registerServiceProvider(message.payload, port);
    } else {
        console.warn("Invalid Service provider message channel: ", message);
    }
});
ServiceProvider.registerService("PaperService", PaperService);
ServiceProvider.registerService("DropService", DropService);

