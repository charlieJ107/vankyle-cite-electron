import { IAppService } from "../../../services/IAppService";
import { AppServiceProxy } from "./AppServiceProxy";

export async function useAppService<ServiceType extends IAppService>(name: string): Promise<AppServiceProxy<ServiceType>> {
    return await window.AppServiceProvider.getService<ServiceType>(name);
}