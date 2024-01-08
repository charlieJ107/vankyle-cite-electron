import { Paper } from "@/models/paper";
import { IService } from "../IService";

export class PaperService implements IService {
    getAllPapers = (paging?: { page: number, pageSize: number, total: number }): Promise<Paper[]> => {
        return Promise.resolve([]);
    }
}