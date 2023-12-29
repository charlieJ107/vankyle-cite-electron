import { IMessage } from "./IMessage";

export interface IRPCClient<TMessage extends IMessage> {
    init(): void;
    request(message: TMessage): Promise<TMessage>;
}