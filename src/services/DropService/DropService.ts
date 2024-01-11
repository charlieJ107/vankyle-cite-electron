import { IRpcAgent } from "@/common/rpc/IRpcAgent";

export class DropService {
    private dropHandlers: Map<string, (data: any) => any>;
    private rpcAgent: IRpcAgent;
    constructor(rpcAgent: IRpcAgent) {
        this.dropHandlers = new Map<string, (data: any) => any>();
        this.rpcAgent = rpcAgent;
    }

    registerDropHandler<T>(name: string, handler: (data: T) => T): void {
        this.dropHandlers.set(name, handler);
    }

    handleDrop<T>(data: T): T {
        for (const handler of this.dropHandlers.values()) {
            data = handler(data);
        }
        return data;
    }
}