export interface IServiceManager {
    registerServiceProvider(providerId: string, ...args: any): void
}