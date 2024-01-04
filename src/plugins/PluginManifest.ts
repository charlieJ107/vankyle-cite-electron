export interface PluginManifest {
    name: string;
    manifest_version: string;
    version: string;
    author: string;
    description?: string;
    dsiplay_name?: string;
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

    return manifest instanceof Object &&
        typeof manifest.name === 'string' &&
        // name should be all lowercase with no spaces.
        manifest.name === manifest.name.toLowerCase() &&
        typeof manifest.manifest_version === 'string' &&
        typeof manifest.version === 'string' &&
        // version should compatible with semver
        // https://semver.org/
        manifest.version.match(/^\d+\.\d+\.\d+$/) &&
        typeof manifest.author === 'string';
}