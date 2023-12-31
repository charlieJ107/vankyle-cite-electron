import { app, BrowserWindow, MessageChannelMain } from 'electron'
import { initAppWindow } from './common/app/initAppWindow'
import { initServiceProcess } from './common/app/initServiceProcess';
import { initPlugins } from './common/app/initPlugins';
import { RPCMessage } from '@charliej107/vankyle-cite-rpc';

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    initAppWindow();
  }
})

function init() {
  const serviceProcess = initServiceProcess();
  const appWindow = initAppWindow();
  const pluginsProcess = initPlugins();

  // AppServiceProvider and AppServiceManager
  const registerAppServiceProviderMessage: RPCMessage = {
    header: {
      type: "request",
      id: Date.now(),
      from: "main",
      method: "register-service-provider",
      service: "AppServiceProvider",
    },
    body: null,
  };

  const appServiceMessageChannel = new MessageChannelMain();
  serviceProcess.postMessage(registerAppServiceProviderMessage, [appServiceMessageChannel.port1]);
  appWindow.webContents.postMessage('init-service-provider', null, [appServiceMessageChannel.port2]);

  const registerPluginServiceProviderMessage: RPCMessage = {
    header: {
      type: "request",
      id: Date.now(),
      from: "main",
      method: "register-service-provider",
      service: "PluginServiceProvider",
    },
    body: null,
  };

  const pluginServiceMessageChannel = new MessageChannelMain();
  serviceProcess.postMessage(registerPluginServiceProviderMessage, [pluginServiceMessageChannel.port1]);
  pluginsProcess.postMessage('init-service-provider', [pluginServiceMessageChannel.port2]);

}

app.whenReady().then(init);