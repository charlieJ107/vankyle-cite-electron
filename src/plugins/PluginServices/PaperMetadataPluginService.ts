import { IPluginService } from "@charliej107/vankyle-cite-plugin";
import { Paper } from "../../models/paper";

export class PaperMetadataPluginService implements IPluginService {
    constructor() {

    }
    public init(): void {
        console.log("PaperMetadataPluginService initialized");
    }
    public load(): void {
        console.log("PaperMetadataPluginService loaded");
    }
    public unload(): void {
        console.log("PaperMetadataPluginService unloaded");
    }

    public getAllPapersMetadata(): void {
        console.log("getAllPapersMetadata");
    }
    public findPaperBy(key: string, value: any): void {
        console.log("findPaperMetadata: " + key + "with value: " + value);
    }
    public reportPaperMetadata(id: string, metadata: Paper): void {
        console.log("reportPaperMetadata: " + id + " " + metadata.title);
    }

}