export interface IConfig {
    plugins: IPluginConfig;
    data: IDataConfig;
}

export interface IPluginConfig {
    plugin_dir: string;
    enabled_plugins: string[];
}

export interface IDataConfig {
    data_dir: string;
}