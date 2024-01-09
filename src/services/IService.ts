import { DropService } from "./DropService/DropService";
import { PaperService } from "./PaperService/PaperService";

export interface IService {
    [key: string]: any;

}


export interface IAppService {
    PaperService: PaperService;
    DropService: DropService;
    [key: string]: IService;
}

export function ServiceDependency(id: string) {
    return function (target: Function, context: ClassDecoratorContext) {
        context.addInitializer(() => {
            
        });
    }
}

export function DependsOn(id: string) {
    return function (target: Function, context: ClassFieldDecoratorContext) {
        context.addInitializer(() => {
            
        });
    }
}