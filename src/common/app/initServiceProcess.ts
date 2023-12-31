import { utilityProcess } from "electron";

import path from 'node:path'

export function initServiceProcess() {
    const serviceProcess = utilityProcess.fork(path.join(__dirname, 'services/index.js'));

    return serviceProcess;
}