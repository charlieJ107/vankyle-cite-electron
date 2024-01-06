import { MessageChannelMain, MessagePortMain } from "electron";
import { IServiceInfo, REGISTER_SERVICE_PROVIDER, isIpcMessage } from "./../rpc/IMessage";
import { IAppService, IService } from "@/services/IService";
import { IIpcMessage, IRpcMessage, REQUEST_SERVICE_LIST, isRpcMessage } from "./IMessage";

/**
 * MessagePortServiceProvider
 * 基于MessagePort的ServiceProvider，运行在任何需要提供或者消费Service的Process中
 * 它的职责是，注册自己提供的Service，以及处理来自其他Process的Service请求
 */
export class MessagePortServiceProvider {
    private managerPort: MessagePort | MessagePortMain | null; // MessagePort to ServiceManager
    private localService: Map<string, IService>; // Local registered Service
    private remoteService: Map<string, IService>; // Remote Service
    private pendingCalls: Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>;
    private postIpcMessage: (message: IIpcMessage, transfer?: MessagePortMain[] | MessagePort[]) => void;
    private providerId: string;
    public AppServices: IAppService;
    constructor(postIpcMessage: (message: IIpcMessage, transfer: MessagePortMain[] | MessagePort[]) => void) {
        this.localService = new Map();
        this.managerPort = null;
        this.postIpcMessage = postIpcMessage;
        this.providerId = `${process.type}-${process.pid}`;
        this.AppServices = {};
        this.remoteService = new Map();
        this.pendingCalls = new Map();

        const registerServiceProviderMessage: IIpcMessage = {
            id: Date.now() + Math.floor(Math.random() * 10),
            type: "IPC",
            direction: "REQUEST",
            channel: REGISTER_SERVICE_PROVIDER,
            payload: this.providerId,
        };
        switch (process.type) {
            case "renderer":
            case "worker":
            case "utility":
                const channel = new MessageChannel();
                this.managerPort = channel.port1;
                this.managerPort.onmessage = (messageEvent) => { this.onManagerMessage(messageEvent); }
                this.postIpcMessage(registerServiceProviderMessage, [channel.port2]);
                break;
            case "browser":
                const channelMain = new MessageChannelMain();
                this.managerPort = channelMain.port1;
                this.managerPort.on("message", (messageEvent) => { this.onManagerMessage(messageEvent); })
                this.postIpcMessage(registerServiceProviderMessage, [channelMain.port2]);
                break;
            default:
                throw new Error("Invalid process type");
                break;
        }
    }


    public registerService(serviceName: string, service: IService) {
        this.localService.set(serviceName, service);
    }


    public async getServices(): Promise<IAppService> {
        const requestServiceListMessage: IIpcMessage = {
            id: Date.now() + Math.floor(Math.random() * 10),
            type: "IPC",
            direction: "REQUEST",
            channel: REQUEST_SERVICE_LIST,
            payload: this.providerId,
        };
        const remoteServiceList = await new Promise<IServiceInfo[]>((resolve, reject) => {
            console.log("Requesting service list from manager, message: ", requestServiceListMessage);
            this.managerPort.postMessage(requestServiceListMessage);
            this.pendingCalls.set(requestServiceListMessage.id, { resolve, reject });
        });

        // Local service
        for (const [service, instance] of this.localService) {
            const proxiedLocalServiceInstant: IService = {};
            const methods = this.getServiceInstanceMethodList(instance);
            for (const method of methods) {
                proxiedLocalServiceInstant[method] = (...args: any[]) => {
                    return instance[method](...args);
                }
            }
            this.AppServices[service] = proxiedLocalServiceInstant;
        }
        // Remote service
        for (const serviceInfo of remoteServiceList) {
            const { service, providerId, methods } = serviceInfo;

            const remoteService: IService = {};
            for (const method of methods) {
                remoteService[method] = (...args: any[]) => {
                    return this.callRemote(providerId, service, method, ...args);
                }
            }
            this.remoteService.set(service, remoteService);
            this.AppServices[service] = remoteService;
        }
        return this.AppServices;
    }


    private async onManagerMessage(event: MessageEvent | Electron.MessageEvent) {
        if (isRpcMessage(event.data)) {
            const { direction } = event.data;
            switch (direction) {
                case "REQUEST":
                    await this.handleRpcRequest(event.data);
                    break;
                case "RESPONSE":
                    this.handleRpcResponse(event.data);
                    break;
                default:
                    console.warn("Invalid message direction: ", direction);
                    break;
            }
        } else if (isIpcMessage(event.data)) {
            const { direction } = event.data;
            switch (direction) {
                case "REQUEST":
                    this.handleIpcRequest(event.data);
                    break;
                case "RESPONSE":
                    this.handleIpcResponse(event.data);
                    break;
                default:
                    console.warn("Invalid message direction: ", direction);
                    break;
            }
        } else {
            console.warn("Invalid message received: ", event.data);
            return;
        }
    }

    private async handleRpcRequest(message: IRpcMessage) {
        const { service, method, payload, id, from, to } = message;
        if (to !== this.providerId || !this.localService.has(service)) {
            console.warn("Wrong provider. requesting message: ", message);
            const responseMessage: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                from: this.providerId,
                to: from,
                service,
                method,
                payload: new Error("Service not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        const serviceInstance = this.localService.get(service);
        if (!serviceInstance) {
            console.warn("Service instance not found: ", service);
            const responseMessage: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                from: this.providerId,
                to: from,
                service,
                method,
                payload: new Error("Service instance not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        if (!serviceInstance[method] && typeof serviceInstance[method] !== "function") {
            console.warn("Method not found: ", method);
            const responseMessage: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                from: this.providerId,
                to: from,
                service,
                method,
                payload: new Error("Method not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        // Calling local service method
        const result = await serviceInstance[method](...payload);
        const responseMessage: IRpcMessage = {
            id,
            type: "RPC",
            direction: "RESPONSE",
            from: this.providerId,
            to: from,
            service,
            method,
            payload: result,
        };
        this.managerPort.postMessage(responseMessage);
    }

    private handleRpcResponse(message: IRpcMessage) {
        const { id, payload } = message;
        if (!this.pendingCalls.has(id)) {
            console.warn("Pending call not found for RPC response message: ", message);
            return;
        }
        const { resolve, reject } = this.pendingCalls.get(id) as { resolve: (value: any) => void, reject: (reason: any) => void };
        if (payload instanceof Error) {
            reject(payload);
        } else {
            resolve(payload);
        }
    }

    private handleIpcResponse(message: IIpcMessage) {
        console.log("IPC response message: ", message);
        const { channel, payload, id } = message;
        switch (channel) {
            case REQUEST_SERVICE_LIST:
                const request = this.pendingCalls.get(id);
                if (!request) {
                    console.warn("No pending request found for IPC message: ", message);
                    return;
                }
                this.pendingCalls.delete(id);
                if (payload instanceof Error) {
                    request.reject(payload);
                } else {
                    request.resolve(payload);
                }
                break;
            default:
                console.warn("Invalid channel: ", channel);
                break;
        }
    }

    private handleIpcRequest(message: IIpcMessage) {
        const { channel, payload, id } = message;
        switch (channel) {
            case REQUEST_SERVICE_LIST:
                if (payload !== this.providerId) {
                    console.warn("Wrong provider id: ", payload);
                    return;
                }
                const serviceList: IServiceInfo[] = [];

                for (const [name, instance] of this.localService) {
                    serviceList.push({
                        service: name,
                        providerId: this.providerId,
                        methods: this.getServiceInstanceMethodList(instance),
                    });
                }
                const responseMessage: IIpcMessage = {
                    id,
                    type: "IPC",
                    direction: "RESPONSE",
                    channel,
                    payload: serviceList,
                };
                this.managerPort.postMessage(responseMessage);
                break;
            default:
                console.warn("Invalid channel: ", channel);
                break;
        }
    }

    private callRemote(providerId: string, service: string, method: string, ...args: any[]): Promise<any> {
        if (!this.managerPort) {
            throw new Error("ServiceManager not initialized");
        }
        // Calling remote service
        const id = Date.now();
        const message: IRpcMessage = {
            id,
            type: "RPC",
            direction: "REQUEST",
            from: this.providerId,
            to: providerId,
            service,
            method,
            payload: args,
        };
        return new Promise((resolve, reject) => {
            this.pendingCalls.set(id, { resolve, reject });
            this.managerPort.postMessage(message);
        });


    }

    private getServiceInstanceMethodList(instance: IService): string[] {
        const methods = Object.getOwnPropertyNames(
            Object.getPrototypeOf(instance)
        ).filter(method => method !== "constructor");

        Array.from(Object.keys(instance)).forEach(key => {
            if (typeof instance[key] === "function") {
                methods.push(key);
            }
        });
        return methods;
    }
}