import { BaseDataModel } from "../../models/DataModel";

export interface IDatabase<T_ModelType extends BaseDataModel> {
    get(id: string): Promise<T_ModelType | null>;
    getList(filter?: (model: T_ModelType) => boolean): Promise<T_ModelType[]>;
    save(model: Partial<T_ModelType>): Promise<T_ModelType>;
    delete(id: string): Promise<void>;
}