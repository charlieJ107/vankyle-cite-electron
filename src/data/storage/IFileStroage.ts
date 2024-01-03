export interface IFileStorage {
    getPath(id: string): Promise<string>
    get(id: string): Promise<Buffer>;
    save(id: string, file: Buffer): Promise<void>;
    saveByPath(id: string, path: string): Promise<void>;
    delete(id: string): Promise<void>;
}