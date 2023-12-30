import { MessagePortMain } from "electron";
import { IService } from "../common/rpc/IService";

export interface IAppService extends IService {
    init(meessagePort: MessagePortMain): Promise<void>;
}