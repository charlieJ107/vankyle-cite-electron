import { IMessage } from "./IMessage";

export interface IRPCClient {
    init(): void;
    request(message: IMessage): Promise<IMessage>;
}