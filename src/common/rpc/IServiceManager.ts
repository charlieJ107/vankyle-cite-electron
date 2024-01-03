import { IService } from "@/services/IService";

export interface IServiceManager {
    registerService(serviceName: string, service: IService): void
}