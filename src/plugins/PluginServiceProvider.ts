import { IPlugin, IPluginService } from "@charliej107/vankyle-cite-plugin";

export class PluginServiceProvider {
    constructor() {

    }
    private services: { [key: string]: IPluginService } = {};

    registerService<T extends IPluginService>(name: string, dependency: T) {
        if (!this.services[name]) {
            this.services[name] = dependency;
        }
    }

    resolveService<T extends IPlugin>(target: new (...args: IPluginService[]) => T): T {
        const paramNames = this.getParamNames(target);

        const dependencies = paramNames.map((name: string) => {
            if (!this.services[name]) {
                throw new Error(`Dependency '${name}' not found.`);
            }
            return this.services[name];
        });

        return new target(...dependencies);
    }
    private getParamNames(func: Function): string[] {
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const ARGUMENT_NAMES = /([^\s,]+)/g;

        const fnStr = func.toString().replace(STRIP_COMMENTS, '');
        const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null) {
            return [];
        }
        return result;
    }
}