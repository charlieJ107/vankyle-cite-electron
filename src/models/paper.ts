import { BaseDataModel } from "./DataModel";
import { Author } from "./author";
import { Group } from "./group";
import { Tag } from "./tag";

export interface Paper extends BaseDataModel {
    _id: number;
    title: string;
    authors: Author[] | string[]; // author id
    publication?: string;
    publishTime?: Date;
    publishType: PublishType | string;
    description?: string;
    urls?: string[];
    addTime: Date;
    codes?: string[];
    pages?: string;
    volume?: string;
    number?: string;
    publisher?: string;
    rating: number;
    tags?: Tag[];
    flagged: boolean;
    group?: Group;
    cite: Paper[] | string[]; // paper id
    doi?: string;
    arxiv?: string;
    abstarct?: string;
    language?: string;
    type?: string;
    [key: string]: unknown; // for future extension

}

enum PublishType {
    Journal = "Journal",
    Conference = "Conference",
    Workshop = "Workshop",
    Other = "Other"
}