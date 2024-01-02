export interface BaseDataModel {
    _id: string | number;
}

export type DataModelName =
    | "Author"
    | "Group"
    | "Paper"
    | "Tag";