import { IConfig } from "@/data/config/IConfig";
import { FileSystemService } from "@/main/services/FileSystemService";
import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";

export class ConfigService {
    private file: string;
    private buffer: IConfig;
    private fileSystemService: FileSystemService;
    constructor(fileSystemService: FileSystemService) {
        this.fileSystemService = fileSystemService;
        console.log("Initializing ConfigService");
        this.fileSystemService.getPath("userData").then((userDataPath) => {
            console.log("userDataPath: ", userDataPath);
            const configPath = path.resolve(userDataPath, "config.json");
            fsExtra.ensureFileSync(path.dirname(configPath));
            const content = fs.readFileSync(configPath, "utf-8");
            // if config file is empty, create a new one
            if (content === "") {
                fs.writeFileSync(configPath, JSON.stringify({
                    plugins: {
                        plugin_dir: path.resolve(userDataPath, "plugins"),
                        enabled_plugins: []
                    }
                }, null, 4));
            }
            this.buffer = JSON.parse(content);
            this.file = configPath;
        });

    }

    getConfig() {
        const content = fs.readFileSync(this.file, "utf-8");
        this.buffer = JSON.parse(content);
        return this.buffer;
    }

    async updateConfig(config: IConfig) {
        this.buffer = config;
        fs.writeFileSync(this.file, JSON.stringify(this.buffer, null, 4));
    }

}