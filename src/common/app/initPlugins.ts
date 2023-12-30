import { utilityProcess } from "electron";
import path from 'node:path'

export function initPlugins() {
    const pluginProcess = utilityProcess.fork(path.join(__dirname, 'plugins/index.js'));
    // TODO: Register event listeners

    return pluginProcess;
}