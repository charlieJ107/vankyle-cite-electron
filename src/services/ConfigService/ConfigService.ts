import { IConfig } from "../../common/config/ConfigInterfaces";
import { IService } from "../IService";
import fs from "fs";
import path from "path";

const defaultConfig: IConfig = {
    plugins: {
        plugin_dir: "plugins",
        enabled_plugins: []
    }
}

export class ConfigService implements IService {
    private rootPath: string;
    private config: IConfig;
    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.config = defaultConfig;
        if (!(fs.existsSync(rootPath))) {
            fs.mkdirSync(rootPath);
        }
        if (!(fs.existsSync(path.join(this.rootPath, "config.json")))) {
            fs.writeFileSync(path.join(this.rootPath, "config.json"), JSON.stringify(this.config));
        } else {
            this.config = JSON.parse(fs.readFileSync(path.join(this.rootPath, "config.json")).toString()) as IConfig;
        }
    }

    public getConfig(): IConfig {
        return this.config;
    }
}