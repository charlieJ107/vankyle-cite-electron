import { IAppService } from "../../../services/IAppService";
import { AppServiceProxy } from "./AppServiceProxy";
import { IServiceProvider, RPCMessage } from "@charliej107/vankyle-cite-rpc";
/**
 * AppServiceProvider
 * 给renderer进程调用的前台实例，向前台暴露安全的API
 */
export class AppServiceProvider implements IServiceProvider {
    private whoami = "app-service-provider";
    private appServiceManagerMessagePort: MessagePort;
    private pendingServiceRequests: Map<string, {
        resolve: (value: AppServiceProxy<IAppService> | PromiseLike<AppServiceProxy<IAppService>>) => void
        reject: (reason?: any) => void
    }> = new Map();

    constructor(messagePort: MessagePort) {
        this.appServiceManagerMessagePort = messagePort;
        this.appServiceManagerMessagePort.onmessage = this.handleResponse.bind(this);
    }

    async getService<TService extends IAppService>(service_name: string): Promise<AppServiceProxy<TService>> {
        return new Promise<AppServiceProxy<TService>>((resolve, reject) => {
            this.pendingServiceRequests.set(service_name, { resolve, reject });
            this.sendServiceRequest({
                header: {
                    id: Date.now(),
                    type: 'request',
                    from: this.whoami,
                    method: 'get-service',
                    service: service_name,
                },
                body: [],
            });
        });
    }

    private sendServiceRequest(message: RPCMessage) {
        this.appServiceManagerMessagePort.postMessage(message);
    }

    private handleResponse(messageEvent: MessageEvent<RPCMessage>) {
        const message = messageEvent.data as RPCMessage;
        switch (message.header.method) {
            case 'get-service':
                this.resolveService(message, messageEvent.ports);
                break;
        }
    }

    private resolveService(message: RPCMessage, messagePorts: readonly MessagePort[]) {
        const service_name = message.header.service;
        const request = this.pendingServiceRequests.get(service_name);

        if (!request) {
            throw new Error(`No pending request for service ${service_name}`);
        }
        if (message.body.error) {
            request.reject(message.body.error);
            return;
        } else if (!messagePorts.length) {
            request.reject(new Error('No message port provided'));
            return;
        }

        const [port] = messagePorts;
        const service = new AppServiceProxy<IAppService>(service_name, port);
        request.resolve(service);
    }


}