import { IService } from "./IService";
import { IServiceProxy } from "./IServiceProxy";

export interface IServiceProvider {
    getService<TService extends IService>(service_name: string): Promise<IServiceProxy<TService>>;
}