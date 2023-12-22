import { Paper } from "../../models/paper";

export interface IPaperDatabase {
    getPaper(id: string): Promise<Paper | null>;
    getPaperList(): Promise<Paper[]>;
    savePaper(paper: Paper): Promise<void>;
    deletePaper(id: string): Promise<void>;
}