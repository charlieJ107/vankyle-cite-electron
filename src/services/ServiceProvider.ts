import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { IServiceInfo } from "./IService";

const SERVICE_PROVIDER_CHANNEL = "ServiceProvider.registerService";

export class ServiceProvider {
    private agent: IRpcAgent;
    private services: Map<string, IServiceInfo> = new Map();
    constructor(rpcAgent: IRpcAgent) {
        this.agent = rpcAgent;
        this.agent.subscribe(
            SERVICE_PROVIDER_CHANNEL,
            (data: { name: string, serviceInfo: IServiceInfo }) => {
                console.log("Register remote service: ", data);
                this.registerRemoteService(data.name, data.serviceInfo)
            });

    }

    public registerService(name: string, service: any) {
        // Get all methods of the service instance
        const prototype = Object.getPrototypeOf(service);
        const methods = Object.getOwnPropertyNames(prototype).filter((name) => name !== "constructor" && typeof prototype[name] === "function");
        methods.forEach((method) => {
            this.agent.register(`${name}.${method}`, prototype[method]);
        });
        const propertyMethods = Object.getOwnPropertyNames(service).filter((name) => name !== "constructor" && typeof service[name] === "function");
        propertyMethods.forEach((method) => {
            this.agent.register(`${name}.${method}`, service[method]);
        });
        methods.push(...propertyMethods);
        const serviceInfo: IServiceInfo = {
            name,
            methods
        };
        this.agent.publish(SERVICE_PROVIDER_CHANNEL, { name, serviceInfo });
    }

    private registerRemoteService(name: string, service: IServiceInfo) {
        this.services.set(name, service);
    }

    public getAppServices() {
        const appService: any = {};
        console.log("getAppServices: ", this.services);
        for (const [name, service] of this.services.entries()) {
            console.log(name, service);
            appService[name] = {};
            service.methods.forEach((method) => {
                Object.defineProperty(appService[name], method, this.agent.resolve(`${name}.${method}`));
            });
        }
        return appService;
    }


}