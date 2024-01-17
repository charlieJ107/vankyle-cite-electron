import { DropService } from "./services/services/DropService";
import { PaperService } from "./services/services/PaperService";
import { FileSystemService } from "./services/FileSystemService";
import { ConfigService } from "./services/services/ConfigService";
import { PluginManager } from "./services/services/PluginManager";

declare global {
    interface Window {
        App: {
            Services: {
                PaperService: PaperService;
                DropService: DropService;
                FileSystemService: FileSystemService;
                ConfigService: ConfigService;
                PluginManager: PluginManager;
            }
        }
    }
}