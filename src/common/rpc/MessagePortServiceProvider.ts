import { IAppServices, IService } from "@/services/IService";
import { IRpcMessage } from "./IRpcMessage";
import { IServiceProvider } from "./IServiceProvider";


export class MessagePortServicesProvider implements IServiceProvider {
    private port: MessagePort | null;
    private pendingCalls: Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>;
    private services: Map<string, Set<string>>;
    constructor() {
        this.port = null;
        this.pendingCalls = new Map();
        this.services = new Map();
    }

    public init(): MessagePort {
        if (this.port) {
            throw new Error("Port already initialized");
        }
        const { port1, port2 } = new MessageChannel();
        this.port = port1;
        this.port.onmessage = (event) => {
            const message = event.data;
            if (message.id) {
                this.handleMessage(message as IRpcMessage);
            } else {
                console.warn("Message received without id: ", message);
            }
        }

        return port2;
    }

    public async getServices(): Promise<IAppServices> {
        if (!this.port) {
            throw new Error("Port not initialized");
        }
        await this.updateServices();
        const appServiceObj: IAppServices = {};
        this.services.forEach((methods, service) => {
            const serviceObj: IService = {};
            methods.forEach(method => {
                serviceObj[method] = async (...args: any[]) => {
                    return await this.call<any>(service, method, ...args);
                };
            });
            appServiceObj[service] = serviceObj;
        });
        return appServiceObj as IAppServices;
    }

    private async updateServices() {
        this.services.clear();
        const services: { name: string, methods: string[] }[] = await this.call("ServiceManagerSelf", "getServices");
        services.forEach(service => this.services.set(service.name, new Set(service.methods)));
        const provider = this; // Avoid "this" being shadowed in the proxy
    }

    public call<T>(service: string, method: string, ...args: any[]): Promise<T> {
        if (!this.port) {
            throw new Error("Port not initialized");
        }
        return new Promise((resolve, reject) => {
            const callId = Date.now();
            this.pendingCalls.set(callId, { resolve, reject });
            const message: IRpcMessage = {
                id: callId,
                service,
                method,
                params: args
            };
            this.port.postMessage(message);
        });
    }

    private handleResponse(message: IRpcMessage, call: { resolve: (value: any) => void, reject: (reason: any) => void }) {
        this.pendingCalls.delete(message.id);
        if (message.result) {
            call.resolve(message.result);
        } else {
            call.reject(message.error ? message.error : "Undefined error");
        }
    }

    private handleMessage(message: IRpcMessage) {
        const call = this.pendingCalls.get(message.id);
        if (!call) {
            console.warn("No pending call found for message: ", message);
            return;
        } else {
            this.handleResponse(message, call);
        }
    }

}