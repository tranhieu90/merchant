import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TreeSelectModule } from 'primeng/treeselect';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { InputCommon } from '../../../common/directives/input.directive';
import { BUSINESS_ENDPOINT, GROUP_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { GridViewModel } from '../../../model/GridViewModel';

@Component({
  selector: 'app-business-management',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule, GridViewComponent, MatButtonModule, InputCommon, NgIf, DropdownModule, MultiSelectModule, TreeSelectModule],
  templateUrl: './business-management.component.html',
  styleUrl: './business-management.component.scss'
})
export class BusinessManagementComponent {
  keyWord: string = '';
  pageIndex = 0;
  pageSize = 10;
  totalItem: number = 0;
  dataList: any = [];
  isSearch: boolean = false;
  isFilter: boolean = false;
  isFilter1: boolean = false;
  formDropdown: FormGroup;
  lstPaymentMethod: any[] = [];
  isFirst: number = 0;
  groupNameOptions: any = [];
  serviceCode: string = '';
  lastClickedGroup: any = null;
  isConfig: any;

  columns: Array<GridViewModel> = [
    {
      name: 'merchantId',
      label: 'ID',
      options: {
        width: '8%',
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return value ? `# ${value}` : ''
        },
      }
    },
    {
      name: 'merchantBizName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        width: '25%',
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'formatAddress',
      label: 'ĐỊA CHỈ',
      options: {
        width: '25%',
        customCss: () => {
          return ['text-left', 'mw-160'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      }
    },
    {
      name: 'groupName',
      label: 'CỤM/NHÓM',
      options: {
        width: '15%',
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      }
    },
    {
      name: 'status',
      label: 'TRẠNG THÁI',
      options: {
        width: '10%',
        customCss: () => {
          return ['text-center'];
        },
        customBodyRender: (value: any) => {
          let msg;
          if (value === 'active') {
            msg = "<span class='status success'> Hoạt động </span>";
          } else {
            msg = "<span class='status lock'> Đã khóa </span>";
          }
          return msg;
        },
      }
    },
    {
      name: 'updateDate',
      label: 'NGÀY CẬP NHẬT',
      options: {
        width: '10%',
        customCss: () => {
          return ['text-center'];
        },
        customBodyRender: (value: any) => {
          return value ? moment(value).format('DD/MM/YYYY') : '';
        },
      }
    },
  ];

  action: any = [
    {
      icon: 'icon-eye_on',
      title: 'Xem chi tiết',
      doAction: (item: any) => {
        this.doDetail(item["merchantId"]);
      },
    },
  ]

  statusOptions: any[] = [
    { name: 'Tất cả', code: '' },
    { name: 'Khóa', code: 'inactive' },
    { name: 'Hoạt động', code: 'active' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService
  ) {
    this.formDropdown = this.fb.group({
      status: [''],
      paymentMethod: [''],
      groupName: [''],
    });
  }

  ngOnInit() {
    this.isConfig = this.auth.getUserInfo()?.isConfig;
    this.getLstPaymentMethod();
    this.getDataGroup();
    this.doSearch();
    this.hideColumn();
  }

  doSearch(pageInfo?: any) {
    this.isSearch = this.isFirst == 0 ? false : true;
    this.isFirst = 1;
    if (pageInfo) {
      this.pageIndex = pageInfo["page"] + 1;
      this.pageSize = pageInfo["pageSize"]
    }
    let lstMethodId = this.formDropdown.get('paymentMethod')?.value;
    let groupIdList = this.getIdBygroupIdlst(this.formDropdown.get('groupName')?.value);
    let dataReq = {
      groupIdList: groupIdList ? groupIdList : [],
      status: this.formDropdown.get('status')?.value,
      methodId: lstMethodId ? lstMethodId.map((num: any) => num.toString()) : [],
      mappingKey: this.serviceCode ? this.serviceCode : ''
    }

    let param = {
      page: this.pageIndex,
      size: this.pageSize,
      keySearch: this.keyWord ? this.keyWord : null,
    };
    let buildParams = CommonUtils.buildParams(param);

    this.api.post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams).subscribe((res: any) => {
      if (res['data']['subInfo']) {
        this.dataList = res['data']['subInfo'];
        this.dataList = this.dataList.map((item: any) => ({
          ...item,
          formatAddress: this.fomatAddress(item.address, item.communeName, item.districtName, item.provinceName)
        }));

        this.totalItem = res['data']['totalSub'];
      }
    }, () => {
      this.totalItem = 0;
      this.dataList = [];
      this.toast.showError('Lấy danh sách điểm bán xảy ra lỗi')
    });
  }

  getIdBygroupIdlst(data: any) {
    if (data && data.length > 0) {
      return data.map((item: any) => item.id);
    } else {
      return [];
    }
  }

  getLstPaymentMethod() {
    this.api.get(BUSINESS_ENDPOINT.GET_LIST_PAYMENT_METHOD).subscribe((res: any) => {
      if (res['data']) {
        this.lstPaymentMethod = res['data']['paymentMethodList'];
        // this.lstPaymentMethod.unshift({ paymentMethodName: "Tất cả", paymentMethodId: [324, 333, 332] })
      }
    }, (error: any) => {
      this.lstPaymentMethod = [];
      this.toast.showError('Lấy phương thức thanh toán xảy ra lỗi')
    });
  }

  onEnterSearch(): void {
    this.isSearch = true;
    this.pageIndex = 1;
    this.keyWord = this.keyWord?.trim();
    this.serviceCode = this.serviceCode?.trim();
    this.doSearch();
  }

  getDataGroup() {
    this.api.get(BUSINESS_ENDPOINT.GET_GROUP_FILTER).subscribe((res: any) => {
      if (res['data']) {
        let dataGroup = res['data'];
        this.groupNameOptions = this.convertLstAreaByOrder(dataGroup, dataGroup[0].parentId)
      }
    }, (error: any) => {
      this.groupNameOptions = [];
      this.toast.showError('Lấy phương thức thanh toán xảy ra lỗi')
    });
  }

  convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
    let result = list.filter(item => item.parentId === parentId);

    return result.map(item => {
      let children = this.convertLstAreaByOrder(list, item.id);
      return {
        ...item,
        label: item.groupName,
        key: item.id,
        children: children
      };
    });
  }

  doOpenPage() {
    this.router.navigate(['/business/business-create'],
      { queryParams: { lstBusiness: this.dataList.length > 0 ? true : false } });
  }

  doDetail(merchantId?: any) {
    if (merchantId)
      this.router.navigate(['/business/business-detail'], { queryParams: { merchantId: merchantId } });
    else
      this.router.navigate(['/business/business-detail']);
  }

  changeFilter() {
    this.isFilter = !this.isFilter;
    this.isFilter1 = false;
  }

  doReset() {
    if (this.isFilter) {
      this.formDropdown.reset();
      this.formDropdown.get('status')?.setValue('');
    } else {
      this.keyWord = '';
      this.serviceCode = '';
    }

    this.onEnterSearch();
  }

  fomatAddress(address: string, commune: string, district: string, province: string) {
    return [address, commune, district, province]
      .filter(part => part?.trim())
      .map(part => part.trim())
      .join(', ');
  }

  hideColumn() {
    this.columns = this.columns.map(col => {
      if (col.name === 'groupName') {
        return {
          ...col,
          options: {
            ...col.options,
            display: this.isConfig == 0 ? true : false
          }
        }
      }
      return col;
    });
  }

  changeSearch() {
    this.isFilter1 = !this.isFilter1;
    this.isFilter = false;
  }

  onGroupClick(event: any) {
    const clickedNode = event.node;

    this.lastClickedGroup = clickedNode;

    setTimeout(() => {
      const selected = this.formDropdown.controls['groupName']?.value || [];
      const parentId = clickedNode.parentId;
      const filtered = selected.filter((item: any) => item.parentId === parentId);

      this.formDropdown.controls['groupName']?.setValue(filtered);

      this.onChangeGroup();
    }, 0);
  }

  onChangeGroup() {
    const selected = this.formDropdown.controls['groupName']?.value || [];
    if (!this.lastClickedGroup || selected.length === 0) return;

    const clickedNode = this.findItemById(this.groupNameOptions, this.lastClickedGroup.id);
    if (!clickedNode) return;

    const targetLevel = clickedNode.level;
    const targetParentId = clickedNode.parentId;

    const filtered = selected.filter((item: any) => {
      const current = this.findItemById(this.groupNameOptions, item.id);
      return current?.level === targetLevel && current?.parentId === targetParentId;
    });

    this.formDropdown.controls['groupName']?.setValue(filtered);

    const groupIdList = filtered.map((item: any) => item.id).join(',');
  }

  findItemById(tree: any[], id: number): any {
    for (let node of tree) {
      if (node.id === id) {
        return node;
      }
      if (node.children?.length) {
        const found = this.findItemById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

}
