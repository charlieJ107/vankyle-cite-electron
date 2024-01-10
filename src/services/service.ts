/**
 * @fileoverview Entrypoint of the service process.
 */

import { REGISTER_AGENT } from "@/common/rpc/IMessages";
import { MessagePortRpcManager } from "@/common/rpc/MessagePortRpcManager";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";
import { PaperService } from "./PaperService/PaperService";
import { JsonFileDatabase } from "@/data/database/local/JsonFileDatabase";
import path from "path";

const RpcManager = new MessagePortRpcManager();

const ServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    if (message.channel === REGISTER_AGENT) {
        const [port] = transfer;
        RpcManager.registerAgent(message.payload, port);
    } else {
        console.warn("Invalid Service provider message channel: ", message);
    }
});

const paperService = new PaperService(new JsonFileDatabase(path.join(__dirname, "data", "paper.json")));

ServiceAgent.register("getAllPapers", () => paperService.getAllPapers()); 