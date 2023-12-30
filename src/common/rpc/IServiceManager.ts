import { MessagePortMain } from "electron";
import { IService } from "./IService";

export interface IServiceManager<TService extends IService> {
    reigisterService(name: string, service: TService): void;
    registerServiceProvider(name: string, target: MessagePortMain | MessagePort): void;
}