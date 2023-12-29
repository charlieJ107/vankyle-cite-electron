import { IFileStorage } from "../IFileStorage";
import fs from "fs";

export class LocalFileSystemStorage implements IFileStorage {
    private rootPath: string;
    constructor(rootPath: string) {
        if (!fs.existsSync(rootPath)) {
            fs.mkdirSync(rootPath);
        }
        this.rootPath = rootPath;
    }
    getPath(id: string): Promise<string> {
        // get file from rootPath, file name is id
        return Promise.resolve(this.rootPath + "/" + id);
    }
    get(id: string): Promise<Buffer> {
        // get file from rootPath, file name is id
        return Promise.resolve(fs.readFileSync(this.rootPath + "/" + id));
    }
    save(id: string, file: Buffer): Promise<void> {
        // save file to rootPath, file name is id
        return Promise.resolve(fs.writeFileSync(this.rootPath + "/" + id, file));
    }
    saveByPath(id: string, path: string): Promise<void> {
        // save file to rootPath, file name is id
        return Promise.resolve(fs.copyFileSync(path, this.rootPath + "/" + id));
    }
    delete(id: string): Promise<void> {
        // delete file from rootPath, file name is id
        return Promise.resolve(fs.unlinkSync(this.rootPath + "/" + id));
    }

}