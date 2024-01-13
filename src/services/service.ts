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
import { ConfigService } from "./ConfigService/ConfigService";
import { FileSystemService } from "@/main/services/FileSystemService";

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
serviceProvider.registerServiceServer("DropService", new DropServiceServer(ServiceAgent));
serviceProvider.registerService("PaperService", paperService);
// TODO: Wait for main process to be ready
serviceProvider.registeServiceFactory<ConfigService>("ConfigService", () => {
    const fileSystemService = serviceProvider.getService<FileSystemService>("FileSystemService");
    return new ConfigService(fileSystemService);
}, "FileSystemService");
serviceProvider.registerServiceClient("PluginService", () => new PluginService(ServiceAgent));
serviceProvider.registeServiceFactory<PluginManager>("PluginManager", () => {
    console.log("Getting config service");
    // 问题：ConfigService初始化时等待FileSystemService调用等不到结果，但由于异步所以ConfigService已经初始化完成，而此时的file是undefined
    const configService = serviceProvider.getService<ConfigService>("ConfigService");
    const pluginService = serviceProvider.getService<PluginService>("PluginService");
    return new PluginManager(configService.getConfig(), pluginService);
}, "ConfigService", "PluginService");


