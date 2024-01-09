
export interface IMessage {
    id: number;
    type: "RPC" | "IPC";
    payload: any;
}

export interface IRpcMessage extends IMessage {
    direction: "REQUEST" | "RESPONSE";
    service: string;
    method: string;
}

export interface IIpcMessage extends IMessage {
    channel: "REGISTER_SERVICE_PROVIDER" | "REGISTER_SERVICE";
}

export interface IServiceInfo {
    service: string;
    providerId: string;
    methods: string[];
}

export function isMessage(message: any): message is IMessage {
    return message.id && (message.type === "RPC" || message.type === "IPC") && message.payload;
}

export function isRpcMessage(message: any): message is IRpcMessage {
    return message.id && message.type === "RPC" && message.method && message.service && message.payload && (message.direction === "REQUEST" || message.direction === "RESPONSE");
}

export function isIpcMessage(message: any): message is IIpcMessage {
    return message.id && message.type === "IPC" && message.channel && message.payload;
}

export const REGISTER_SERVICE_PROVIDER = "REGISTER_SERVICE_PROVIDER";
export const REGISTER_SERVICE = "REGISTER_SERVICE";