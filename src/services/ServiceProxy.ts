import { IService } from "@charliej107/vankyle-cite-rpc"

export class ServiceProxy<T extends IService> {
    private service: T;

    constructor(service: T) {
        this.service = service;
    }

    async call<K extends keyof T>(method: K, ...args: Parameters<T[K]>): Promise<ReturnType<T[K]>> {
        return this.service[method](...args);
    }
}