/**
 * AppServiceProvider
 * 给renderer进程调用的前台实例，向前台暴露安全的API
 */

import { IService } from "../../../services/IService";

export class AppServiceProvider {
    // TODO
    // private messagePort: MessagePort;
    // constructor(messagePort: MessagePort) {
    //     this.messagePort = messagePort;
    // }

    hello = () => {
        console.log("hello")
    }

    init() {
        // this.messagePort.onmessage = (event) => {
        //     console.log(event)
        // }
    }

    getService = (service_name: string): IService => {
        return {
            name: service_name,
            hello: () => {
                console.log("hello")
            }
        }
    }
 
}