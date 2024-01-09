import { MessageChannelMain, MessagePortMain } from "electron";
import { IIpcMessage, REGISTER_AGENT } from "./IMessages";

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
        // TODO

    }

    
    private services: Map<string, any> = new Map();
    public registerService(service: string, constructor: new (...args: any[]) => any) {
        const methods = Object.getOwnPropertyNames(constructor.prototype).filter((name) => name !== "constructor" && typeof constructor.prototype[name] === "function");
        this.services.set(service, {constructor, methods});
    }
}