export interface IFuntionGroup {
    functionId: number;
    name: string;
    level?: number;
    parentId?: number;

     children: IFuntionGroup[];
}
export interface IErrorRespone {
    error?:string;
    clientMessageId: string;
    data?: number;
    path?: number;
    soaErrorCode?:string;
    soaErrorDesc?:string;
    status: number;
}