import { IRpcAgent } from "../common/rpc/IRpcAgent";

export interface IServiceInfo {
    name: string;
    methods: string[];
}

// Just a type alias for any service
export type IService = any;

export function Service() {
    return function (value: new (...args: any[]) => any, context: ClassDecoratorContext) {
        const methods = Object.getOwnPropertyNames(value.prototype).filter((name) => name !== "constructor" && typeof value.prototype[name] === "function");

        return class extends value {
            static getInstance(agent: IRpcAgent) {
                const instance = {};
                methods.forEach((name) => {
                    agent.register(`${context.name}.${name}`, value.prototype[name]);
                    Object.defineProperty(instance, name, agent.resolve(`${context.name}.${name}`));
                });
                return instance;
            }
            constructor(...args: any[]) {
                super(...args);
            }
        };
    }
}
