import { IPaperStorage } from "../IPaperStorage";
import fs from "fs";

export class FileSystemPaperStorage implements IPaperStorage {
    
    async getPaperFile(id: string): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
    savePaperFile(id: string, file: Buffer): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deletePaperFile(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}