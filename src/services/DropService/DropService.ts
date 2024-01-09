import { IService } from "../IService";

export class DropService implements IService {
    private dropHandlers: Map<string, (data: any) => any>;
    constructor() {
        this.dropHandlers = new Map<string, (data: any) => any>();
    }

    registerDropHandler = (name: string, handler: (data: any) => any) => {
        this.dropHandlers.set(name, handler);
    }

    handleDrop = (data: any) => {
        for (const handler of this.dropHandlers.values()) {
            data = handler(data);
        }
        return data;
    }
}