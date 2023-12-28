import { contextBridge } from 'electron'
import { displayLoading } from './components/loading/loading'
import { AppServiceProvider } from './services/AppServiceProvider';

declare global {
    interface Window {
        AppServiceProvider: AppServiceProvider
    }
}

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('AppServiceProvider', new AppServiceProvider());


// Display Loading
displayLoading();

