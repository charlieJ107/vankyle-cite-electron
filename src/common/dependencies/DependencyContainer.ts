export abstract class DependencyContainer {

    private dependencies: { [key: string]: any } = {};

    resolve<T>(target: new (...args: any[]) => T): T {
        const paramNames = this.getParamNames(target);

        const dependencies = paramNames.map((name: string) => {
            if (!this.dependencies[name]) {
                throw new Error(`Dependency '${name}' not found.`);
            }
            return this.dependencies[name];
        });

        return new target(...dependencies);
    }
    register<D>(name: string, dependency: D) {
        if (!this.dependencies[name]) {
            this.dependencies[name] = dependency;
        }
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