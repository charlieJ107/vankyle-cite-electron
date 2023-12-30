import { IService } from "./IService";

export interface IServiceProxy<TService extends IService> {
    call<TMethod extends keyof TService>(
        method: TMethod,
        ...args: Parameters<TService[TMethod]>
    ): Promise<ReturnType<TService[TMethod]>>
}