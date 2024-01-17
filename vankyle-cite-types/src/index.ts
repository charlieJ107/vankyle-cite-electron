import { PaperService } from '../../src/services/services/PaperService';
import { DropService } from '../../src/services/services/DropService';
import { FileSystemService } from '../../src/services/main/FileSystemService';
import { ConfigService } from '../../src/services/services/ConfigService';
import { PluginManager } from '../../src/services/services/PluginManager';
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
