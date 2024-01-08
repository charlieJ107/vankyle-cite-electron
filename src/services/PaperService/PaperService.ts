import { Paper } from "@/models/paper";
import { IService } from "../IService";
import { IDatabase } from "@/data/database/IDatabase";

export class PaperService implements IService {
    constructor(private paperDatabase: IDatabase<Paper>) { }
    getAllPapers = (paging?: { page: number, pageSize: number, total: number }): Promise<Paper[]> => {
        return this.paperDatabase.getList();
    }
}