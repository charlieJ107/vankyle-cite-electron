import { MessageChannelMain, MessagePortMain } from "electron";
import { IControlMessage, IIpcMessage, IMessage, IRpcMessage, REGISTER_AGENT, isControlMessage, isRpcMessage } from "./IMessages";

export class MessagePortRpcAgent {
    private managerPort: MessagePort | MessagePortMain | null; // MessagePort to ServiceManager
    private pendingCalls: Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>;
    private postIpcMessage: (message: IIpcMessage, transfer?: MessagePortMain[] | MessagePort[]) => void;
    private agentId: string;

    constructor(postIpcMessage: (message: IIpcMessage, transfer: MessagePortMain[] | MessagePort[]) => void) {
        this.managerPort = null;
        this.postIpcMessage = postIpcMessage;
        this.agentId = `${process.type}-${process.pid}`;
        this.pendingCalls = new Map();
        // Register self as a service provider to ServiceManager
        const registerServiceProviderMessage: IIpcMessage = {
            id: Date.now() + Math.floor(Math.random() * 10),
            type: "IPC",
            channel: REGISTER_AGENT,
            payload: this.agentId,
        };
        switch (process.type) {
            case "renderer":
            case "worker":
            case "utility":
                const channel = new MessageChannel();
                this.managerPort = channel.port1;
                this.managerPort.onmessage = (messageEvent) => { this.onManagerMessage(messageEvent); }
                this.postIpcMessage(registerServiceProviderMessage, [channel.port2]);
                break;
            case "browser":
                const channelMain = new MessageChannelMain();
                this.managerPort = channelMain.port1;
                this.managerPort.on("message", (messageEvent) => { this.onManagerMessage(messageEvent); })
                this.postIpcMessage(registerServiceProviderMessage, [channelMain.port2]);
                break;
            default:
                throw new Error("Invalid process type");
                break;
        }
    }
    private async onManagerMessage(event: MessageEvent | Electron.MessageEvent) {
        if (isRpcMessage(event.data)) {
            switch (event.data.direction) {
                case "REQUEST":
                    this.onRpcRequest(event.data);
                    break;
                case "RESPONSE":
                    this.onResponse(event.data);
                    break;
                default:
                    console.warn("Invalid RPC message direction: ", event.data);
                    break;
            }
        } else if (isControlMessage(event.data)) {
            switch (event.data.command) {
                case "REGISTER":
                    // TODO
                    break;
                default:
                    console.warn("Invalid Control message command: ", event.data);
                    break;
            }
        } else {
            console.warn("Invalid message received, expected RPC or Control message: ", event.data);
        }
    }
    private onResponse(message: IMessage) {
        const { id, payload } = message;
        if (!this.pendingCalls.has(id)) {
            console.warn("Pending call not found for response message: ", message);
            return;
        }
        const { resolve, reject } = this.pendingCalls.get(id) as { resolve: (value: any) => void, reject: (reason: any) => void };
        if (payload instanceof Error) {
            reject(payload);
        } else {
            resolve(payload);
        }
        this.pendingCalls.delete(id);
    }
    private onRegister(message: IControlMessage) {

    }
    private onRpcRequest(message: IRpcMessage) {
        const func = this.resolve(message.method);
        if (!func) {
            console.warn("Service not found: ", message);
            return;
        }
        const { id, payload } = message;
        try {
            const result = func(...payload);
            const response: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                service: this.agentId,
                method: message.method,
                payload: result,
            };
            this.managerPort.postMessage(response);
        } catch (error) {
            const response: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                service: this.agentId,
                method: message.method,
                payload: error,
            };
            this.managerPort.postMessage(response);
        }
    }

    private call(name: string, ...args: any[]) {
        if (!this.managerPort) {
            throw new Error("ServiceManager port not initialized");
        }
        const id = Date.now() + Math.floor(Math.random() * 10);
        const message: IRpcMessage = {
            id,
            type: "RPC",
            direction: "REQUEST",
            service: this.agentId,
            method: name,
            payload: args,
        };
        const promise = new Promise((resolve, reject) => {
            this.pendingCalls.set(id, { resolve, reject });
        });
    }

    private services: Map<string, any> = new Map();
    public register(name: string, func: (...args: any[]) => any) {
        this.services.set(name, func);
    }

    public resolve<T extends (...args: any[]) => any>(name: string): T {
        const func = this.services.get(name);
        if (!func) {
            throw new Error(`Service ${name} not found`);
        }
        return func;
    }
}