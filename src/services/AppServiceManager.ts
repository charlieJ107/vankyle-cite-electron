import { IService } from "./IService";

// 后台服务管理器，用于管理后台服务的启动、停止、重启等操作，管理后台服务的进程
export class AppServiceManager {
    constructor() {

    }
    private services: Map<string, IService> = new Map<string, IService>();
    public reigisterService(name: string, service: IService) {
        this.services.set(name, service);
    }

}