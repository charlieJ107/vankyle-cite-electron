import { IMessage } from "./IMessage";
import { IRPCClient } from "./IRPCClient";

export class MessagePortRPCClient<TMessage extends IMessage> implements IRPCClient<TMessage> {
    private messagePort: MessagePort;
    constructor(messagePort: MessagePort) {
        this.messagePort = messagePort;
    }
    init(): void {
        this.messagePort.onmessage = (event: MessageEvent) => {
            this.handle(event.data);
        };
    }
    handle(message: TMessage): void {
        console.log("MessagePortRPCClient.handle: " + JSON.stringify(message));
    }
    request(message: TMessage): Promise<TMessage> {
        return new Promise<TMessage>((resolve, _reject) => {
            this.messagePort.postMessage(message);
            this.messagePort.onmessage = (event: MessageEvent) => {
                resolve(event.data);
            };
        });
    }
}