import { BaseDataModel } from "./DataModel";

export interface Group extends BaseDataModel {
    name: string;
    subgroups: Group[];
}