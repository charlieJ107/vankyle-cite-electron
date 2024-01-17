import { app } from "electron";
import path from "path";
import fs from "fs";

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

    async readFileContent(filePath: string): Promise<Buffer> {
        return await fs.promises.readFile(filePath);
    }
}