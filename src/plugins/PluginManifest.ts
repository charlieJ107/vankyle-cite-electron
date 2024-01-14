
export interface PluginManifest {
    name: string;
    manifest_version: string;
    version: string;
    author: string;
    description?: string;
    displayName?: string;
    icon?: string;
    browsers?: {
        panel?: string;
        board?: string;
        window?: {
            width: number;
            height: number;
        };
    }
}

export function isValidPluginManifest(manifest: any): manifest is PluginManifest {
    if (!(manifest instanceof Object)) {
        console.warn("Plugin manifest is not an object");
        return false;
    } else if (typeof manifest.name !== 'string') {
        console.warn("Plugin manifest name is not a string");
        return false;
    } else if (manifest.name !== manifest.name.toLowerCase()) {
        console.warn("Plugin manifest name is not all lowercase");
        return false;
    } else if (typeof manifest.manifest_version !== 'string') {
        console.warn("Plugin manifest manifest_version is not a number");
        return false;
    } else if (typeof manifest.version !== 'string') {
        console.warn("Plugin manifest version is not a string");
        return false;
    } else if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) {
        console.warn("Plugin manifest version is not compatible with semver");
        return false;
    } else if (typeof manifest.author !== 'string') {
        console.warn("Plugin manifest author is not a string");
        return false;
    } 
    return true;
}


export interface IPlugin {
    manifest: PluginManifest;
    status: "online" | "enabled" | "disabled";
}
