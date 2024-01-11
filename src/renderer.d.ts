import { DropService } from "./services/DropService/DropService";
import { PaperService } from "./services/PaperService/PaperService";

declare global {
    interface Window {
        App: {
            Services: {
                PaperService: PaperService;
                DropService: DropService;
            }
        }
    }
}