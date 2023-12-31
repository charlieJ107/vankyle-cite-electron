/**
 * 插件服务进程，用于处理插件的安装、卸载、更新等操作，为插件提供接口
 */

import { IPluginConfig } from "../common/config/ConfigInterfaces";
import { PluginManager } from "./PluginManager";
import { PluginServiceProvider } from "@charliej107/vankyle-cite-plugin";
import path from 'path';

// 初始化插件服务进程的MessageChannel


// 获得插件服务进程配置
const config: IPluginConfig = {
    // TODO
    plugin_dir: path.join(__dirname, "../plugins"),
    enabled_plugins: []
};

// 初始化插件管理器
const pluginManager = new PluginManager(config);
