import { IDatabase } from "@/data/database/IDatabase";
import { Paper } from "@/models/paper";
import { Service } from "../IService";

@Service()
export class PaperService {
    private database: IDatabase<Paper>;
    constructor(databse: IDatabase<Paper>) {
        this.database = databse;
    }
    getAllPapers(paging?: { page: number, pageSize: number, total: number }): Promise<Paper[]> {
        return this.database.getList();
    }
}