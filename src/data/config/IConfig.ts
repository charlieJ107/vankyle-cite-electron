export interface IConfig {
    plugins: IPluginConfig;
}

export interface IPluginConfig {
    plugin_dir: string;
    enabled_plugins: string[];
}