import { Paper } from "../../../models/paper";
import { IPaperDatabase } from "../IPaperDatabase";

export class SqlitePaperDatabase implements IPaperDatabase {
    constructor(

    ) {

    }
    getPaper(id: string): Promise<Paper> {
        throw new Error("Method not implemented.");
    }
    getPaperList(): Promise<Paper[]> {
        throw new Error("Method not implemented.");
    }
    savePaper(paper: Paper): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deletePaper(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}