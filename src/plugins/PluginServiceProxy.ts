import { IServiceProxy, RPCMessage, RPCRequestMessage } from "@charliej107/vankyle-cite-rpc";
import { IPluginService } from "../../vankyle-cite-plugin/src/IPluginService";

export class PluginServiceProxy<T extends IPluginService> implements IServiceProxy<T> {

    private serviceName: string;
    private messagePort: MessagePort;
    private pendingCalls: Map<number, {
        resolve: (value: any) => void,
        reject: (reason?: any) => void,
    }> = new Map();

    constructor(service_name: string, messagePort: MessagePort) {
        this.serviceName = service_name;
        this.messagePort = messagePort;
        this.messagePort.onmessage = this.handleMessage.bind(this);

    }

    async call<M extends keyof T>(method: M, ...args: Parameters<T[M]>): Promise<ReturnType<T[M]>> {
        const messageId = Date.now();
        return new Promise<ReturnType<T[M]>>((resolve, reject) => {
            this.pendingCalls.set(messageId, { resolve, reject });
            this.requestServiceCall(messageId, method as string, ...args);
        });
    }

    private requestServiceCall(messageId: number, method: string, ...args: any[]) {
        const message: RPCRequestMessage = {
            header: {
                id: messageId,
                from: this.serviceName + '-proxy',
                type: 'request',
                method: method,
                service: this.serviceName,
            },
            body: args,
        };
        this.messagePort.postMessage(message);
    }

    private handleMessage(messageEvent: MessageEvent) {
        const message = messageEvent.data;
        switch (message.header.type) {
            case 'response':
                this.handleResponse(message);
                break;
            default:
                throw new Error(`Unknown message type ${message.header.type}`);
                break;
        }
    }

    private handleResponse(message: RPCMessage) {
        const { id } = message.header;
        const pendingCall = this.pendingCalls.get(id);
        if (!pendingCall) {
            throw new Error(`No pending call for message ${id}`);
        }
        if (message.body.error) {
            pendingCall.reject(message.body.error);
            return;
        }
        pendingCall.resolve(message.body);
    }
}