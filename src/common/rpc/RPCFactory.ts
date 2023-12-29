import { IMessage } from "./IMessage";
import { IRPCClient } from "./IRPCClient";
import { IRPCServer } from "./IRPCServer";
import { MessagePortRPCClient } from "./MessagePortRPCClient";

export interface IRPCPair<TMessage extends IMessage> {
    client: IRPCClient<TMessage>;
    server: IRPCServer<TMessage>;
}
export function CreateRPCPair<TMessage extends IMessage>(): IRPCPair<TMessage> {
    const messageChannel = new MessageChannel();
    const client_port = messageChannel.port1;
    const server_port = messageChannel.port2;
    const client = new MessagePortRPCClient<TMessage>(client_port);
    const server = new MessagePortRPCClient<TMessage>(server_port);
    return { client: client, server: server };
}