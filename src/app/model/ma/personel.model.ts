import { IFuntionGroup } from "./funtion-group.model";

export interface IPersonelDetail {
    roleType?: number;
    id?: number;
    fullName?: string;
    userName?: string;
    isActive?: number;
    roleName?: string;
    dob?: Date;
    phone?: string;
    email?: string;
    emailChange?: string;
    createdDate?: Date;
    createdBy?: Date;
    updatedDate?: Date;
    orgType?: number;
    isVerify?: number;
    groupList?: IGroupList[];
    roleId?: number;
}

export interface IGroupList {
    id: number;
    groupName: string;
    level?: number;
    parentId?: number;
    merchantId?: number;
    level1?: number;
    level2?: number;
    level3?: number;
    level4?: number;
    level5?: number;
    createDate?: Date;
    createBy?: string;
    updateDate?: Date;
    updateBy?: string;
    isConfig?: number;
    isSetting?: number;
    pointSaleCount?: number;
}

export interface IRolePersonel {
    roleId: number;
    roleName: string;
    roleDescription?: string;
    roleType?: number;
    function?: IFuntionGroup[];
}

export interface IPersonelUpdate {
    userId?: number;
    roleId?: number;
    oraganizationInfo?: IOraganization;
    oraganizationDelete?: IOraganization;
}

export interface IOraganization {
    masterId?: number;
    groupIds?: number[];
    merchantIds?: number[];
}
