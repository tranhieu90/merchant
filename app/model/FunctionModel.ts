export class FunctionModel {
    id!: number;
    parentId!: number | null;
    level!: number;
    code!: string;
    name!: string;
    isActive!: number;
    path!: string;
    createDate!: string;
    createBy!: string;
    updateDate!: string | null;
    updateBy!: string | null;
    isKey!: number;
    children: FunctionModel[] = [];
    isChoose: boolean = false;
    partiallyComplete: boolean = false;
    dependentFunctionId!: number[] | null;
}