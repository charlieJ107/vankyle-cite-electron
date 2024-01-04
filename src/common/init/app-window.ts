import { BrowserWindow, app } from "electron";
import path from "path";

export function createAppWindow(windowId?: string) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#4d6973',
            symbolColor: 'white',
        },
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
    });

    // and load the index.html of the app.
    if (APP_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(APP_VITE_DEV_SERVER_URL);
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${APP_VITE_NAME}/index.html`));
    }
    return mainWindow;
}