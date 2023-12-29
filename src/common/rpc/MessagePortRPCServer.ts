import { IMessage } from "./IMessage";
import { IRPCServer } from "./IRPCServer";

export class MessagePortRPCServer<TMessage extends IMessage> implements IRPCServer<TMessage> {
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
        console.log("MessagePortRPCServer.handle: " + JSON.stringify(message));
        this.messagePort.postMessage(message);
    }
}