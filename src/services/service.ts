/**
 * @fileoverview Entrypoint of the service process.
 */

import { RpcFactory } from "@/common/rpc/RpcFactory";
import { PaperService } from "./PaperService/PaperService";

const ServiceManager = RpcFactory.createServiceManager();
ServiceManager.registerService("PaperService", new PaperService())

