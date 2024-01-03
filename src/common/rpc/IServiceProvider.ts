import { IAppServices } from "@/services/IService";

export interface IServiceProvider {
    getServices(): Promise<IAppServices>;
}