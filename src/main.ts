import { app, BrowserWindow, MessageChannelMain, UtilityProcess } from 'electron'
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


function initAppServiceMessageChannel(appWindow: BrowserWindow, serviceProcess: UtilityProcess) {
  const appServiceMessageChannel = new MessageChannelMain();
  appWindow.webContents.postMessage('init-service-provider', null, [appServiceMessageChannel.port1]);
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
  serviceProcess.postMessage(registerAppServiceProviderMessage, [appServiceMessageChannel.port2]);

}

function init() {
  const serviceProcess = initServiceProcess();
  const appWindow = initAppWindow();
  const pluginsProcess = initPlugins();

  appWindow.webContents.mainFrame.ipc.on('request-init-channel', (_event) => {
    initAppServiceMessageChannel(appWindow, serviceProcess);
  });

  initAppServiceMessageChannel(appWindow, serviceProcess);

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