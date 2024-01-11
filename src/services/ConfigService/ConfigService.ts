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
        const configPath = path.resolve(this.fileSystemService.getPath("userData"), "config.json");
        fsExtra.ensureFileSync(path.dirname(configPath));
        const content = fs.readFileSync(configPath, "utf-8");
        // if config file is empty, create a new one
        if (content === "") {
            fs.writeFileSync(configPath, JSON.stringify({
                plugins: {
                    plugin_dir: path.resolve(this.fileSystemService.getPath("userData"), "plugins"),
                    enabled_plugins: []
                }
            }, null, 4));
        }
        this.buffer = JSON.parse(content);
    }

    getConfig() {
        return this.buffer;
    }

    updateConfig(config: IConfig) {
        this.buffer = config;
        const configPath = path.resolve(this.fileSystemService.getPath("userData"), "config.json");
        fs.writeFileSync(configPath, JSON.stringify(this.buffer, null, 4));
    }

}