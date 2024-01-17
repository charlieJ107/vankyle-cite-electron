import { Paper } from "vankyle-cite-types";

export abstract class HandlerBase {
    constructor() {

    }
    public abstract handleDrop(filePath: string): Paper;

    public abstract isValidDrop(filePaths: string): boolean;
}