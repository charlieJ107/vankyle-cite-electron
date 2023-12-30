import { utilityProcess, MessageChannelMain, ipcMain } from "electron";
import path from 'node:path'
import { RPCMessage } from "../rpc/IMessage";
import { MessagePortRPCClient } from "../rpc/MessagePortRPCClient";
import { IRPCClient } from "../rpc/IRPCClient";

export interface ServiceProcessInitialMessage extends RPCMessage {
    header: {
        type: "request",
        target: "service-process",
        id: "init-rpc",
        method: "init-rpc",
        params: null
    },
    body: null
}

export function initServiceProcess() {
    const { port1, port2 } = new MessageChannelMain();
    // Create a utility process for service
    const serviceProcess = utilityProcess.fork(path.join(__dirname, 'services/index.js'));
    const initRPCMessage: ServiceProcessInitialMessage = {
        header: {
            type: "request",
            target: "service-process",
            id: "init-rpc",
            method: "init-rpc",
            params: null
        },
        body: null
    }
    serviceProcess.postMessage(initRPCMessage, [port1]);

    const rpcClient: IRPCClient<RPCMessage> = new MessagePortRPCClient(port2);
    // TODO: Register event listeners

    // Send port2 to renderer process
    return rpcClient;

}