/**
 * AppServiceProvider
 * 给renderer进程调用的前台实例，向前台暴露安全的API
 */

export class AppServiceProvider {
    constructor() {

    }

    public hello(){
        console.log("hello")
    }

    public init() {
        // TODOs: 
        // 订阅后台服务加载事件
        // 订阅插件加载事件
    }

    public helloDrag(event: DragEvent) {
        console.log(event.dataTransfer?.files)
    }
}