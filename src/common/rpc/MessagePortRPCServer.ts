import { IRPCServer } from "./IRPCServer";

export class MessagePortRPCServer implements IRPCServer {
    private messagePort: MessagePort;
    constructor(messagePort: MessagePort) {
        this.messagePort = messagePort;
    }
    init(): void {
        this.messagePort.onmessage = (event: MessageEvent) => {
            this.handle(event.data);
        };
    }
    handle(message: any): void {
        console.log("MessagePortRPCServer.handle: " + JSON.stringify(message));
        this.messagePort.postMessage(message);
    }
}