

export interface IPaperStorage {
    // CURD pdf file of specific paper
    getPaperHrefs(id: string): Promise<string>
    getPaperFile(id: string): Promise<Buffer>;
    savePaperFile(id: string, file: Buffer): Promise<void>;
    deletePaperFile(id: string): Promise<void>;
}