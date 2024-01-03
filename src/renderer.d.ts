import { Paper } from './models/Paper';
interface IAppServices {
    DropService: {
        handleDrop: (files: FileList) => void;
    }
    PaperService: {
        getAllPapers: (paging?: {page: number, pageSize: number, total: number}) => Promise<Paper[]>;
    }
}

declare global {
    interface Window {
        AppServices: IAppServices;
    }
}
