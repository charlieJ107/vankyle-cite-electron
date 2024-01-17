
export interface PluginManifest {
    name: string;
    manifest_version: string;
    version: string;
    author: string;
    main?: string;
    description?: string;
    displayName?: string;
    icon?: string;
    show?: {
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
        console.warn("Plugin manifest manifest_version is not a strubg");
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

    // Version specific checks: manifest version must be "1.0.0"
    if (manifest.manifest_version !== "1.0.0") {
        console.warn("Plugin manifest version is not compatible with this version of Vankyle Cite");
        return false;
    }

    return true;
}


export interface IPlugin {
    manifest: PluginManifest;
    status: "online" | "enabled" | "disabled";
}
