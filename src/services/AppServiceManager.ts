import { MessagePortMain, MessageEvent, MessageChannelMain } from "electron";
import { IServiceManager, RPCMessage } from "@charliej107/vankyle-cite-rpc";
import { IAppService } from "./IAppService";


/**
 * @name AppServiceManager
 * @description
 * AppServiceManager 用于管理 App 的后台服务
 */
export class AppServiceManager implements IServiceManager<IAppService>{
    private whoami: string = "app-service-manager";
    private services: Map<string, IAppService>;
    private targets: Map<string, MessagePortMain>;
    constructor() {
        this.services = new Map<string, IAppService>();
        this.targets = new Map<string, MessagePortMain>();
        console.log('AppServiceManager initialized');
    }

    private async handleMessage(event: MessageEvent) {
        const message = event.data as RPCMessage;
        console.log(`AppServiceManager received message from ${message.header.from} \n Message: ${JSON.stringify(message)}`);
        if (!this.targets.has(message.header.from)) {
            console.warn(`AppServiceManager received message from unknown target ${message.header.from}`);
            return;
        }

        switch (message.header.type) {
            case "request":
                await this.handleRequest(message);
                break;
            case "response":
                this.handleResponse(message);
                break;
            default:
                throw new Error(`Unknown message type ${message.header.type}`);
                break;
        }
    }

    private handleResponse(_message: RPCMessage) {
        // TODO
        console.error("Method not implemented.");
        throw new Error("Method not implemented.");
    }

    private async handleRequest(message: RPCMessage) {
        switch (message.header.method) {
            case "get-service":
                await this.handleGetService(message);
                break;
            default:
                throw new Error(`Unknown method ${message.header.method}`);
                break;
        }
    }

    private async handleGetService(message: RPCMessage) {
        const service = this.services.get(message.header.service);
        if (!service || !service[message.header.method]) {
            const errorMessage: RPCMessage = {
                header: {
                    id: message.header.id,
                    type: "response",
                    from: this.whoami,
                    method: "get-service",
                    service: message.header.service,
                },
                body: {
                    error: "Service not found",
                },
            };
            this.targets.get(message.header.from)?.postMessage(errorMessage);
            return;
        }
        const { port1, port2 } = new MessageChannelMain();
        service.init(port1);
        const result = await service[message.header.method](...message.body);
        const response: RPCMessage = {
            header: {
                id: message.header.id,
                type: "response",
                from: this.whoami,
                method: message.header.method,
                service: message.header.service,
            },
            body: result,
        };
        this.targets.get(message.header.from)?.postMessage(response, [port2]);
    }

    public reigisterService(name: string, service: IAppService) {
        this.services.set(name, service);
    }

    public registerServiceProvider(name: string, target: MessagePortMain) {
        console.log(`AppServiceManager received service provider ${name}`);
        if (this.targets.has(name)) {
            console.warn(`AppServiceManager already has service provider ${name}`);
        }
        target.on("message", (e) => {
            console.log(`AppServiceManager received message from ${name}`);
            this.handleMessage(e)
        });
        target.on("close", () => {
            this.targets.delete(name);
        });
        this.targets.set(name, target);
    }

}