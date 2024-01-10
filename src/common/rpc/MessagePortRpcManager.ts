import { MessagePortMain, MessageEvent } from "electron";
import { IControlMessage, IIpcMessage, IMessage, IRpcMessage, REGISTER, REGISTER_AGENT, isControlMessage, isIpcMessage, isRpcMessage } from "./IMessages";

export class MessagePortRpcManager {
    private providers: Map<string, MessagePort | MessagePortMain>;
    private pendingCalls: Map<number, { resolve: (result: any) => void; reject: (reason: any) => void }>;
    private methods: Map<string, any> = new Map();
    constructor() {
        this.providers = new Map();
        this.pendingCalls = new Map();
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
            console.warn(`Agent ${agentId} already registered, overwriting...`);
            // We should overwrite the existing one, as the new service provider created a new MessagePort for communication
        }
        if (port instanceof MessagePort) {
            port.onmessage = (event) => this.onAgentMessage(agentId, event as globalThis.MessageEvent);
        } else {
            port.on("message", (event) => this.onAgentMessage(agentId, event as Electron.MessageEvent));
        }

        this.providers.set(agentId, port);
        port.start();
        for (const [method, provider] of this.methods.entries()) {
            const controlMessage: IControlMessage = {
                type: "CONTROL",
                id: Date.now() + Math.floor(Math.random() * 10),
                command: REGISTER,
                payload: method
            };
            port.postMessage(controlMessage);

        }
    }

    private onAgentMessage(providerId: string, event: globalThis.MessageEvent | Electron.MessageEvent): void {
        if (isRpcMessage(event.data)) {
            const message = event.data;
            switch (message.direction) {
                case "REQUEST":
                    this.onRpcRequest(providerId, message);
                    break;
                case "RESPONSE":
                    this.onRpcResponse(message);
                    break;
                default:
                    console.warn("Invalid RPC message direction: ", message);
                    break;
            }
        } else if (isControlMessage(event.data)) {
            const message = event.data as IControlMessage;
            switch (message.command) {
                case "REGISTER":
                    this.methods.set(message.payload, providerId);
                    for (const [id, port] of this.providers.entries()) {
                        if (id === providerId) {
                            continue;
                        }
                        port.postMessage(message);
                    }
                    break;
                default:
                    console.warn("Invalid Control message command: ", event.data);
                    break;
            }
        } else {
            console.warn("Invalid message received, expected RPC or Control message: ", event.data);
        }
    }

    private async onRpcRequest(requester: string, message: IRpcMessage) {
        const { id, method } = message;
        const provider = this.methods.get(method);
        if (!provider) {
            console.warn("Method not found: ", message);
            return;
        }
        const providerPort = this.providers.get(provider) as MessagePort | MessagePortMain;
        const result = await new Promise((resolve, reject) => {
            this.pendingCalls.set(id, { resolve, reject });
            providerPort.postMessage(message);
        });
        const response: IRpcMessage = {
            id,
            type: "RPC",
            direction: "RESPONSE",
            method,
            payload: result
        };
        const requesterPort = this.providers.get(requester) as MessagePort | MessagePortMain;
        requesterPort.postMessage(response);
    }
    private onRpcResponse(message: IMessage) {
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
}