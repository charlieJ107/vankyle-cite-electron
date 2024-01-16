import { PaperService } from '@/services/PaperService/PaperService';
import { DropService } from '@/services/DropService/DropService';

export interface App {
    Services: {
        PaperService: PaperService;
        DropService: DropService;
    }
}

declare global {
    interface Window {
        App: App;
    }
}
