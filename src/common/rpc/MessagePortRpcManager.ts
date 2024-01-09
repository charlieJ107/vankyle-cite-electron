import { MessagePortMain, MessageEvent } from "electron";
import { IIpcMessage, REGISTER_AGENT, isIpcMessage } from "./IMessages";

export class MessagePortRpcManager {
    private providers: Map<string, MessagePort | MessagePortMain>;
    private pendingRequests: Map<number, { resolve: (result: any) => void; reject: (reason: any) => void }>;
    constructor() {
        this.providers = new Map();
        this.pendingRequests = new Map();
        process.parentPort.on("message", (event) => this.onParentPortMessage(event));
    }
    private onParentPortMessage(event: MessageEvent): void {
        if (!isIpcMessage(event.data)) {
            console.warn("Invalid message received, expected register provider ipc message: ", event.data);
            return;
        }

        const message = event.data as IIpcMessage;
        switch (message.channel) {
            case REGISTER_AGENT:
                const [port] = event.ports;
                if (!port) {
                    console.warn("No port come with service provider registration", event);
                    return;
                }
                this.registerAgent(message.payload, port);
                break;
            default:
                console.warn("Invalid parent port IPC message channel: ", message);
                break;
        }
    }
    public registerAgent(agentId: string, port: MessagePortMain | MessagePort) {
        if (this.providers.has(agentId)) {
            console.warn(`ServiceProvider ${agentId} already registered, overwriting...`);
            // We should overwrite the existing one, as the new service provider created a new MessagePort for communication
        }
        if (port instanceof MessagePort) {
            port.onmessage = (event) => this.onAgentMessage(agentId, event as globalThis.MessageEvent);
        } else {
            port.on("message", (event) => this.onAgentMessage(agentId, event as Electron.MessageEvent));
        }

        this.providers.set(agentId, port);
        port.start();
        console.log("ServiceProvider registered: ", agentId);
    }

    private onAgentMessage(providerId: string, event: globalThis.MessageEvent | Electron.MessageEvent): void {
        // TODO
    }
}