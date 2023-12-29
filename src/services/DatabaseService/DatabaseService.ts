import { IDatabase } from "../../data/database/IDatabase";
import { DataModel, DataModelName } from "../../models/DataModel";
import { IService } from "../IService";
// 数据库服务，用于管理和封装数据库接口IDatabase的实例，不同的数据类型对应不同的数据库实例
export class DatabaseService implements IService {
    constructor() {

    }

    private databases: Map<string, IDatabase<DataModel>[]> = new Map<string, IDatabase<DataModel>[]>();

    public reigisterDatabase<T extends DataModel>(database: IDatabase<T>, dataModelName: DataModelName) {
        if (!this.databases.has(dataModelName)) {
            this.databases.set(dataModelName, []);
        }
        this.databases.get(dataModelName)!.push(database);
    }

    public async get<T extends DataModel>(dataModelName: DataModelName, id: string): Promise<T | null> {
        const resultPrmises: Promise<DataModel | null>[] = [];
        for (const database of this.databases.get(dataModelName)!) {
            const resultPromise = database.get(id);
            resultPrmises.push(resultPromise);
        }

        const results = await Promise.all(resultPrmises);
        // TODO: Multiple results should be merged.
        const result = results.find((result) => result !== null);
        return result === undefined ? null : result as T;
    }

    public async getList<T extends DataModel>(dataModelName: DataModelName, filter?: (model: T) => boolean): Promise<T[]> {
        const resultPrmises: Promise<DataModel[]>[] = [];
        for (const database_datamodel of this.databases.get(dataModelName)!) {
            const database = database_datamodel as IDatabase<T>;
            const resultPromise = database.getList(filter);
            resultPrmises.push(resultPromise);
        }

        const results = await Promise.all(resultPrmises);
        return results.reduce((previousValue, currentValue) => previousValue.concat(currentValue), []) as T[];
    }

    public async save<T extends DataModel>(dataModelName: DataModelName, model: T): Promise<void> {
        const resultPrmises: Promise<void>[] = [];
        for (const database_datamodel of this.databases.get(dataModelName)!) {
            const database = database_datamodel as IDatabase<T>;
            const resultPromise = database.save(model);
            resultPrmises.push(resultPromise);
        }

        await Promise.all(resultPrmises);
    }

    public async delete<T extends DataModel>(dataModelName: DataModelName, id: string): Promise<void> {
        const resultPrmises: Promise<void>[] = [];
        for (const database_datamodel of this.databases.get(dataModelName)!) {
            const database = database_datamodel as IDatabase<T>;
            const resultPromise = database.delete(id);
            resultPrmises.push(resultPromise);
        }

        await Promise.all(resultPrmises);
    }
}