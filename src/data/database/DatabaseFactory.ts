import { BaseDataModel } from "@/models/DataModel";
import { IConfig } from "../config/IConfig";
import { JsonFileDatabase } from "./local/JsonFileDatabase";
import { IDatabase } from "./IDatabase";

export class DatabaseFactory {
    config: IConfig;
    constructor(config: IConfig) {
        this.config = config;
    }

    public getDatabase<T extends BaseDataModel>(): IDatabase<T> {
        return new JsonFileDatabase<T>();
    }
}