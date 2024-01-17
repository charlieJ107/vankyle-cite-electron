import { IConfig } from "../../data/config/IConfig";
import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";

export class ConfigService {
    private configFilePath: string;
    private buffer: IConfig;
    constructor(appDataPath: string) {
        this.configFilePath = path.join(appDataPath, "config.json");
        fsExtra.ensureFileSync(this.configFilePath);
        let content = fs.readFileSync(this.configFilePath, "utf-8");
        // if config file is empty, create a new one
        if (content === "") {
            const defaultConfig: IConfig = {
                plugins: {
                    plugin_dir: path.join(appDataPath, "plugins"),
                    enabled_plugins: []
                },
                data: {
                    data_dir: path.join(appDataPath, "data")
                }
            };
            content = JSON.stringify(defaultConfig, null, 4);
            fs.writeFileSync(this.configFilePath, content);
        }
        this.configFilePath = this.configFilePath;
        this.buffer = JSON.parse(content);
    }

    async getConfig() {
        const content = fs.readFileSync(this.configFilePath, "utf-8");
        this.buffer = JSON.parse(content);
        return this.buffer;
    }

    async updateConfig(config: IConfig) {
        this.buffer = config;
        fs.writeFileSync(this.configFilePath, JSON.stringify(this.buffer, null, 4));
    }

}