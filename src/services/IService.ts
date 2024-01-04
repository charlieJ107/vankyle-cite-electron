export interface IService {
    [key: string | number | symbol]: any;
}

export interface IAppServices {
    [service: string | symbol]: IService;
}