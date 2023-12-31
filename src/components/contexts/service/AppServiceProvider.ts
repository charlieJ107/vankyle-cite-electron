import { IAppService } from "../../../services/IAppService";
import { AppServiceProxy } from "./AppServiceProxy";
import { IServiceProvider, RPCMessage } from "@charliej107/vankyle-cite-rpc";
/**
 * AppServiceProvider
 * 给renderer进程调用的前台实例，向前台暴露安全的API
 */
export class AppServiceProvider implements IServiceProvider {
    public whoami = "app-service-provider";
    private appServiceManagerMessagePort: MessagePort | null;
    private pendingServiceRequests: Map<string, {
        resolve: (value: AppServiceProxy<IAppService> | PromiseLike<AppServiceProxy<IAppService>>) => void
        reject: (reason?: any) => void
    }> = new Map();

    constructor() { this.appServiceManagerMessagePort = null; }

    public init(messagePort: MessagePort) {
        if (this.appServiceManagerMessagePort) {
            console.warn('AppServiceProvider already initialized');
        } else {
            this.appServiceManagerMessagePort = messagePort;
            this.appServiceManagerMessagePort.onmessage = (event) => {
                console.log(`AppServiceProvider received message from ${event.origin}`);
                this.handleResponse(event);
            };
            console.log('AppServiceProvider initialized');
        }
    }


    getService = async <TService extends IAppService>(service_name: string): Promise<AppServiceProxy<TService>> => {
        console.log(`AppServiceProvider.getService(${service_name})`);
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
        if (!this.appServiceManagerMessagePort) {
            throw new Error('In AppServiceProvider, MessagePort to AppServiceManager not initialized');
        }
        console.log(`AppServiceProvider.sendServiceRequest(${message.header.method})`);
        this.appServiceManagerMessagePort.postMessage(message);
    }

    private handleResponse(messageEvent: MessageEvent<RPCMessage>) {
        const message = messageEvent.data as RPCMessage;
        console.log(`AppServiceProvider received message from ${message.header.from} \n Message: ${JSON.stringify(message)}`);
        switch (message.header.method) {
            case 'get-service':
                this.resolveService(message, messageEvent.ports);
                break;
            default:
                console.warn(`AppServiceProvider received unknown method ${message.header.method}`);
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