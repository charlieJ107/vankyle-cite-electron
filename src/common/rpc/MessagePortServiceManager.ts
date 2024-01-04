import { IService } from "@/services/IService";
import { MessagePortMain, MessageEvent } from "electron";
import { IProcessMessage, IRpcMessage } from "./IRpcMessage";
import { IServiceManager } from "./IServiceManager";
import { PluginService } from "@/services/PluginService/PluginService";

export class MessagePortServiceManager implements IServiceManager {
    private services: Map<string, IService>;
    private serviceProviders: Map<string, MessagePort | MessagePortMain>;
    constructor(parentPort?: MessagePortMain) {
        this.services = new Map();
        this.serviceProviders = new Map();
        if (process.type === "utility") {
            if (!parentPort) {
                process.parentPort.on("message", (event) => {
                    this.onParentPortMessage(event);
                });
            } else {
                parentPort.on("message", (event) => {
                    this.onParentPortMessage(event);
                });
            }
        } else if (process.type === "browser") {
            console.warn("MessagePortServiceManager not implemented for Main process");
        } else if (process.type === "renderer") {
            console.warn("MessagePortServiceManager not implemented for Renderer process");
        }
    }

    public registerService(serviceName: string, service: IService): void {
        if (this.services.has(serviceName)) {
            console.warn(`Service ${serviceName} already registered`);
            // TODO: Should we overwrite the service?
            this.services.set(serviceName, service);
            return;
        }
        this.services.set(serviceName, service);
    }

    /**
     * Handle message from parent process, which most likely is a request to register a service provider,
     * the message event should include a MessagePortMain object. 
     * @param event message event from parent process port
     */
    private onParentPortMessage(event: MessageEvent) {
        const message = event.data as IProcessMessage;
        const [port] = event.ports;
        if (!port) {
            throw new Error("No port in event");
        }
        switch (message.chennel) {
            case "request-init-service-provider":
                this.registerServiceProvider(message.providerId, port);
                break;
            case "plugin-manager-response":
                if (this.services.has("PluginService")) {
                    const service = this.services.get("PluginService") as PluginService;
                    service.handlePluginManagerResponse(message);
                } else {
                    throw new Error("PluginService not registered");
                }
                break;
            default:
                throw new Error(`Unknown message chennel ${message.chennel}`);
        }

    }

    /**
     * Register a service provider, which is a MessagePortMain object.
     * @param provider name of the service
     * @param port MessagePortMain object
     */
    private registerServiceProvider(provider: string, port: MessagePortMain): void {
        if (this.serviceProviders.has(provider)) {
            console.warn(`Service ${provider} already registered`);
            // TODO: Should we overwrite the service provider?
            port.on("message", (event) => {
                this.onServiceProviderMessage(provider, event);
            });
    
            this.serviceProviders.set(provider, port);
            port.start();
            return;
        }

        port.on("message", (event) => {
            this.onServiceProviderMessage(provider, event);
        });

        this.serviceProviders.set(provider, port);
        port.start();
    }

    /**
     * Handle message from service provider, 
     * which most likely is a request to call a service.
     * @param provider name of the service provider registered
     * @param event message event from service provider
     */
    private onServiceProviderMessage(provider: string, event: MessageEvent) {
        if (!this.serviceProviders.has(provider)) {
            throw new Error(`Service ${provider} not registered`);
        }
        const port = this.serviceProviders.get(provider);
        const message = event.data as IRpcMessage;
        switch (message.service) {
            case "ServiceManagerSelf":
                this.handleServiceManagerSelfMessage(port, message);
                break;
            default:
                this.handleServiceMessage(port, message);
                break;
        }
    }

    /**
     * Handle message from service provider, 
     * which most likely is a request to call a service.
     * @param port MessagePortMain object
     * @param message message from service provider
     */
    private handleServiceMessage(port: MessagePortMain | MessagePort, message: IRpcMessage) {
        const service = this.services.get(message.service);

        if (!service || !service[message.method]) {
            const undefinedMessage: IRpcMessage = {
                id: message.id,
                service: message.service,
                method: message.method,
                params: message.params
            };
            port.postMessage(undefinedMessage);
            return;
        }
        const method = service[message.method];
        method.apply(service, message.params).then((result: any) => {
            const response: IRpcMessage = {
                id: message.id,
                service: message.service,
                method: message.method,
                params: message.params,
                result,
            };
            port.postMessage(response);
        }).catch((error: any) => {
            const response: IRpcMessage = {
                id: message.id,
                service: message.service,
                method: message.method,
                params: message.params,
                error,
            };
            port.postMessage(response);
        });
    }

    /**
     * Handle message from service provider, 
     * which most likely is a request to call a service.
     * @param port MessagePortMain object
     * @param message message from service provider
     */
    private handleServiceManagerSelfMessage(port: MessagePortMain | MessagePort, message: IRpcMessage) {
        switch (message.method) {
            case "getServices":
                const response: IRpcMessage = {
                    id: message.id,
                    service: message.service,
                    method: message.method,
                    params: message.params,
                    result: []
                };
                this.services.forEach((value, key) => {
                    response.result.push({
                        name: key,
                        methods: Object.keys(value)
                    });
                });
                port.postMessage(response);
                break;
            default:
                throw new Error(`Unknown method ${message.method}`);
        }

    }
}