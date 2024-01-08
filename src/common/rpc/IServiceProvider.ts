import { IAppService, IService } from "@/services/IService";

export interface IServiceProvider {
    AppServices(): IAppService;
    registerService(name: string, service: new (...args: (IService | undefined)[]) => IService): void;
}