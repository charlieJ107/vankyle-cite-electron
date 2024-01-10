import { MessageChannelMain, MessagePortMain } from "electron";
import { IControlMessage, IIpcMessage, IMessage, IRpcMessage, REGISTER, REGISTER_AGENT, isControlMessage, isRpcMessage } from "./IMessages";
import { IRpcAgent } from "./IRpcAgent";

export class MessagePortRpcAgent implements IRpcAgent {
    private managerPort: MessagePort | MessagePortMain | null; // MessagePort to ServiceManager
    private pendingCalls: Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>;
    private postIpcMessage: (message: IIpcMessage, transfer?: MessagePortMain[] | MessagePort[]) => void;
    private agentId: string;
    private methods: Map<string, any> = new Map();
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
            const message = event.data as IRpcMessage;
            switch (message.direction) {
                case "REQUEST":
                    this.onRpcRequest(message);
                    break;
                case "RESPONSE":
                    this.onResponse(message);
                    break;
                default:
                    console.warn("Invalid RPC message direction: ", message);
                    break;
            }
        } else if (isControlMessage(event.data)) {
            const message = event.data as IControlMessage;
            switch (message.command) {
                case "REGISTER":
                    this.onRegister(message);
                    break;
                default:
                    console.warn("Invalid Control message command: ", message);
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
        if (this.methods.has(message.payload)) {
            console.warn("Method already registered: ", message);
            return;
        }
        console.log("Register method: ", message.payload);
        this.methods.set(message.payload, (...args: any[]) => this.call(message.payload, ...args));
    }
    private async onRpcRequest(message: IRpcMessage) {
        const { id, method, payload } = message;
        const func = this.resolve(method);
        if (!func) {
            console.warn("Method not found: ", message);
            return;
        }

        try {
            const result = await func(...payload);
            const response: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                method: method,
                payload: result,
            };
            this.managerPort.postMessage(response);
        } catch (error) {
            const response: IRpcMessage = {
                id,
                type: "RPC",
                direction: "RESPONSE",
                method: method,
                payload: error,
            };
            this.managerPort.postMessage(response);
        }
    }

    private call(name: string, ...args: any[]): Promise<any> {
        if (!this.managerPort) {
            throw new Error("ServiceManager port not initialized");
        }
        const id = Date.now() + Math.floor(Math.random() * 10);
        const message: IRpcMessage = {
            id,
            type: "RPC",
            direction: "REQUEST",
            method: name,
            payload: args,
        };
        const promise = new Promise((resolve, reject) => {
            this.pendingCalls.set(id, { resolve, reject });
            this.managerPort.postMessage(message);
        });
        return promise;
    }

    public register(name: string, func: (...args: any[]) => any) {
        this.methods.set(name, func);
        if (this.managerPort) {
            const message: IControlMessage = {
                id: Date.now() + Math.floor(Math.random() * 10),
                type: "CONTROL",
                command: REGISTER,
                payload: name,
            };
            this.managerPort.postMessage(message);
        }
    }

    public resolve<T extends (...args: any[]) => any>(name: string): T {
        const func = this.methods.get(name);
        if (!func) {
            throw new Error(`Method ${name} not found`);
        }
        return func;
    }
}