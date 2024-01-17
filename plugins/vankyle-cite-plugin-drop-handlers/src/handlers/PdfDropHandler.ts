import { Paper } from "vankyle-cite-types";
import { HandlerBase } from "./HandlerBase";
import zoteroPdfWorker from "@charliej107/zotero-pdf-worker";
import fs from "fs";



export class PdfDropHandler extends HandlerBase {
    private fontCache: any = {};
    constructor() {
        super();

    }
    public isSupport(filePaths: string): boolean {
        // is a file url or with no url protocol
        if (!filePaths.startsWith("file://") && filePaths.includes("://")) {
            return false;
        }
        // is a pdf file
        if (!filePaths.endsWith(".pdf")) {
            return false;
        }
        return true;
    }
    public async handleDrop(filePath: string): Promise<Paper> {
        const paper = {} as Paper;

        const content = await window.App.Services.FileSystemService.readFileContent(filePath.replace("file://", ""));
        let zoteroData = await zoteroPdfWorker.getRecognizerData(
            content, "", this.cmapProvider, this.standardFontProvider
        );
        console.log(zoteroData);
        return paper;
    }

    private async cmapProvider(name: string) {
        let buf = fs.readFileSync(__dirname + "/cmaps/" + name + ".bcmap");
        return {
          compressionType: 1,
          cMapData: buf,
        };
      }
    private async standardFontProvider(filename: string) {
        if (this.fontCache[filename]) {
          return this.fontCache[filename];
        }
        let data = fs.readFileSync(__dirname + "/standard_fonts/" + filename);
        this.fontCache[filename] = data;
        return data;
      }
}