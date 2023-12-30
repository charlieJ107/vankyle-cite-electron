import { IDropHandler } from "@charliej107/vankyle-cite-plugin";
import { IService } from "../IService";
/**
 * 拖拽处理服务，用于处理拖拽事件
 * 维护一个RPCClient队列，将拖拽进来的内容发送给队列中的每一个RPCClient所对应的服务
 */
export class DropHandlerService implements IService {
    constructor() {

    }

    private dropHandlers: IDropHandler[] = [];

    /**
     * 注册一个拖拽处理器
     * @param dropHandler 拖拽处理器
     */
    register(dropHandler: IDropHandler) {
        this.dropHandlers.push(dropHandler);
    }

    /**
     * 处理拖拽事件
     * @param data 拖拽数据
     */
    handle(path: string) {
        this.dropHandlers.forEach(handler => {
            handler.handleDrop(path);
        });
    }
}