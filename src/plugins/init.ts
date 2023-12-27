import { PluginServiceProvider } from "../common/plugins/PluginServiceProvider";

export function InitPluginServices() {
    const ServiceProvider = new PluginServiceProvider();
    ServiceProvider.registerService("PluginServiceProvider", ServiceProvider);
}