import { IService } from "../../../services/IService";

export function useAppService(name: string): IService {
    return window.AppServiceProvider.getService(name);
}