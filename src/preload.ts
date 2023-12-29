import { contextBridge, ipcRenderer } from 'electron'
import { displayLoading } from './components/loading/loading'
import { AppServiceProvider } from './components/contexts/service/AppServiceProvider';

ipcRenderer.on('init-renderer-rpc', (_event, message) => {
    console.log(message);
});

const appServiceProvider = new AppServiceProvider(); // TODO: 传入messagePort

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('AppServiceProvider', appServiceProvider);


// Display Loading
displayLoading();

