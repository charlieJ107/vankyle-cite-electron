import { MessageEvent, MessagePortMain } from "electron";
import { IIpcMessage, IRpcMessage, IServiceInfo, REQUEST_SERVICE_LIST, isIpcMessage, isRpcMessage } from "./IMessage";

interface ProviderInfo {
    providerId: string;
    sevices: IServiceInfo[];
    port: MessagePort | MessagePortMain;
}

/**
 * 基于MessagePort实现的ServiceManager，工作在Service Process，分发和处理来自不同Process的Service请求
 * 是RPC通信的核心调度器
 * 它的职责是，管理注册的ServiceProvider，根据ServiceRequest的serviceName，将请求分发给对应的ServiceProvider
 */
export class MessagePortServiceManager {
    private serviceProviders: Map<string, ProviderInfo>;
    private pendingRequests: Map<number, { resolve: (result: any) => void; reject: (reason: any) => void }>;
    constructor() {
        this.serviceProviders = new Map();
        this.pendingRequests = new Map();
        process.parentPort.on("message", (event) => this.onParentPortMessage(event));
    }

    /**
     * 注册一个ServiceProvider，设为public仅为注册本进程的ServiceProvider，
     * 来自其他进程的ServiceProvider注册消息（来自ParentPort）已经在内部监听处理
     * @param providerId Provider的ID
     * @param port 用于和Provider通信的MessagePort
     */
    public registerServiceProvider(providerId: string, port: MessagePortMain | MessagePort) {
        if (this.serviceProviders.has(providerId)) {
            console.warn(`ServiceProvider ${providerId} already registered`);
            // Should we overwrite the existing one?

        }
        if (port instanceof MessagePort) {
            port.onmessage = (event) => this.onServiceProviderMessage(providerId, event as globalThis.MessageEvent);
        } else {
            port.on("message", (event) => this.onServiceProviderMessage(providerId, event as Electron.MessageEvent));
        }

        this.serviceProviders.set(providerId, { providerId, port, sevices: [] });
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
            console.warn("Invalid message received: ", event.data);
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
     * @param messageFromProviderId 消息来自哪个Provider
     * @param event Provider发来的MessageEvent
     * @returns void
     */
    private onServiceProviderMessage(messageFromProviderId: string, event: globalThis.MessageEvent | Electron.MessageEvent): void {
        if (isRpcMessage(event.data)) {
            this.handleRpcMessage(messageFromProviderId, event.data as IRpcMessage);
        } else if (isIpcMessage(event.data)) {
            this.handleIpcMessage(messageFromProviderId, event.data as IIpcMessage);
        } else {
            console.warn("Invalid message received: ", event.data);
            return;
        }
    }

    /**
     * 处理来自Provider的IPC消息，来自Main Process的IPC消息已经在onParentPortMessage中处理过了
     * @param providerId 这个IPC消息来自哪个Provider
     * @param message IPC消息
     * @returns void
     */
    private handleIpcMessage(providerId: string, message: IIpcMessage) {
        switch (message.channel) {
            case REQUEST_SERVICE_LIST:
                switch (message.direction) {
                    case "REQUEST":
                        this.handleServiceListRequest(providerId, message);
                        break;
                    case "RESPONSE":
                        console.log("Handling service list response from provider: ", providerId, "response id: ", message.id);
                        const request = this.pendingRequests.get(message.id);
                        if (!request) {
                            console.warn("No pending request found for message: ", message);
                            return;
                        }
                        this.pendingRequests.delete(message.id);
                        request.resolve(message.payload as IServiceInfo[]);
                        break;
                    default:
                        console.warn("Invalid message direction: ", message);
                        break;
                }
                break;
            default:
                console.warn("Invalid IPC message channel: ", message);
                break;
        }
    }
    /**
     * 处理来自Provider的ServiceList请求
     * @param providerId 这个ServiceList请求来自哪个Provider
     * @returns void
     * @description 该方法会向所有的Provider发送REQUEST_SERVICE_LIST的IPC消息，然后等待所有Provider的响应
     * Provider的响应是一个IServiceInfo[]，包含了Provider中所有的Service信息
     * 该方法会将所有Provider的IServiceInfo[]合并成一个IServiceInfo[]，然后将这个IServiceInfo[]作为响应返回给Provider
     */
    private handleServiceListRequest(providerId: string, message: IIpcMessage) {
        console.log("Handling service list request from provider: ", providerId);
        const promiseList: Promise<IServiceInfo[]>[] = [];
        for (const [provider, info] of this.serviceProviders) {
            const servicesInProviderPromise = this.requestServiceListFromProvider(provider, info.port);
            promiseList.push(servicesInProviderPromise);
        }
        Promise.all(promiseList).then((servicesInProvider) => {
            console.log("All service list responses received: ", servicesInProvider);
            const results: IServiceInfo[] = [];
            for (const services of servicesInProvider) {
                results.push(...services);
            }
            console.log("Service list response: ", results);
            const response: IIpcMessage = {
                id: message.id,
                type: "IPC",
                direction: "RESPONSE",
                channel: "REQUEST_SERVICE_LIST",
                payload: results,
            };
            const providerInfo = this.serviceProviders.get(providerId);
            if (!providerInfo) {
                console.warn("No provider port found for provider: ", providerId);
                return;
            }
            providerInfo.port.postMessage(response);
        });

    }

    /**
     * 向指定Provider发送一个IPC消息，请求指定Provider的Service列表
     * @param providerId Provider的ID
     * @param providerPort Provider的MessagePort
     * @returns Promise<IServiceInfo[]>
     * @description 该方法会向指定的Provider发送REQUEST_SERVICE_LIST的IPC消息，然后等待Provider的响应
     * Provider的响应是一个IServiceInfo[]，包含了Provider中所有的Service信息
     * 该方法返回一个Promise，当Provider响应时，Promise会resolve，返回IServiceInfo[]
     */
    private requestServiceListFromProvider(providerId: string, providerPort: MessagePort | MessagePortMain): Promise<IServiceInfo[]> {
        const request: IIpcMessage = {
            id: Date.now() + Math.floor(Math.random()*10),
            type: "IPC",
            direction: "REQUEST",
            channel: "REQUEST_SERVICE_LIST",
            payload: providerId,
        };

        return new Promise<IServiceInfo[]>((resolve, reject) => {
            console.log("Requesting service list from provider: ", providerId, "requiest id: ", request.id);
            this.pendingRequests.set(request.id, { resolve, reject });
            providerPort.postMessage(request);
        });
    }

    /**
     * 处理来自Provider的RPC消息
     * @param messageFromProviderId 这个RPC消息来自哪个Provider
     * @param message RPC消息
     * @returns void
     * @description 该方法会将RPC消息转发给RPC消息的目标Provider。由于RPC
     */
    private handleRpcMessage(messageFromProviderId: string, message: IRpcMessage) {
        const messageToProviderInfo = this.serviceProviders.get(message.to);
        if (!messageToProviderInfo) {
            console.warn(`No such provider ${message.to} for message: `, message);
            return;
        }
        const messageToProviderPort = messageToProviderInfo.port;
        messageToProviderPort.postMessage(message);
    }



}
