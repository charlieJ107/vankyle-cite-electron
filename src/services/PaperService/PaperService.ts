import { IService } from "../IService";

export class PaperService implements IService {
    [key: string | number | symbol]: (...args: any[]) => any;
    getAllPapers = (paging?: { page: number, pageSize: number, total: number }) => {
        return Promise.resolve([]);
    }
}