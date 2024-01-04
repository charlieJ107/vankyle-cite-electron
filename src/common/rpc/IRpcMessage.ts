import { PluginManifest } from "@/plugins/PluginManifest";

export interface IRpcMessage {
    id: number;
    service: string;
    method: string;
    params: any;
    result?: any;
    error?: any;
}

type SerivceProviderChennel = "request-init-service-provider" | "init-service-provider-response";

interface IServiceProviderMessage {
    chennel: SerivceProviderChennel;
    providerId: IServiceProviderMessage["chennel"] extends "request-init-service-provider" ? string : never;
    serviceManager: IServiceProviderMessage["chennel"] extends "init-service-provider-response" ? string : never;
    port: IServiceProviderMessage["chennel"] extends "request-init-service-provider" ? MessagePort : never;
}

type PluginManagerMethod =
    | "startPlugin"
    | "stopPlugin"
    | "showPlugin"
    | "hidePlugin";

type PluginManagerChannel = "plugin-manager-request" | "plugin-manager-response";
type PluginMessageParam = { manifest: PluginManifest, dir?: string };

interface IPluginManagerMessage {
    chennel: PluginManagerChannel;
    method: PluginManagerMethod;
    params: PluginMessageParam;
    result?: any;
}

/**
 * Message between main process and service process.
 * @property {string} chennel - channel of the message
 * @property {string} providerId - id of the service provider, used if chennel is "request-init-service-provider"
 * @property {string} serviceManager - id of the service manager, used if chennel is "init-service-provider-response"
 * @property {MessagePort} port - MessagePort object, used if chennel is "init-service-provider-response"
 */
export type IProcessMessage = IPluginManagerMessage | IServiceProviderMessage;
