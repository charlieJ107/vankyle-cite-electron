import { ipcRenderer } from "electron";
import { IServiceManager } from "./IServiceManager";
import { IServiceProvider } from "./IServiceProvider";
import { IServiceRegistry } from "./IServiceRegistry";
import { MessagePortServiceManager } from "./MessagePortServiceManager";
import { MessagePortServicesProvider } from "./MessagePortServiceProvider";
import { MessagePortServiceRegistry } from "./MessagePortServiceRegistry";
import { ServiceProviderInitRequest } from "./IRpcMessage";
import { APP_SERVICE_MANAGER } from "../init/constrants";

export class RpcFactory {
    static createServiceManager(): IServiceManager {
        return new MessagePortServiceManager();
    }

    static createServiceProvider(): IServiceProvider {
        const AppServiceProvider = new MessagePortServicesProvider();
        const serviceManagerInitRequest: ServiceProviderInitRequest = {
            chennel: "request-init-service-provider",
            serviceManager: APP_SERVICE_MANAGER,
            providerId: `${process.pid}-provider-0`,
        };
        const port = AppServiceProvider.initServices();
        ipcRenderer.postMessage(serviceManagerInitRequest.chennel, serviceManagerInitRequest, [port]);
        return AppServiceProvider;
    }

    static createServiceRegistry(): IServiceRegistry {
        return new MessagePortServiceRegistry();
    }
}