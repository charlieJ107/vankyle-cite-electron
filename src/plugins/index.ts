/**
 * 插件服务进程，用于处理插件的安装、卸载、更新等操作，为插件提供接口
 */

import { IPluginConfig } from "../common/config/ConfigInterfaces";
import { PluginManager } from "./PluginManager";
import { PluginServiceProvider } from "../../vankyle-cite-plugin/src/PluginServiceProvider";
import path from 'path';

// TODO 初始化插件服务进程的RPC接口

// 获得插件服务进程配置
const config: IPluginConfig = {
    // TODO
    plugin_dir: path.join(__dirname, "../plugins"),
    enabled_plugins: []
};

const ServiceProvider = new PluginServiceProvider();
// 注册给插件的服务
ServiceProvider.registerService("PluginServiceProvider", ServiceProvider);

const Manager = new PluginManager(config, ServiceProvider);
Manager.init().then(async () => {
    await Manager.loadEnabledPlugins();
    console.log("Plugins loaded.");
    // TODO
    // 通知主进程插件服务进程已经初始化完毕
});