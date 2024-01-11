import { app } from "electron";

type PathName = 'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps'

export class FileSystemService {
    constructor() {
    }

    getPath(name: PathName) {
        return app.getPath(name);
    }
}