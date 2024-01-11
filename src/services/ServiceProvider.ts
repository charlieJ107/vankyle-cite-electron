import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { IServiceInfo } from "./IService";

export const SERVICE_PROVIDER_REGISTER_SERVICE_CHANNEL = "ServiceProvider.registerService";
export const SERVICE_PROVIDER_READY_CHANNEL = "ServiceProvider.ready";
export class ServiceProvider {
    private agent: IRpcAgent;
    private services: Map<string, IServiceInfo> = new Map();
    private serviceInstances: Map<string, any> = new Map();
    private readyPromise: Promise<void>;
    constructor(rpcAgent: IRpcAgent) {
        this.agent = rpcAgent;
        this.agent.subscribe(
            SERVICE_PROVIDER_REGISTER_SERVICE_CHANNEL,
            (data: { name: string, serviceInfo: IServiceInfo }) => {
                this.registerRemoteService(data.name, data.serviceInfo)
            });
        this.readyPromise = new Promise<void>((resolve) => {
            this.agent.subscribe(SERVICE_PROVIDER_READY_CHANNEL, () => {
                resolve();
            });
        });
    }

    public registerService(name: string, service: any) {
        // Get all methods of the service instance
        this.serviceInstances.set(name, service);
        const prototype = Object.getPrototypeOf(service);
        const methods = Object.getOwnPropertyNames(prototype).filter((name) => name !== "constructor" && typeof prototype[name] === "function");
        methods.push(...Object.getOwnPropertyNames(service).filter((name) => name !== "constructor" && typeof service[name] === "function"));
        methods.forEach((method) => {
            this.agent.register(`${name}.${method}`, (...args: any[]) => {
                return this.serviceInstances.get(name)[method](...args);
            });
        });
        const serviceInfo: IServiceInfo = {
            name,
            methods
        };
        this.services.set(name, serviceInfo);
        this.agent.publish(SERVICE_PROVIDER_REGISTER_SERVICE_CHANNEL, { name, serviceInfo });
    }

    public ready() {
        this.agent.publish(SERVICE_PROVIDER_READY_CHANNEL, {});
    }
    public whenServiceReady() {
        return this.readyPromise;
    }

    private registerRemoteService(name: string, service: IServiceInfo) {
        this.services.set(name, service);
    }

    public getAppServices() {
        const appService: any = {};
        for (const [name, service] of this.services.entries()) {
            appService[name] = {};
            if (this.serviceInstances.has(name)) {
                appService[name] = this.serviceInstances.get(name);
                continue;
            }
            service.methods.forEach((method) => {
                appService[name][method] = this.agent.resolve(`${name}.${method}`);
            });
        }
        console.log("App services: ", appService);
        return appService;
    }


}