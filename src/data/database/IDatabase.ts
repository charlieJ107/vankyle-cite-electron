export interface IDatabase<T_ModelType> {
    get(id: string): Promise<T_ModelType | null>;
    getList(filter?: (model: T_ModelType) => boolean): Promise<T_ModelType[]>;
    save(model: T_ModelType): Promise<void>;
    delete(id: string): Promise<void>;
}