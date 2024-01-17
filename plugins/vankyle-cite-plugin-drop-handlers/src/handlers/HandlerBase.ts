import { Paper } from "vankyle-cite-types";

export abstract class HandlerBase {
    constructor() {

    }
    public abstract handleDrop(filePath: string): Promise<Paper>;

    public abstract isSupport(filePaths: string): boolean;
}