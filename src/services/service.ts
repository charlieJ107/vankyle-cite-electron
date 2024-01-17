/**
 * @fileoverview Entrypoint of the service process.
 */

import { REGISTER_AGENT } from "../common/rpc/IMessages";
import { MessagePortRpcManager } from "../common/rpc/MessagePortRpcManager";
import { MessagePortRpcAgent } from "../common/rpc/MessagePortRpcAgent";
import { PaperService } from "./services/PaperService";
import { ServiceProvider } from "./ServiceProvider";
import { JsonFileDatabase } from "../data/database/local/JsonFileDatabase";
import { Paper } from "../models/paper";
import { DropServiceServer } from "./services/DropService";
import { PluginManager } from "./services/PluginManager";
import { PluginService } from "../plugins/PluginService";
import { ConfigService } from "./services/ConfigService";
import { FileSystemService } from "./main/FileSystemService";

import path from "path";
import { AuthorService } from "./services/AuthorService";
import { Author } from "src/models/author";

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
serviceProvider.registerService("AuthorService", new AuthorService(new JsonFileDatabase<Author>()));
// TODO: Wait for main process to be ready
serviceProvider.registeServiceFactory<ConfigService>("ConfigService", async () => {
    const fileSystemService = serviceProvider.getService<FileSystemService>("FileSystemService");
    let appDataPath = await fileSystemService.getAppDataPath();
    if (process.env.NODE_ENV === "development") {
        console.log("Running in development mode, using dev-running-app-data");
        appDataPath = path.resolve(__dirname, "..", "..", "dev-running-app-data");
    } else {
        console.log("Running in production mode, using appDataPath");
    }
    return new ConfigService(appDataPath);
}, "FileSystemService");
serviceProvider.registeServiceFactory<PluginManager>("PluginManager", async () => {
    await serviceProvider.registerPrivateServiceClient("PluginService", () => new PluginService(ServiceAgent));
    const configService = serviceProvider.getService<ConfigService>("ConfigService");
    const pluginService = serviceProvider.getService<PluginService>("PluginService");
    const config = await configService.getConfig();
    if (process.env.NODE_ENV === "development") {
        console.log("Running in development mode, using local plugin folders");
        config.plugins.plugin_dir = path.resolve(__dirname, "..", "..", "plugins");
        await configService.updateConfig(config);
    } else {
        console.log("Running in production mode, using appDataPath");
    }

    const pluginManager = new PluginManager(config, pluginService, configService);
    await pluginManager.getInstalledPlugins();
    return pluginManager;
}, "ConfigService");


