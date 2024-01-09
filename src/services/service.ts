/**
 * @fileoverview Entrypoint of the service process.
 */

import { REGISTER_AGENT } from "@/common/rpc/IMessages";
import { MessagePortRpcManager } from "@/common/rpc/MessagePortRpcManager";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";

const RpcManager = new MessagePortRpcManager();

const ServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    if (message.channel === REGISTER_AGENT) {
        const [port] = transfer;
        RpcManager.registerAgent(message.payload, port);
    } else {
        console.warn("Invalid Service provider message channel: ", message);
    }
});
