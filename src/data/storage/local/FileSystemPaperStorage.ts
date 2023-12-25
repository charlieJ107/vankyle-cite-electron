import { IPaperStorage } from "../IPaperStorage";

export class FileSystemPaperStorage implements IPaperStorage {
    async getPaperHrefs(id: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
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