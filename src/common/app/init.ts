import { BrowserWindow, app } from "electron"
import path from 'node:path'

export function initAppWindow() {
    // --------- Set Environment Variables ---------
    // The built directory structure
    //
    // ├─┬─┬ dist
    // │ │ └── index.html
    // │ │
    // │ ├─┬ dist-electron
    // │ │ ├── main.js
    // │ │ └── preload.js
    // │
    process.env.DIST = path.join(__dirname, '../dist')
    process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
    const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

    // --------- Create Window ---------
    const browserWindow = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        width: 1440,
        height: 960,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#4d6973',
            symbolColor: 'white',
        }
    });

    if (VITE_DEV_SERVER_URL) {
        browserWindow.loadURL(VITE_DEV_SERVER_URL);
        browserWindow.webContents.openDevTools();
    } else {
        // win.loadFile('dist/index.html')
        browserWindow.loadFile(path.join(process.env.DIST, 'index.html'));
    }
}