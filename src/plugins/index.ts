import { IPluginConfig } from "../common/config/ConfigInterfaces";
import { PluginManager } from "./PluginManager";
import path from 'path';
import { PluginServiceManager } from "./PluginServiceManager";



// 获得插件服务进程配置
const config: IPluginConfig = {
    // TODO
    plugin_dir: path.join(__dirname, "../plugins"),
    enabled_plugins: []
};
const pluginServiceManager  = new PluginServiceManager();
// 初始化插件管理器
const pluginManager = new PluginManager(config, pluginServiceManager);
// 扫描插件
pluginManager.scanPlugins();
