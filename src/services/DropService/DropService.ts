import { IRpcAgent } from "@/common/rpc/IRpcAgent";
import { Paper } from "@/models/paper";

const DROP_SERVICE_DROP_EVENT = "DropService.dropEvent";
const DROP_SERVICE_REGISTER_HANDLER = "DropService.registerHandler";
export class DropService {
    private rpcAgent: IRpcAgent;
    private noticeServer: (event: string, data: any) => void;
    constructor(rpcAgent: IRpcAgent) {
        this.rpcAgent = rpcAgent;
        this.noticeServer = rpcAgent.resolve("DropServiceServer.noticeServer");

    }

    public registerDropHandler(handler: (filePaths: string[]) => Paper[]): void {
        const name = `${DROP_SERVICE_REGISTER_HANDLER}-${this.rpcAgent.agentId}-${Math.floor(Math.random() * 100)}`;
        this.rpcAgent.register(name, handler);
        this.noticeServer("DropService.registerDropHandler", name);
    }

    public handleDropEvent(filePaths: string[]): void {

        this.noticeServer(DROP_SERVICE_DROP_EVENT, filePaths);
    }
}

export class DropServiceServer {
    private rpcAgent: IRpcAgent;
    private dropHandlers: Map<string, (data: any) => any> = new Map();

    constructor(rpcAgent: IRpcAgent) {
        this.rpcAgent = rpcAgent;
        this.rpcAgent.register("DropServiceServer.noticeServer", (event: string, data: any) => {
            this.noticeServer(event, data);
        });
    }

    private noticeServer(event: string, data: any) {
        switch (event) {
            case DROP_SERVICE_REGISTER_HANDLER:
                this.registerDropHandler(data);
                break;
            case DROP_SERVICE_DROP_EVENT:
                this.handleDropEvent(data);
                break;
            default:
                console.warn("Invalid event: ", event);
                break;
        }
        return "ok";
    }

    private registerDropHandler(name: string): void {
        this.dropHandlers.set(name, this.rpcAgent.resolve(name));
    }

    private handleDropEvent(filePaths: string[]): void {
        console.log("handleDropEvent: ", filePaths)
        let paper: Paper;
        this.dropHandlers.forEach((handler) => {
            paper = handler(filePaths);
        });

    }
}