import { Paper } from "@/models/paper";
import { IService } from "../IService";
import { IDatabase } from "@/data/database/IDatabase";

export class PaperService implements IService {
    private database: IDatabase<Paper>;
    constructor(databse: IDatabase<Paper>) {
        this.database = databse;
    }
    getAllPapers = (paging?: { page: number, pageSize: number, total: number }): Promise<Paper[]> => {
        return this.database.getList();
    }
}