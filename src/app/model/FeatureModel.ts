export class FeatureModel {
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
    children: FeatureModel[] = [];
    isChoose: boolean = false;
    partiallyComplete: boolean = false;
}