import { PaperService } from '../../src/services/PaperService/PaperService';
import { DropService } from '../../src/services/DropService/DropService';
import { FileSystemService } from '../../src/main/services/FileSystemService';
import { ConfigService } from '../../src/services/ConfigService/ConfigService';
import { PluginManager } from '../../src/services/PluginManager/PluginManager';
import { Author } from '../../src/models/author';
import { Paper } from '../../src/models/paper';
import { Tag } from '../../src/models/tag';
import { Group } from '../../src/models/group';
import { BaseDataModel } from '../../src/models/DataModel';

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
