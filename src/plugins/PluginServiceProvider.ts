import { IServiceProvider, RPCRequestMessage, RPCResponseMessage } from "@charliej107/vankyle-cite-rpc";
import { IPluginService } from "../../vankyle-cite-plugin/src/IPluginService";
import { PluginServiceProxy } from "./PluginServiceProxy";

/**
 * A service provider for plugins.
 * Provide a service proxy for a plugin service. Enable the plugin to call services from the main app.
 */
export class PluginServiceProvider implements IServiceProvider {
    private whoami = "plugin-service-provider";
    private pluginServiceManagerProt: MessagePort | null = null;
    private pendingServiceRequests: Map<string, {
        resolve: (value: PluginServiceProxy<IPluginService> | PromiseLike<PluginServiceProxy<IPluginService>>) => void
        reject: (reason?: any) => void
    }> = new Map();

    constructor() {

    }

    public init(messagePort: MessagePort) {
        this.pluginServiceManagerProt = messagePort;
        this.pluginServiceManagerProt.onmessage = this.handleResponse.bind(this);
    }

    getService<TService extends IPluginService>(service_name: string): Promise<PluginServiceProxy<TService>> {
        return new Promise<PluginServiceProxy<TService>>((resolve, reject) => {
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

    private sendServiceRequest(message: RPCRequestMessage) {
        if (!this.pluginServiceManagerProt) {
            throw new Error('Plugin service manager port not initialized');
        }
        this.pluginServiceManagerProt.postMessage(message);
    }

    private handleResponse(messageEvent: MessageEvent<RPCResponseMessage>) {
        const message = messageEvent.data as RPCResponseMessage;
        switch (message.header.method) {
            case 'get-service':
                this.resolveService(message, messageEvent.ports);
                break;
        }
    }

    private resolveService(message: RPCResponseMessage, messagePorts: readonly MessagePort[]) {
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
        const service = new PluginServiceProxy<IPluginService>(service_name, port);
        request.resolve(service);
    }


}