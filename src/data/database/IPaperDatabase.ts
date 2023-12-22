import { Paper } from "../../models/paper";

export interface IPaperDatabase {
    getPaper(id: string): Promise<Paper>;
    getPaperList(): Promise<Paper[]>;
    savePaper(paper: Paper): Promise<void>;
    deletePaper(id: string): Promise<void>;
}