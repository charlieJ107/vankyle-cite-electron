
export interface IMessage {
    id: number;
    type: "RPC" | "IPC" | "CONTROL";
    payload: any;
}

export interface IRpcMessage extends IMessage {
    type: "RPC";
    direction: "REQUEST" | "RESPONSE";
    service: string;
    method: string;
}

export interface IIpcMessage extends IMessage {
    type: "IPC";
    channel: "REGISTER_SERVICE_PROVIDER";
}

export interface IControlMessage extends IMessage {
    type: "CONTROL";
    channel: "REGISTER_SERVICE";
}

export interface IServiceInfo {
    service: string;
    providerId: string;
    methods: string[];
}

export function isMessage(message: any): message is IMessage {
    return message.id && (message.type === "RPC" || message.type === "IPC" || message.type === "CONTROL") && message.payload;
}

export function isRpcMessage(message: any): message is IRpcMessage {
    return message.id && message.type === "RPC" && message.method && message.service && message.payload && (message.direction === "REQUEST" || message.direction === "RESPONSE");
}

export function isIpcMessage(message: any): message is IIpcMessage {
    return message.id && message.type === "IPC" && message.channel && message.payload;
}

export function isControlMessage(message: any): message is IControlMessage {
    return message.id && message.type === "Control" && message.channel && message.payload;
}

export const REGISTER_SERVICE_PROVIDER = "REGISTER_SERVICE_PROVIDER";
export const REGISTER_SERVICE = "REGISTER_SERVICE";