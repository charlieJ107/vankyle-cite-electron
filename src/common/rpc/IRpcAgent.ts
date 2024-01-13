export interface IRpcAgent {
    /**
     * The unique id of the agent, by default it is the process type + pid
     */
    readonly agentId: string;
    /**
     * Register a function to be called when a RPC request is received
     * @param name The name of the function
     * @param func The function to be called
     */
    register(name: string, func: (...args: any[]) => any): void;
    /**
     * Resolve a registered function by name, the function must be registered by any agent (even from other process) before calling this method
     * @param name The name of the function
     */
    resolve<T extends (...args: any[]) => any>(name: string): T;
    /**
     * Publish a message to all subscribers
     * @param name The name of the message channel
     * @param info The message payload
     */
    publish(name: string, info: any): void;
    /**
     * Subscribe to a message channel
     * @param name The name of the message channel
     * @param func The function to be called when a message is published
     */
    subscribe(name: string, func: (...args: any[]) => any): void;
}