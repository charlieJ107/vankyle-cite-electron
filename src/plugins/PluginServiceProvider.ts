import { IPlugin, IPluginService } from "@charliej107/vankyle-cite-plugin";
import { IServiceProvider, IServiceProxy } from "@charliej107/vankyle-cite-rpc";


export class PluginServiceProvider implements IServiceProvider {
    getService<TService extends IPluginService>(service_name: string): Promise<IServiceProxy<TService>> {
        throw new Error("Method not implemented.");
    }

}