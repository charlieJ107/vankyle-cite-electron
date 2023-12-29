import { Paper } from "../../../models/paper";
import { IDatabase } from "../IDatabase";
import fs from "fs";
import path from "path";

export class JsonFilePaperDatabase implements IDatabase<Paper> {
    private dataDir: string;
    constructor(dataDir: string) {
        this.dataDir = dataDir;
    }
    private buffer: { [key: string]: Paper; } = {};

    private async updateBuffer() {
        return await fs.readFile(path.join(this.dataDir, "data.json"), "utf8", (err: NodeJS.ErrnoException | null, jsonString: string) => {
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

    async get(id: string): Promise<Paper | null> {
        this.updateBuffer();
        return this.buffer[id];
    }
    async getList(filter?: ((model: Paper) => boolean) | undefined): Promise<Paper[]> {
        this.updateBuffer();
        return Promise.resolve(Object.values(this.buffer).filter(filter || (() => true)));
    }
    async save(paper: Paper): Promise<void> {
        this.buffer[paper._id] = paper;
        return await this.saveBuffer();

    }
    async delete(id: string): Promise<void> {
        delete this.buffer[id];
        return this.saveBuffer();
    }
}