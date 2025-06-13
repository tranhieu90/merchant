export class AreaModel {
    id!: number;
    parentId!: number | null;
    level: number = 0;
    name?: string;
    groupName?: string;
    children: AreaModel[] = [];
    lstMerchant: number[] =[];
  }