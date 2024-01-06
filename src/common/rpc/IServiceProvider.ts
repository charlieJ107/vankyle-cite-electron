import { IAppService, IService } from "@/services/IService";

export interface IServiceProvider {
    getServices(): Promise<IAppService>;
    registerService(serviceName: string, service: IService): void;
}