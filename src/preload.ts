import { contextBridge } from 'electron'
import { AppService } from './services/AppServices'
import { displayLoading } from './components/loading/loading'

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('AppService', new AppService())


// Display Loading
displayLoading();

