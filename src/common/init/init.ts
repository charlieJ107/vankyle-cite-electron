import { ipcMain, utilityProcess } from "electron";
import { REGISTER_AGENT } from "../rpc/IMessages";
import { createAppWindow } from "./app-window";
import path from "path";

export function init() {
    const serviceProcess = utilityProcess.fork(path.resolve(__dirname, "service.js"));
    ipcMain.on(REGISTER_AGENT, (event, message) => {
        // Just forward the message to the service process to reduce the complexity of the main process
        serviceProcess.postMessage(message, event.ports);
    });
    // Show the app window as soon as possible
    createAppWindow();

    // TODO: Initialize services and provider
    // * Initialize Plugin Service
    // * Initialize System Service
    // * Initialize Service Provider
    // * Register Service
}