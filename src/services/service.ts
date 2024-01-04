/**
 * @fileoverview Entrypoint of the service process.
 */

import { RpcFactory } from "@/common/rpc/RpcFactory";
import { PaperService } from "./PaperService/PaperService";
import { DropService } from "./DropService/DropService";
import { PluginService } from "./PluginService/PluginService";

const ServiceManager = RpcFactory.createServiceManager();
ServiceManager.registerService("PaperService", new PaperService());
ServiceManager.registerService("DropService", new DropService());
ServiceManager.registerService("PluginService", new PluginService({plugins: {plugin_dir: "./plugins", enabled_plugins: []}}));

