import { MessagePortMain, ipcMain } from "electron";
import { ServiceProviderInitRequest, ServiceProviderInitResponse } from "./IRpcMessage";
import { IServiceRegistry } from "./IServiceRegistry";

export class MessagePortServiceRegistry implements IServiceRegistry{
    private serviceManagers: Map<string, (message: any, port: MessagePortMain[]) => void>;
    constructor() {
        this.serviceManagers = new Map();
        ipcMain.on("request-init-service-provider", (event, message: ServiceProviderInitRequest) => {
            const [port] = event.ports;
            if (!port) {
                throw new Error("No port in event");
            }
            const postMessage = this.serviceManagers.get(message.serviceManager);
            if (!postMessage) {
                event.reply("init-service-provider-response", {
                    chennel: "init-service-provider-response",
                    serviceManager: message.serviceManager,
                    port: null,
                } as ServiceProviderInitResponse);
                return;
            }
            postMessage(message, [port]);
        });
    }

    public registerServiceManager(serviceName: string, postMessage: (message: any, port: MessagePortMain[]) => void): void {
        if (this.serviceManagers.has(serviceName)) {
            throw new Error(`Service ${serviceName} already registered`);
        }
        this.serviceManagers.set(serviceName, postMessage);
    }
}