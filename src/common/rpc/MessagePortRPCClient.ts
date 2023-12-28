import { IRPCClient } from "./IRPCClient";

export class MessagePortRPCClient implements IRPCClient {
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
        console.log("MessagePortRPCClient.handle: " + JSON.stringify(message));
    }
    request(message: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.messagePort.postMessage(message);
            this.messagePort.onmessage = (event: MessageEvent) => {
                resolve(event.data);
            };
        });
    }
}