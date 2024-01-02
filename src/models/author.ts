import { BaseDataModel } from "./DataModel";

export interface Author extends BaseDataModel {
    _id: number;
    name: string;
}