import { Author } from "./author";
import { Group } from "./group";
import { Paper } from "./paper";
import { Tag } from "./tag";

export type DataModel =
    | Author
    | Group
    | Paper
    | Tag;

export type DataModelName =
    | "Author"
    | "Group"
    | "Paper"
    | "Tag";