import { contextBridge, ipcRenderer } from 'electron'
import { displayLoading } from './components/loading/loading'
import { AppServiceProvider } from './components/contexts/service/AppServiceProvider';

const appServiceProvider = new AppServiceProvider();
// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('AppServiceProvider', appServiceProvider);
contextBridge.exposeInMainWorld('Initializer', {
    InitServiceProvider: () => {
        ipcRenderer.on('init-service-provider', (event) => {
            console.log('Renderer received init-service-provider message');
            const [port] = event.ports;
            appServiceProvider.init(port);
        });
        ipcRenderer.send('request-init-channel');
    }
});

// Display Loading
displayLoading();

