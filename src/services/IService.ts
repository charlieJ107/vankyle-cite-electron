import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";

export function Service() {
    return function (value: new (...args: any[]) => any, context: ClassDecoratorContext) {
        const methods = Object.getOwnPropertyNames(value.prototype).filter((name) => name !== "constructor" && typeof value.prototype[name] === "function");

        
    }
}
