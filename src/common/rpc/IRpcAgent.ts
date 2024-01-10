export interface IRpcAgent {
    register(name: string, func: (...args: any[]) => any): void;
    resolve<T extends (...args: any[]) => any>(name: string): T;
}