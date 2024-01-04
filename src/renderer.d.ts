import { Paper } from './models/Paper';
import { DropService } from './services/DropService/DropService';
import { PaperService } from './services/PaperService/PaperService';
interface IAppServices {
    DropService: DropService
    PaperService: PaperService
}

declare global {
    interface Window {
        AppServices: IAppServices;
    }
}
