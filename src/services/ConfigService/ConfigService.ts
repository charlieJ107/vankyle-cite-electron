import { IConfig } from "../../common/config/ConfigInterfaces";
import fs from "fs";
import path from "path";
import { IAppService } from "../IAppService";
import { MessagePortMain } from "electron";

const defaultConfig: IConfig = {
    plugins: {
        plugin_dir: "plugins",
        enabled_plugins: []
    }
}

export class ConfigService implements IAppService {
    private rootPath: string;
    private config: IConfig;
    // [key: string]: any;
    constructor(rootPath: string = path.join(__dirname, "config")) {
        console.log("Initializing ConfigService with root path: ", rootPath)
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
        console.log('ConfigService initialized');
    }
    init = async (_meessagePort: MessagePortMain) => { };
    getConfig = (): IConfig => {
        return this.config;
    }
}