import { contextBridge, ipcRenderer } from 'electron'
import { displayLoading } from './components/loading/loading'
import { AppServiceProvider } from './components/contexts/service/AppServiceProvider';

const appServiceProvider = new AppServiceProvider();

ipcRenderer.on('init-service-provider', (e) => {
    const [port] = e.ports;
    appServiceProvider.init(port);
});

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('AppServiceProvider', appServiceProvider);


// Display Loading
displayLoading();

