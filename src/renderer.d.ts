import { Paper } from './models/Paper';
import { DropService } from './services/DropService/DropService';
import { PaperService } from './services/PaperService/PaperService';
import { PluginService } from './services/PluginService/PluginService';
interface IAppServices {
    DropService: DropService;
    PaperService: PaperService;
    PluginService: PluginService;
}

declare global {
    interface Window {
        AppServices: IAppServices;
    }
}
