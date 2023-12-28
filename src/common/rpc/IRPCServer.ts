import { IMessage } from "./IMessage";

export interface IRPCServer {
    init(): void;
    handle(message: IMessage): void;
}