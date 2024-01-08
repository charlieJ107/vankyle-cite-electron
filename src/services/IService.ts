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

export function Dependency(id: string) {
    return function (target: any, context: ClassFieldDecoratorContext) {
    }
}