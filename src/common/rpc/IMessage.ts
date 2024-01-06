
export interface IMessage {
    id: number;
    type: "RPC" | "IPC";
    direction: "REQUEST" | "RESPONSE";
}

export interface IRpcMessage extends IMessage {
    from: string;
    to: string;
    service: string;
    method: string;
    payload: any;
}

export interface IIpcMessage extends IMessage {
    channel: "REGISTER_SERVICE_PROVIDER" | "REQUEST_SERVICE_LIST";
    payload: any;
}

export interface IServiceInfo {
    service: string;
    providerId: string;
    methods: string[];
}

export function isRpcMessage(message: any): message is IRpcMessage {
    return message.id && message.type === "RPC" && message.method && message.service && message.payload && message.direction;
}

export function isIpcMessage(message: any): message is IIpcMessage {
    return message.id && message.type === "IPC" && message.channel && message.payload && message.direction;
}

export const REGISTER_SERVICE_PROVIDER = "REGISTER_SERVICE_PROVIDER";
export const REQUEST_SERVICE_LIST = "REQUEST_SERVICE_LIST";