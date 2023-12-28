export interface IMessageHeader {
    type: string;
    target: string;
    id: string;
    method: string;
    params: any;
}

export interface IMessage {
    header: IMessageHeader;
    body: any;
}