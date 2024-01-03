import { BaseDataModel } from "@models/DataModel";
import { IDatabase } from "../IDatabase";
import fs from "fs";
import path from "path";

export class JsonFileDatabase<T extends BaseDataModel> implements IDatabase<T> {
    private dataDir: string;
    constructor(dataDir: string = path.join(__dirname, "data.json")) {
        this.dataDir = dataDir;
        if (!fs.existsSync(dataDir)) {
            fs.writeFileSync(dataDir, "{}");
        }
    }
    private buffer: { [key: string]: T; } = {};

    private async updateBuffer() {
        return await fs.readFile(this.dataDir, "utf8", (err: NodeJS.ErrnoException | null, jsonString: string) => {
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

    async get(id: string | number): Promise<T | null> {
        this.updateBuffer();
        return this.buffer[id];
    }
    async getList(filter?: ((model: T) => boolean) | undefined): Promise<T[]> {
        this.updateBuffer();
        return Promise.resolve(Object.values(this.buffer).filter(filter || (() => true)));
    }
    async save(model: T): Promise<void> {
        this.buffer[model._id] = model;
        return await this.saveBuffer();

    }
    async delete(id: string): Promise<void> {
        delete this.buffer[id];
        return this.saveBuffer();
    }
}