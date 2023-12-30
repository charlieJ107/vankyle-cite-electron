import { IService } from "@charliej107/vankyle-cite-rpc";
import { MessagePortMain } from "electron";

export interface IAppService extends IService {
    init: (meessagePort: MessagePortMain) => Promise<void>;
}