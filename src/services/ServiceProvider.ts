import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { IService, IServiceInfo } from "./IService";

export const SERVICE_PROVIDER_REGISTER_SERVICE_CHANNEL = "ServiceProvider.registerService";
export const SERVICE_PROVIDER_REGISTER_SERVER_CHANNEL = "ServiceProvider.registerServiceServer";
export class ServiceProvider {
    private agent: IRpcAgent;
    private services: Map<string, IServiceInfo> = new Map();
    private serviceInstances: Map<string, IService> = new Map();
    // We are still waiting for the following services: 
    // key: service name that being depended on
    // value: resolve and reject functions for promises that waiting for the service as dependency
    private pendingDependencyPromises: Map<string, { resolve: (value?: any) => void, reject: (reason: any) => void }[]> = new Map();

    // Promises of the services those are still waiting for the dependency servicies to be registered
    // key: service name of the service that using factory to initialize, the service is waiting for dependencies to be registered
    // value: promise of the service
    private serviceServers: string[] = [];
    private localServiceServerInstances: Map<string, IService> = new Map();
    private pendingServerPromies: Map<string, { resolve: (value?: any) => void, reject: (reason: any) => void }> = new Map();

    constructor(rpcAgent: IRpcAgent) {
        this.agent = rpcAgent;
        this.agent.subscribe(
            SERVICE_PROVIDER_REGISTER_SERVICE_CHANNEL,
            (data: { name: string, serviceInfo: IServiceInfo }) => {
                this.registerRemoteService(data.name, data.serviceInfo);
            });
        this.agent.subscribe(
            SERVICE_PROVIDER_REGISTER_SERVER_CHANNEL,
            (name) => {
                this.registerRemoteServiceServer(name);
            });
    }


    public registerService(name: string, service: IService) {
        // Get all methods of the service instance
        this.serviceInstances.set(name, service);
        const serviceInfo = this.getServiceInfo(name, service);
        serviceInfo.methods.forEach((method) => {
            this.agent.register(`${name}.${method}`, (...args: any[]) => {
                return this.serviceInstances.get(name)[method](...args);
            });
        });
        this.services.set(name, serviceInfo);
        this.agent.publish(SERVICE_PROVIDER_REGISTER_SERVICE_CHANNEL, { name, serviceInfo });
        if (this.pendingDependencyPromises.has(name)) {
            console.log(`Service ${name} registered, resolving pending promises`);
            this.pendingDependencyPromises.get(name).forEach((solution) => {
                solution.resolve();
            });
            this.pendingDependencyPromises.delete(name);
        }
    }

    private getServiceInfo(name: string, service: IService): IServiceInfo {
        const prototype = Object.getPrototypeOf(service);
        const methods = Object.getOwnPropertyNames(prototype).filter((method) => method !== "constructor" && typeof prototype[method] === "function");
        methods.push(...Object.getOwnPropertyNames(service).filter((method) => method !== "constructor" && typeof service[method] === "function"));
        return {
            name,
            methods
        } as IServiceInfo;

    }

    private registerRemoteService(name: string, service: IServiceInfo) {
        this.services.set(name, service);
        if (this.pendingDependencyPromises.has(name)) {
            console.log(`Service ${name} registered, resolving pending promises`);
            this.pendingDependencyPromises.get(name).forEach((solution) => {
                solution.resolve();
            });
            this.pendingDependencyPromises.delete(name);
        }
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
        return appService;
    }

    public registerServiceServer(name: string, service: any) {
        // Service Server should not appear in the app service list
        this.serviceServers.push(name);
        this.localServiceServerInstances.set(name, service);
        this.agent.publish(SERVICE_PROVIDER_REGISTER_SERVER_CHANNEL, name);
        if (this.pendingServerPromies.has(name)) {
            const promise = this.pendingServerPromies.get(name);
            promise.resolve();
            this.pendingServerPromies.delete(name);
        }
    }

    private registerRemoteServiceServer(name: string) {
        if (this.pendingServerPromies.has(name)) {
            const promise = this.pendingServerPromies.get(name);
            promise.resolve();
            this.pendingServerPromies.delete(name);
        }
        this.serviceServers.push(name);

    }

    public async registerServiceClient(name: string, factory: () => IService) {
        if (this.serviceServers.includes(name)) {
            const service = factory();
            this.registerService(name, service);
        } else {
            const service = await new Promise<void>((resolve, reject) => {
                this.pendingServerPromies.set(name, { resolve, reject });
                setTimeout(() => {
                    reject(new Error(`Wait for service ${name} server timeout`));
                }, 1000);
            }).then((): Promise<IService> => {
                return factory();
            });
            this.registerService(name, service);
        }
    }

    public async registeServiceFactory<T extends IService>(name: string, factory: () => T, ...dependencies: string[]) {
        const waitForService = (name: string) => {
            if (this.services.has(name)) {
                return Promise.resolve();
            } else {
                return new Promise((resolve, reject) => {
                    this.pendingDependencyPromises.set(name, [...(this.pendingDependencyPromises.get(name) || []), { resolve, reject }]);
                    setTimeout(() => {
                        reject(new Error(`Wait for service ${name} timeout`));
                    }, 1000);
                });
            }
        }
        await Promise.all(dependencies.map(waitForService)).then(() => {
            const service = factory();
            console.log(`Service ${name} initialized from factory, registering service`);
            this.registerService(name, service);
        });
    }

    public getService<T extends IService>(name: string): T {
        if (this.serviceInstances.has(name)) {
            console.log(`Service ${name} already initialized, returning instance`);
            return this.serviceInstances.get(name) as T;
        }
        const serviceInfo = this.services.get(name);
        if (!serviceInfo) {
            throw new Error(`Service ${name} not found`);
        }
        const service: any = {};
        serviceInfo.methods.forEach((method) => {
            service[method] = this.agent.resolve(`${name}.${method}`);
        });
        console.log(`Service ${name} not initialized, returning proxy`);
        return service;
    }

}