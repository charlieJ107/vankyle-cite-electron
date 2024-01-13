import { DropService } from "./services/DropService/DropService";
import { PaperService } from "./services/PaperService/PaperService";
import { FileSystemService } from "./services/FileSystemService";
import { ConfigService } from "./services/ConfigService/ConfigService";
import { PluginManager } from "./services/PluginManager/PluginManager";

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