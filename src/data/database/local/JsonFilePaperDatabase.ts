import { Paper } from "../../../models/paper";
import { IPaperDatabase } from "../IPaperDatabase";
import fs from "fs";

export class JsonFilePaperDatabase implements IPaperDatabase {
    constructor() {
    }

    private buffer: { [key: string]: Paper; } = {};

    private async updateBuffer() {
        return await fs.readFile("data.json", "utf8", (err: NodeJS.ErrnoException | null, jsonString: string) => {
            if (err) {
                console.error("File read failed:", err);
                return;
            }
            this.buffer = JSON.parse(jsonString);
        });
    }

    private async saveBuffer() {
        return await fs.writeFile("data.json", JSON.stringify(this.buffer), (err: NodeJS.ErrnoException | null) => {
            if (err) {
                console.error("File write failed:", err);
                return;
            }
        });
    }

    async getPaper(id: string): Promise<Paper | null> {
        this.updateBuffer();
        return this.buffer[id];
    }
    async getPaperList(): Promise<Paper[]> {
        this.updateBuffer();
        return Promise.resolve(Object.values(this.buffer));
    }
    async savePaper(paper: Paper): Promise<void> {
        this.buffer[paper._id] = paper;
        return await this.saveBuffer();
        
    }
    async  deletePaper(id: string): Promise<void> {
        delete this.buffer[id];
        return this.saveBuffer();
    }
}