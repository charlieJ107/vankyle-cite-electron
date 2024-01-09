import { MessageChannelMain, MessagePortMain } from "electron";
import { IControlMessage, IDependencyInfo, IDependencyRPCMessage, IMessage, IServiceInfo, IServiceRPCMessage, REGISTER_SERVICE_PROVIDER, isControlMessage, isIpcMessage, isMessage, isRpcMessage } from "./../rpc/IMessage";
import { IAppService, IService } from "@/services/IService";
import { IIpcMessage, IRpcMessage } from "./IMessage";
import { IServiceProvider } from "./IServiceProvider";

/**
 * MessagePortServiceProvider
 * 基于MessagePort的ServiceProvider，运行在任何需要提供或者消费Service的Process中
 * 它的职责是，注册自己提供的Service，以及处理来自其他Process的Service请求
 * 同时它也是个IOC容器，负责管理Service的生命周期
 */
export class MessagePortServiceProvider implements IServiceProvider {
    private managerPort: MessagePort | MessagePortMain | null; // MessagePort to ServiceManager
    private pendingCalls: Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>;
    private postIpcMessage: (message: IIpcMessage, transfer?: MessagePortMain[] | MessagePort[]) => void;
    private providerId: string;
    private serviceInstances: Map<string, IService>;
    private dependencies: Map<string, IService>;

    constructor(postIpcMessage: (message: IIpcMessage, transfer: MessagePortMain[] | MessagePort[]) => void) {
        this.managerPort = null;
        this.postIpcMessage = postIpcMessage;
        this.providerId = `${process.type}-${process.pid}`;
        this.pendingCalls = new Map();
        this.serviceInstances = new Map();

        // Register self as a service provider to ServiceManager
        const registerServiceProviderMessage: IIpcMessage = {
            id: Date.now() + Math.floor(Math.random() * 10),
            type: "IPC",
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
    public AppServices(): IAppService {
        const services = {} as IAppService;
        for (const [key, value] of this.serviceInstances) {
            services[key] = value;
        }
        return services;
    }
    private async onManagerMessage(event: MessageEvent | Electron.MessageEvent) {
        if (isRpcMessage(event.data)) {
            switch (event.data.direction) {
                case "REQUEST":
                    await this.handleRpcRequest(event.data);
                    break;
                case "RESPONSE":
                    this.handleResponse(event.data);
                    break;
                default:
                    console.warn("Invalid message direction: ", event.data.direction);
                    break;
            }
        } else if (isControlMessage(event.data)) {
            this.handleControleMessage(event.data);
        } else {
            console.warn("Invalid manager message: ", event.data);
        }
    }

    private handleResponse(message: IMessage) {
        const { id, payload } = message;
        if (!this.pendingCalls.has(id)) {
            console.warn("Pending call not found for response message: ", message);
            return;
        }
        const { resolve, reject } = this.pendingCalls.get(id) as { resolve: (value: any) => void, reject: (reason: any) => void };
        if (payload instanceof Error) {
            reject(payload);
        } else {
            resolve(payload);
        }
        this.pendingCalls.delete(id);
    }

    private callService(service: string, method: string, ...args: any[]): Promise<any> {
        if (!this.managerPort) {
            throw new Error("ServiceManager not initialized");
        }
        // Calling remote service
        const id = Date.now();
        const message: IServiceRPCMessage = {
            id,
            type: "RPC",
            channel: "SERVICE",
            direction: "REQUEST",
            service,
            method,
            payload: args,
        };
        return new Promise((resolve, reject) => {
            this.pendingCalls.set(id, { resolve, reject });
            this.managerPort.postMessage(message);
        });
    }

    private callDependency(dependency: string, method: string, ...args: any[]): Promise<any> {
        if (!this.managerPort) {
            throw new Error("ServiceManager not initialized");
        }
        // Calling remote service
        const id = Date.now();
        const message: IDependencyRPCMessage = {
            id,
            type: "RPC",
            channel: "DEPENDENCY",
            direction: "REQUEST",
            dependency,
            method,
            payload: args,
        };
        return new Promise((resolve, reject) => {
            this.pendingCalls.set(id, { resolve, reject });
            this.managerPort.postMessage(message);
        });
    }

    private handleControleMessage(message: IControlMessage) {
        switch (message.command) {
            case "REGISTER_SERVICE":
                const serviceInfo = message.payload as IServiceInfo;
                if (serviceInfo.providerId === this.providerId) {
                    console.warn(`Service ${serviceInfo.service} registered by provider ${serviceInfo.providerId}, but message come from provider ${this.providerId}`);
                    return;
                }
                this.registerServiceInfo(serviceInfo);
                break;
            case "REGISTER_DEPENDENCY":
                const dependencyInfo = message.payload as IDependencyInfo;
                if (dependencyInfo.providerId === this.providerId) {
                    console.warn(`Dependency ${dependencyInfo.dependency} registered by provider ${dependencyInfo.providerId}, but message come from provider ${this.providerId}`);
                    return;
                }
                this.registerDependencyInfo(dependencyInfo);
                break;
            default:
                console.warn("Invalid control message command: ", message.command);
                break;
        }
    }

    private async handleRpcRequest(message: IRpcMessage) {
        switch (message.channel) {
            case "SERVICE":
                await this.handleServiceRpcRequest(message as IServiceRPCMessage);
                break;
            case "DEPENDENCY":
                await this.handleDependencyRpcRequest(message as IDependencyRPCMessage);
                break;
            default:
                console.warn("Invalid rpc message channel: ", message.channel);
                break;
        }

    }

    private async handleServiceRpcRequest(message: IServiceRPCMessage) {
        const { service, method, payload } = message;
        const serviceInstance = this.serviceInstances.get(service);
        if (!serviceInstance) {
            console.warn("Service not found: ", service);
            const responseMessage: IServiceRPCMessage = {
                id: message.id,
                type: "RPC",
                channel: "SERVICE",
                direction: "RESPONSE",
                service,
                method,
                payload: new Error("Service not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        if (!serviceInstance[method] || typeof serviceInstance[method] !== "function") {
            console.warn("Method not found: ", method);
            const responseMessage: IServiceRPCMessage = {
                id: message.id,
                type: "RPC",
                channel: "SERVICE",
                direction: "RESPONSE",
                service,
                method,
                payload: new Error("Method not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        const result = await serviceInstance[method](...payload);
        const responseMessage: IServiceRPCMessage = {
            id: message.id,
            type: "RPC",
            channel: "SERVICE",
            direction: "RESPONSE",
            service,
            method,
            payload: result,
        };
        this.managerPort.postMessage(responseMessage);
    }

    private async handleDependencyRpcRequest(message: IDependencyRPCMessage) {
        const { dependency, method, payload } = message;

        const dependencyInstance = this.dependencies.get(dependency);
        if (!dependencyInstance) {
            console.warn("Dependency not found: ", dependency);
            const responseMessage: IDependencyRPCMessage = {
                id: message.id,
                type: "RPC",
                channel: "DEPENDENCY",
                direction: "RESPONSE",
                dependency,
                method,
                payload: new Error("Dependency not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        if (!dependencyInstance[method] || typeof dependencyInstance[method] !== "function") {
            console.warn("Method not found: ", method);
            const responseMessage: IDependencyRPCMessage = {
                id: message.id,
                type: "RPC",
                channel: "DEPENDENCY",
                direction: "RESPONSE",
                dependency,
                method,
                payload: new Error("Method not found"),
            };
            this.managerPort.postMessage(responseMessage);
            return;
        }
        const result = await dependencyInstance[method](...payload);
        const responseMessage: IDependencyRPCMessage = {
            id: message.id,
            type: "RPC",
            channel: "DEPENDENCY",
            direction: "RESPONSE",
            dependency,
            method,
            payload: result,
        };
        this.managerPort.postMessage(responseMessage);
    }


    private resolve<T extends IService>(target: new (...args: (IService | undefined)[]) => T): T {
        // Resolve dependencies from decorator
        


        if (paramNames === null) {
            return new target();
        }

        const dependencies = paramNames.map((name: string) => {
            const dependency = this.dependencies.get(name);
            if (!dependency) {
                throw new Error(`Dependency '${name}' not found.`);
            }
            return dependency;
        });

        return new target(...dependencies);
    }

    public registerService(name: string, service: new (...args: (IService | undefined)[]) => IService) {

        const instance = this.resolve(service);
        const serviceInfo: IServiceInfo = {
            service: name,
            providerId: this.providerId,
            methods: this.getServiceInstanceMethodList(instance),
        };
        this.serviceInstances.set(name, instance);
        const registerServiceMessage: IControlMessage = {
            id: Date.now() + Math.floor(Math.random() * 10),
            type: "CONTROL",
            command: "REGISTER_SERVICE",
            payload: serviceInfo
        };
        this.managerPort.postMessage(registerServiceMessage);
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


    private registerServiceInfo(serviceInfo: IServiceInfo) {
        console.log("Register remote service: ", serviceInfo)
        const proxiedService: IService = {

        }
        for (const method of serviceInfo.methods) {
            proxiedService[method] = (...args: any[]) => {
                return this.callService(serviceInfo.service, method, ...args);
            };
        }
        this.serviceInstances.set(serviceInfo.service, proxiedService as IService);
        console.log("After register, the app service is: ", this.AppServices())
    }

    private registerDependencyInfo(dependencyInfo: IDependencyInfo) {
        console.log("Register remote dependency: ", dependencyInfo)
        const proxiedDependency: IService = {

        }
        for (const method of dependencyInfo.methods) {
            proxiedDependency[method] = (...args: any[]) => {
                return this.callDependency(dependencyInfo.dependency, method, ...args);
            };
        }
        this.dependencies.set(dependencyInfo.dependency, proxiedDependency as IService);
    }

}