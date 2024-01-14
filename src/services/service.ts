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
const serviceProvider = new ServiceProvider(ServiceAgent);
const paperService = new PaperService(new JsonFileDatabase<Paper>());
serviceProvider.registerServiceServer("DropService", new DropServiceServer(ServiceAgent));
serviceProvider.registerService("PaperService", paperService);
// TODO: Wait for main process to be ready
serviceProvider.registeServiceFactory<ConfigService>("ConfigService", async () => {
    const fileSystemService = serviceProvider.getService<FileSystemService>("FileSystemService");
    // const appDataPath = await fileSystemService.getAppDataPath();
    const appDataPath = path.resolve(__dirname, "..", "..", "dev-running-app-data"); // For development
    return new ConfigService(appDataPath);
}, "FileSystemService");
serviceProvider.registeServiceFactory<PluginManager>("PluginManager", async () => {
    await serviceProvider.registerPrivateServiceClient("PluginService", () => new PluginService(ServiceAgent));
    const configService = serviceProvider.getService<ConfigService>("ConfigService");
    const pluginService = serviceProvider.getService<PluginService>("PluginService");
    const config = await configService.getConfig();
    return new PluginManager(config, pluginService);
}, "ConfigService");


