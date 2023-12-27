import fs from "fs/promises";
import path from "path";
import { IConfig } from "../config/IConfig";
import { IPlugin, IPluginManifest } from "@charliej107/vankyle-cite-plugin"

export class PluginManager {
    private config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
    }

    private installedPlugins: IPluginManifest[] = []

    private async scanPlugins() {

        const items = await fs.readdir(this.config.plugin_dir);

        for(item in items){
            if(await this.isValidPlugin(item)){
                this.installedPlugins.push(item)
            }
        }

    }
    public loadPlugin(manifest: IPluginManifest) {

    }
    private async isValidPlugin(dir_or_file: string): Promise<boolean> {
        const itemPath = path.join(this.config.plugin_dir, dir_or_file);
        if (fs.statSync(itemPath).isDirectory()) {
            const manifestPath = path.join(itemPath, "manifest.json");
            if (fs.existsSync(manifestPath)) {
                fs.readFile(manifestPath, { encoding: 'utf-8' }, (err, manifestContent) => {
                    if (err) {
                        console.error(`Error loading plugin ${dir_or_file}:`, err);
                        return false;
                    }
                    try {
                        const manifest: IPluginManifest = JSON.parse(manifestContent);
                        if (this.isValidManifest(manifest)) {
                            const entryPath = path.join(itemPath, manifest.entry);
                            if (fs.existsSync(entryPath) && fs.statSync(entryPath).isFile() && entryPath.endsWith('.js')) {
                                return true;
                            } else {
                                console.error(`Plugin entry file does not exist: ${entryPath}`);
                            }
                        }
                    } catch (error) {
                        console.error(`Error loading plugin ${dir_or_file}:`, error);
                    }
                });

            }
        }
    }

    private isValidManifest(manifest: IPluginManifest) {
        const requiredFields = ['manifest-version', 'name', 'uid', 'version', 'entry'];

        for (const field of requiredFields) {
            if (!(field in manifest)) {
                console.error(`Plugin manifest is missing required field: ${field}`);
                return false;
            }
        }

        // Check if the entry field points to a .js file
        if (!manifest.entry.endsWith('.js')) {
            console.error(`Plugin entry field does not point to a .js file: ${manifest.entry}`);
            return false;
        }

        return true;
    }

}