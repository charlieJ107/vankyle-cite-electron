/**
 * @fileoverview Entrypoint of the service process.
 */

import { REGISTER_AGENT } from "@/common/rpc/IMessages";
import { MessagePortRpcManager } from "@/common/rpc/MessagePortRpcManager";
import { MessagePortRpcAgent } from "@/common/rpc/MessagePortRpcAgent";
import { PaperService } from "./PaperService/PaperService";
import { ServiceProvider } from "./ServiceProvider";
import { JsonFileDatabase } from "@/data/database/local/JsonFileDatabase";
import { Paper } from "@/models/paper";
import { DropServiceServer } from "./DropService/DropService";
import { PluginManager } from "./PluginManager/PluginManager";
import { PluginService } from "@/plugins/PluginService";
import { IConfig } from "@/data/config/IConfig";
import { ConfigService } from "./ConfigService/ConfigService";

const RpcManager = new MessagePortRpcManager();

const ServiceAgent = new MessagePortRpcAgent((message, transfer) => {
    if (message.channel === REGISTER_AGENT) {
        const [port] = transfer;
        RpcManager.registerAgent(message.payload, port);
    } else {
        console.warn("Invalid Service provider message channel: ", message);
    }
});
const serviceProvider = new ServiceProvider(ServiceAgent);
const paperService = new PaperService(new JsonFileDatabase<Paper>());
serviceProvider.registerServiceServer("DropServiceServer", new DropServiceServer(ServiceAgent));
serviceProvider.registerService("PaperService", paperService);
const filesystemService = serviceProvider.getService("FileSystemService");
const configService = new ConfigService(filesystemService);
serviceProvider.registerService("ConfigService", configService);
const config: IConfig = configService.getConfig();
const pluginManager = new PluginManager(config, new PluginService(ServiceAgent));
serviceProvider.registerService("PluginManager", pluginManager);
serviceProvider.ready();
