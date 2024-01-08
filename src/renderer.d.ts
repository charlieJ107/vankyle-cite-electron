import { IServiceProvider } from './common/rpc/IServiceProvider';

declare global {
    interface Window {
        ServiceProvider: IServiceProvider;
    };
}

