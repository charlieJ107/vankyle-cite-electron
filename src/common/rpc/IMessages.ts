
export interface IMessage {
    id: number;
    type: "RPC" | "IPC" | "CONTROL";
    payload: any;
}


export interface IIpcMessage extends IMessage {
    type: "IPC";
    channel: "REGISTER_AGENT";
}
export const REGISTER_AGENT = "REGISTER_AGENT";
export function isIpcMessage(message: any): message is IIpcMessage {
    return message.id && message.type === "IPC" && message.channel && message.payload;
}


export interface IRpcMessage extends IMessage {
    type: "RPC";
    direction: "REQUEST" | "RESPONSE";
    method: string;
}
export function isRpcMessage(message: any): message is IRpcMessage {
    return message.id && message.type === "RPC" && message.method && message.payload && (message.direction === "REQUEST" || message.direction === "RESPONSE");
}

export interface IControlMessage extends IMessage {
    type: "CONTROL";
    command: "REGISTER";
}
export const REGISTER = "REGISTER";
export function isControlMessage(message: any): message is IControlMessage {
    return message.id && message.type === "CONTROL" && message.command && message.payload;
}
