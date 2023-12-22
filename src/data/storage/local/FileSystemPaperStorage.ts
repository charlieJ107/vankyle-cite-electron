import { IPaperStorage } from "../IPaperStorage";

export class FileSystemPaperStorage implements IPaperStorage {
    
    getPaperFile(id: string): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
    savePaperFile(id: string, file: Buffer): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deletePaperFile(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}