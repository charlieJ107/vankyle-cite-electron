export interface IConfig {
    get plugins(): IPluginConfig;
}

export interface IPluginConfig {
    get plugin_dir(): string;
    get enabled_plugins(): string[];
}