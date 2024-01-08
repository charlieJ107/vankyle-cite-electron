import { MessageEvent, MessagePortMain } from "electron";
import { IIpcMessage, IRpcMessage, IServiceInfo, REGISTER_SERVICE, isIpcMessage, isRpcMessage } from "./IMessage";


/**
 * 基于MessagePort实现的ServiceManager，工作在Service Process，分发和处理来自不同Process的Service请求
 * 是RPC通信的核心调度器
 * 它的职责是，管理注册的ServiceProvider，根据ServiceRequest的serviceName，将请求分发给对应的ServiceProvider
 */
export class MessagePortServiceManager {
    private providers: Map<string, MessagePort | MessagePortMain>;
    private services: Map<string, IServiceInfo>;
    private pendingRequests: Map<number, { resolve: (result: any) => void; reject: (reason: any) => void }>;
    constructor() {
        this.providers = new Map();
        this.pendingRequests = new Map();
        this.services = new Map();
        process.parentPort.on("message", (event) => this.onParentPortMessage(event));
    }

    /**
     * 注册一个ServiceProvider，设为public仅为注册本进程的ServiceProvider，
     * 来自其他进程的ServiceProvider注册消息（来自ParentPort）已经在内部监听处理
     * @param providerId Provider的ID
     * @param port 用于和Provider通信的MessagePort
     */
    public registerServiceProvider(providerId: string, port: MessagePortMain | MessagePort) {
        if (this.providers.has(providerId)) {
            console.warn(`ServiceProvider ${providerId} already registered, overwriting...`);
            // We should overwrite the existing one, as the new service provider created a new MessagePort for communication
        }
        if (port instanceof MessagePort) {
            port.onmessage = (event) => this.onServiceProviderMessage(providerId, event as globalThis.MessageEvent);
        } else {
            port.on("message", (event) => this.onServiceProviderMessage(providerId, event as Electron.MessageEvent));
        }

        this.providers.set(providerId, port);
        port.start();
        console.log("ServiceProvider registered: ", providerId);
    }

    /**
     * 处理来自Main Process的MessagePort消息
     * @param event 来自Main Process的MessagePort消息对应的MessageEvent
     * @returns void
     * @description 目前只有一种消息需要处理，即来自Main Process的注册ServiceProvider的消息
     * 其他的IPC消息，如请求ServiceList，都来自MessagePortServiceProvider，直接由
     */
    private onParentPortMessage(event: MessageEvent): void {
        if (!isIpcMessage(event.data)) {
            console.warn("Invalid message received, expected register provider ipc message: ", event.data);
            return;
        }

        const message = event.data as IIpcMessage;
        switch (message.channel) {
            case "REGISTER_SERVICE_PROVIDER":
                const [port] = event.ports;
                if (!port) {
                    console.warn("No port come with service provider registration", event);
                    return;
                }
                this.registerServiceProvider(message.payload, port);
                break;
            default:
                console.warn("Invalid parent port IPC message channel: ", message);
                break;
        }
    }

    /**
     * 处理来自Provider的MessagePort消息，包括RPC消息和IPC消息
     * @param fromProvider 消息来自哪个Provider
     * @param event Provider发来的MessageEvent
     * @returns void
     */
    private onServiceProviderMessage(fromProvider: string, event: globalThis.MessageEvent | Electron.MessageEvent): void {
        if (isRpcMessage(event.data)) {
            this.handleRpcMessage(fromProvider, event.data as IRpcMessage);
        } else if (isIpcMessage(event.data)) {
            this.handleIpcMessage(fromProvider, event.data as IIpcMessage);
        } else {
            console.warn("Invalid message received: ", event.data);
            return;
        }
    }

    /**
     * 处理来自Provider Port的IPC消息，来自Main Process的IPC消息已经在onParentPortMessage中处理过了
     * @param providerId 这个IPC消息来自哪个Provider
     * @param message IPC消息
     * @returns void
     */
    private handleIpcMessage(providerId: string, message: IIpcMessage) {
        console.log("Handling IPC message from provider: ", providerId, "message id: ", message.id);
        switch (message.channel) {
            case REGISTER_SERVICE:
                const serviceInfo = message.payload as IServiceInfo;
                if (serviceInfo.providerId !== providerId) {
                    console.warn(`Service ${serviceInfo.service} registered by provider ${serviceInfo.providerId}, but message come from provider ${providerId}`);
                    return;
                }
                console.log("Registering service in service provider: ", serviceInfo);
                this.registerService(serviceInfo);
                break;
            default:
                console.warn("Invalid IPC message channel: ", message);
                break;
        }

    }

    /**
     * 处理来自Provider的RPC消息
     * @param messageFromProviderId 这个RPC消息来自哪个Provider
     * @param message RPC消息
     * @returns void
     * @description 该方法会将RPC消息转发给RPC消息的目标Provider。由于RPC
     */
    private handleRpcMessage(messageFromProviderId: string, message: IRpcMessage) {

        const serviceInfo = this.services.get(message.service);
        if (!serviceInfo) {
            console.warn(`Service ${message.service} not found. This service may not be registered.`);
            const errorResponseMessage: IRpcMessage = {
                id: message.id,
                type: "RPC",
                direction: "RESPONSE",
                service: message.service,
                method: message.method,
                payload: new Error(`Service ${message.service} not found.`)
            };
            const originPort = this.providers.get(messageFromProviderId);
            if (!originPort) {
                console.warn("No provider port found for provider: Where you got this message??? ", messageFromProviderId);
            } else {
                originPort.postMessage(errorResponseMessage);
            }
            return;
        }
        const providerId = serviceInfo.providerId;
        const provider = this.providers.get(providerId);
        if (!provider) {
            console.warn(`Provider ${providerId} not found. Who registered this service?`);
            const errorResponseMessage: IRpcMessage = {
                id: message.id,
                type: "RPC",
                direction: "RESPONSE",
                service: message.service,
                method: message.method,
                payload: new Error(`Provider ${providerId} not found.`)
            };
            const originPort = this.providers.get(messageFromProviderId);
            if (!originPort) {
                console.warn("No provider port found for provider: Where you got this message??? ", messageFromProviderId);
            } else {
                originPort.postMessage(errorResponseMessage);
            }
        }
        switch (message.direction) {
            case "REQUEST":
                const requestMessage: IRpcMessage = {
                    id: message.id,
                    type: "RPC",
                    direction: "REQUEST",
                    service: message.service,
                    method: message.method,
                    payload: message.payload
                };

                this.pendingRequests.set(message.id, {
                    resolve: (result: any) => {
                        const responseMessage: IRpcMessage = {
                            id: message.id,
                            type: "RPC",
                            direction: "RESPONSE",
                            service: message.service,
                            method: message.method,
                            payload: result
                        };
                        provider.postMessage(responseMessage);
                    },
                    reject: (reason: any) => {
                        const responseMessage: IRpcMessage = {
                            id: message.id,
                            type: "RPC",
                            direction: "RESPONSE",
                            service: message.service,
                            method: message.method,
                            payload: reason
                        };
                        provider.postMessage(responseMessage);
                    }
                });
                provider.postMessage(requestMessage);
                break;
            case "RESPONSE":
                const pendingRequest = this.pendingRequests.get(message.id);
                if (!pendingRequest) {
                    console.warn("No pending request found for message: ", message);
                    return;
                }
                if (message.payload instanceof Error) {
                    pendingRequest.reject(message.payload);
                } else {
                    pendingRequest.resolve(message.payload);
                }
                break;
            default:
                console.warn("Invalid RPC message direction: ", message);
                break;
        }
    }

    private registerService(serviceInfo: IServiceInfo) {
        const providerInfo = this.providers.get(serviceInfo.providerId);
        if (!providerInfo) {
            console.warn("No provider info found for provider: ", serviceInfo.providerId);
            return;
        }
        this.services.set(serviceInfo.service, serviceInfo);
        for (const [provider, port] of this.providers) {
            if (provider === serviceInfo.providerId) {
                continue;
            }
            const message: IIpcMessage = {
                id: Date.now() + Math.floor(Math.random() * 10),
                type: "IPC",
                channel: REGISTER_SERVICE,
                payload: serviceInfo
            };
            console.log("Sending service registration message to provider: ", provider, "message: ", message);
            port.postMessage(message);
        }
    }

}
