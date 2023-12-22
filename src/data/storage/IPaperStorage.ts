

export interface IPaperStorage {
    // CURD pdf file of specific paper
    getPaperFile(id: string): Promise<Buffer>;
    savePaperFile(id: string, file: Buffer): Promise<void>;
    deletePaperFile(id: string): Promise<void>;
}