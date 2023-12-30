export interface RPCMessageHeader {
    type: "request" | "response";
    from: string;
    id: number;
    method: string;
    service: string;
}

export interface RPCMessage {
    header: RPCMessageHeader;
    body: any;
}

export interface RPCRequestMessage extends RPCMessage {
    header: RPCMessageHeader & {
        type: "request";
    };
}

export interface RPCResponseMessage extends RPCMessage {
    header: RPCMessageHeader & {
        type: "response";
    };
}