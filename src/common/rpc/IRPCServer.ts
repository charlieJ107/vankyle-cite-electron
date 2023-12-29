import { IMessage } from "./IMessage";

export interface IRPCServer<TMessage extends IMessage> {
    init(): void;
    handle(message: TMessage): void;
}