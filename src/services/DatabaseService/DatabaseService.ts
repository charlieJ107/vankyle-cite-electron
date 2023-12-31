import { IDatabase } from "../../data/database/IDatabase";
import { JsonFileDatabase } from "../../data/database/local/JsonFileDatabase";
import { BaseDataModel, DataModelName } from "../../models/DataModel";
import { Author } from "../../models/author";
import { Group } from "../../models/group";
import { Paper } from "../../models/paper";
import { Tag } from "../../models/tag";
import { IAppService } from "../IAppService";
import { MessagePortMain } from "electron";
import path from "path";

/**
 * 数据库服务，用于管理和封装数据库接口IDatabase的实例，不同的数据类型对应不同的数据库实例
 *  
 */
export class DatabaseService implements IAppService {
    constructor() {
        this.reigisterDatabase<Paper>(new JsonFileDatabase<Paper>(path.join(__dirname, "paper.json")), "Paper");
        this.reigisterDatabase<Author>(new JsonFileDatabase<Author>( path.join(__dirname, "author.json") ), "Author");
        this.reigisterDatabase<Group>(new JsonFileDatabase<Group>(path.join(__dirname, "group.json")), "Group");
        this.reigisterDatabase<Tag>(new JsonFileDatabase<Tag>(path.join(__dirname, "tag.json")), "Tag");
        console.log('DatabaseService initialized');
    }

    private databases: Map<string, IDatabase<any>[]> = new Map<string, IDatabase<any>[]>();

    init = async (_messagePort: MessagePortMain) => {
        
    }

    public reigisterDatabase<T extends BaseDataModel>(database: IDatabase<T>, dataModelName: DataModelName) {
        if (!this.databases.has(dataModelName)) {
            this.databases.set(dataModelName, []);
        }
        this.databases.get(dataModelName)!.push(database);
    }

    public async get<T extends BaseDataModel>(dataModelName: DataModelName, id: string): Promise<T | null> {
        const resultPrmises: Promise<BaseDataModel | null>[] = [];
        for (const database of this.databases.get(dataModelName)!) {
            const resultPromise = database.get(id);
            resultPrmises.push(resultPromise);
        }

        const results = await Promise.all(resultPrmises);
        // TODO: Multiple results should be merged.
        const result = results.find((result) => result !== null);
        return result === undefined ? null : result as T;
    }

    public async getList<T extends BaseDataModel>(dataModelName: DataModelName, filter?: (model: T) => boolean): Promise<T[]> {
        const resultPrmises: Promise<BaseDataModel[]>[] = [];
        for (const database_datamodel of this.databases.get(dataModelName)!) {
            const database = database_datamodel as IDatabase<T>;
            const resultPromise = database.getList(filter);
            resultPrmises.push(resultPromise);
        }

        const results = await Promise.all(resultPrmises);
        return results.reduce((previousValue, currentValue) => previousValue.concat(currentValue), []) as T[];
    }

    public async save<T extends BaseDataModel>(dataModelName: DataModelName, model: T): Promise<void> {
        const resultPrmises: Promise<void>[] = [];
        for (const database_datamodel of this.databases.get(dataModelName)!) {
            const database = database_datamodel as IDatabase<T>;
            const resultPromise = database.save(model);
            resultPrmises.push(resultPromise);
        }

        await Promise.all(resultPrmises);
    }

    public async delete<T extends BaseDataModel>(dataModelName: DataModelName, id: string): Promise<void> {
        const resultPrmises: Promise<void>[] = [];
        for (const database_datamodel of this.databases.get(dataModelName)!) {
            const database = database_datamodel as IDatabase<T>;
            const resultPromise = database.delete(id);
            resultPrmises.push(resultPromise);
        }

        await Promise.all(resultPrmises);
    }
}