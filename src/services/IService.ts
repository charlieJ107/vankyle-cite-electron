export interface IService {
    [key: string | number | symbol]: (...args: any[]) => any;
}

export interface IAppServices{
    [service: string | symbol]: IService;
}