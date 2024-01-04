import { IService } from "../IService";

export class PaperService implements IService {
    getAllPapers = (paging?: { page: number, pageSize: number, total: number }) => {
        return Promise.resolve([]);
    }
}