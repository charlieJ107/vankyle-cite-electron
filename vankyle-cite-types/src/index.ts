import { PaperService } from '@/services/PaperService/PaperService';
import { DropService } from '@/services/DropService/DropService';
import { FileSystemService } from '@/main/services/FileSystemService';
import { ConfigService } from '@/services/ConfigService/ConfigService';
import { PluginManager } from '@/services/PluginManager/PluginManager';
import { Author } from '@/models/author';
import { Paper } from '@/models/paper';
import { Tag } from '@/models/tag';
import { Group } from '@/models/group';
import { BaseDataModel } from '@/models/DataModel';

interface App {
    Services: {
        PaperService: PaperService;
        DropService: DropService;
        FileSystemService: FileSystemService;
        ConfigService: ConfigService;
        PluginManager: PluginManager;
    }
}

declare global {
    interface Window {
        App: App;
    }
}

export {
    App,
    Author,
    Paper,
    Tag,
    Group,
    BaseDataModel
}
