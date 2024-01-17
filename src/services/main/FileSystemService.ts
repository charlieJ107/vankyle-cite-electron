import { app } from "electron";
import path from "path";
import fs from "fs";
import { EventEmitter } from "events";

type PathName = 'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps'

export class FileSystemService {
    private appDataPath: string;
    constructor() {
        this.appDataPath = path.resolve(app.getPath('appData'), 'vankyle-cite');
    }

    async getPath(name: PathName) {
        return app.getPath(name);
    }

    async getAppDataPath() {
        return this.appDataPath;
    }

    async readFile(path: fs.PathLike | fs.promises.FileHandle, options?: {
        encoding?: null;
        flag?: fs.OpenMode;
    } & EventEmitter.Abortable): Promise<Buffer> {
        return await fs.promises.readFile(path, options);
    }
}