import { MessagePortMain } from "electron/main";

export interface IServiceRegistry {
    registerServiceManager(serviceName: string, postMessage: (message: any, port: MessagePortMain[]) => void): void
}