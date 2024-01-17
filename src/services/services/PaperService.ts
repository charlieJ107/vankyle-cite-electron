import { IDatabase } from "../../data/database/IDatabase";
import { Paper } from "../../models/paper";

export class PaperService {
    private database: IDatabase<Paper>;
    constructor(databse: IDatabase<Paper>) {
        this.database = databse;
    }
    getAllPapers(paging?: { page: number, pageSize: number, total: number }): Promise<Paper[]> {
        return this.database.getList();
    }
    getPaper(id: string): Promise<Paper | null> {
        return this.database.get(id);
    }
    savePaper(paper: Paper): Promise<Paper> {
        return this.database.save(paper);
    }
}