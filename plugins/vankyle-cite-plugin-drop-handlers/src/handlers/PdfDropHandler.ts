import { Author, Paper } from "vankyle-cite-types";
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
        let paper = {} as Paper;

        const content = await window.App.Services.FileSystemService.readFile(filePath.replace("file://", ""));
        let zoteroData = await zoteroPdfWorker.getRecognizerData(
            content, "", this.cmapProvider, this.standardFontProvider
        );
        const filename = filePath.split("/").pop();
        zoteroData.fileName = filename;
        zoteroData.pages = zoteroData.pages.slice(0, 1);
        const dataStr = JSON.stringify(zoteroData);
        let retry = 5;
        const requestZotero = async (): Promise<Response> => {
            return await fetch("https://services.zotero.org/recognizer/recognize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: dataStr,
            }).catch((error) => {
                if (retry > 0) {
                    retry--;
                    return new Promise((resolve) => {
                        setTimeout(resolve, 1000);
                    }).then(() => {
                        return requestZotero();
                    });
                } else {
                    throw error;
                }
            });
        }
        const zoteroMetadata: {
            title: string;
            authors: { firstName: string, lastName: string }[],
            arxiv: string;
            doi: string;
            mainURL?: string;
            type: string;
        } = await requestZotero().then((response) => {
            if (!response.ok) {
                throw new Error("Zotero request failed");
            }
            console.log("zotero response", response);
            return response.json();
        });
        console.log("zoteroMetadata", zoteroMetadata);
        if (zoteroMetadata.title) {
            paper.title = zoteroMetadata.title;
        }
        if (zoteroMetadata.authors) {
            paper.authors = paper.authors || [];
            zoteroMetadata.authors.forEach(async (author) => {
                // TODO: author service
                const authorId = await window.App.Services.AuthorService.findAuthorByName(author.firstName, author.lastName);
                if (authorId) {
                    paper.authors.push(authorId);
                } else {
                    const newAuthor = {
                        firstName: author.firstName,
                        lastName: author.lastName,
                    } as Partial<Author>;
                    const addedAuthor = await window.App.Services.AuthorService.addAuthor(newAuthor);
                    paper.authors.push(addedAuthor._id);
                }
            });
        }
        paper = {
            ...paper,
            title: zoteroMetadata.title || paper.title,
            arxiv: zoteroMetadata.arxiv || paper.arxiv,
            doi: zoteroMetadata.doi || paper.doi,
            urls: zoteroMetadata.mainURL ? [...(paper.urls || []), zoteroMetadata.mainURL] : paper.urls,
            type: zoteroMetadata.type || paper.type,
            abstract: zoteroData.pages[0].text,
            language: zoteroData.language || paper.language,
        }
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