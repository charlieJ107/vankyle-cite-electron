export interface IRpcMessage {
    id: number;
    service: string;
    method: string;
    params: any[];
    result?: any;
    error?: any;
}

/**
 * ServiceProvider send this message to registry, expecting a MessagePort to 
 * the ServiceManager in return.
 */
export interface ServiceProviderInitRequest {
    providerId: string;
    chennel: "request-init-service-provider";
    serviceManager: string;
}

/**
 * Registry sends this message to ServiceProvider in response to a ServiceProviderInitRequest.
 */
export interface ServiceProviderInitResponse {
    chennel: "init-service-provider-response";
    serviceManager: string;
    port: MessagePort;
}

