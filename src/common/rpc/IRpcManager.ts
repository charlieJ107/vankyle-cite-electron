export interface IRpcManager {
    registerAgent(agentId: string, ...args: any[]): void;
}