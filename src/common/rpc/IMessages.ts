
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
