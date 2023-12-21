import { Author } from "./author";
import { Group } from "./group";
import { Tag } from "./tag";

export interface Paper {
    title: string;
    authors: Author[];
    publication: string;
    publishTime: Date;
    publishType: PublishType;
    description: string;
    urls: string[];
    addTime: Date;
    codes: string[];
    pages: string;
    volume: string;
    number: string;
    publisher: string;
    rating: number;
    tags: Tag;
    flagged: boolean;
    group: Group;
    doi?: string;
    arxivId?: string;

    [key: string]: unknown; // for future extension

}

enum PublishType {
    Journal = "Journal",
    Conference = "Conference",
    Workshop = "Workshop",
    Other = "Other"
}