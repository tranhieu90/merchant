import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadge } from '@angular/material/badge';
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
import { UserVerifyStatus } from '../../../common/constants/CUser';
import { InputCommon } from '../../../common/directives/input.directive';
import { BUSINESS_ENDPOINT, GROUP_ENDPOINT, USER_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { GridViewModel } from '../../../model/GridViewModel';
import { DialogRoleComponent, DialogRoleModel } from '../../role-management/dialog-role/dialog-role.component';
import { UpdateUserComponent } from '../../user-profile/update-user/update-user.component';

@Component({
  selector: 'app-business-management',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule, GridViewComponent, MatButtonModule, InputCommon, NgIf, DropdownModule, MultiSelectModule, TreeSelectModule, MatBadge],
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
  pageInfo: any = {
    pageSize: 10,
    page: 0,
  };

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
      label: 'TÊN NHÓM',
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
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService,
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
    if (this.auth.getUserInfo()?.orgType != 2) {
      this.getDataGroup();
    }
    this.doSearch();
    this.hideColumn();
    this.formDropdown.valueChanges.subscribe(() => {
      this.countTotalFilter();
    });
  }

  doSearch(pageInfo?: any) {
    this.isSearch = this.isFirst == 0 ? false : true;
    this.isFirst = 1;
    if (pageInfo) {
      this.pageIndex = pageInfo["page"] + 1;
      this.pageSize = pageInfo["pageSize"]
    }
    let lstMethodId = this.formDropdown.get('paymentMethod')?.value;
    let groupIdList = this.getTopLevelGroupIds(this.formDropdown.get('groupName')?.value || []);
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
    this.api.get(BUSINESS_ENDPOINT.GET_LIST_PAYMENT_METHOD_FILTER).subscribe((res: any) => {
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
    this.pageInfo = {
      pageSize: this.pageSize,
      page: this.pageIndex - 1,
    }
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

  changeFilter(buttonRef: any) {
    const nativeButton: HTMLElement = buttonRef?.el?.nativeElement?.querySelector('button');
    if (!nativeButton) return;

    if (this.isFilter) {
      nativeButton.blur();
    } else {
      nativeButton.focus();
    }
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

  changeSearch(buttonRef: any) {
    const nativeButton: HTMLElement = buttonRef?.el?.nativeElement?.querySelector('button');
    if (!nativeButton) return;

    if (this.isFilter1) {
      nativeButton.blur();
    } else {
      nativeButton.focus();
    }
    this.isFilter1 = !this.isFilter1;
    this.isFilter = false;
  }

  onGroupClick(event: any) {
    const clickedNode = event.node;
    this.lastClickedGroup = clickedNode;

    setTimeout(() => {
      const selected = this.formDropdown.controls['groupName']?.value || [];
      const clickedFullNode = this.findItemById(this.groupNameOptions, clickedNode.id);
      if (!clickedFullNode) return;

      const targetLevel = clickedFullNode.level;
      const targetParentId = clickedFullNode.parentId;

      // Lọc các node cùng level và cùng parentId
      const sameLevelNodes = selected.filter((item: any) => {
        const fullItem = this.findItemById(this.groupNameOptions, item.id);
        return fullItem?.level === targetLevel && fullItem?.parentId === targetParentId;
      });

      // Lấy toàn bộ con (mọi cấp) của các node này
      const allWithChildren: any[] = [];

      for (const node of sameLevelNodes) {
        const fullNode = this.findItemById(this.groupNameOptions, node.id);
        if (fullNode) {
          allWithChildren.push(fullNode);
          const children = this.getAllChildNodes(fullNode);
          allWithChildren.push(...children);
        }
      }

      // Loại bỏ trùng ID
      const uniqueById = Array.from(new Map(allWithChildren.map(item => [item.id, item])).values());

      // Gán lại cho ngModel
      this.formDropdown.controls['groupName']?.setValue(uniqueById);

      // Gọi logic tiếp theo
      this.onChangeGroup();
    }, 0);
  }

  onChangeGroup() {
    const selected = this.formDropdown.controls['groupName']?.value || [];
    if (!this.lastClickedGroup || selected.length === 0) return;

    const topLevelIds = this.getTopLevelGroupIds(selected);
  }

  getTopLevelGroupIds(selectedNodes: any[]): string[] {
    const selectedIds = selectedNodes.map(node => node.id);
    const topLevelNodes: any[] = [];

    for (const node of selectedNodes) {
      const fullNode = this.findItemById(this.groupNameOptions, node.id);
      const hasAncestorInSelected = this.hasParentInList(fullNode, selectedIds);

      if (!hasAncestorInSelected) {
        topLevelNodes.push(fullNode);
      }
    }

    return topLevelNodes.map(node => node.id);
  }

  hasParentInList(node: any, idList: string[]): boolean {
    if (!node || !node.parentId) return false;
    if (idList.includes(node.parentId)) return true;

    const parentNode = this.findItemById(this.groupNameOptions, node.parentId);
    return this.hasParentInList(parentNode, idList);
  }

  findItemById(nodes: any[], id: any): any {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findItemById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  getAllChildNodes(node: any): any[] {
    let result: any[] = [];
    if (node?.children && node.children.length > 0) {
      for (const child of node.children) {
        const fullChild = this.findItemById(this.groupNameOptions, child.id);
        if (fullChild) {
          result.push(fullChild);
          result.push(...this.getAllChildNodes(fullChild)); // đệ quy lấy mọi cấp con
        }
      }
    }
    return result;
  }
  countTotalSearch() {
    let countSearch = 0;
    const fields = [this.serviceCode, this.keyWord];
    countSearch = fields.filter(val => val && val.trim() !== '').length;
    return countSearch > 0 ? countSearch : null;
  }

  countTotalFilter() {
    let countSearch = 0;
    const formValue = this.formDropdown.value;
    countSearch = Object.values(formValue).filter(val => {
      if (Array.isArray(val)) return val.length > 0;
      return val !== null && val !== undefined && val !== '';
    }).length;
    return countSearch > 0 ? countSearch : null;
  }

  getSelectedNames(selectedItems: any[]): string {
    if (!selectedItems || selectedItems.length === 0) return '';
    return selectedItems.map(item => item.paymentMethodName).join(', ');
  }

  isSelectAllGroup(selectedNodes: any[]): boolean {
    const totalSelectableLeaf = this.countLeafNodes(this.groupNameOptions);
    const selectedLeafCount = selectedNodes.filter(n => !n.children || n.children.length === 0).length;
    return selectedLeafCount === totalSelectableLeaf;
  }

  countLeafNodes(nodes: any[]): number {
    if (!nodes) return 0;
    let count = 0;
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        count += this.countLeafNodes(node.children);
      } else {
        count += 1;
      }
    }
    return count;
  }

  getSelectedGroupNames(selectedNodes: any[]): string {
    return selectedNodes.map(n => n.label).join(', ');
  }

  isFilterActive(): boolean {
    const formValue = this.formDropdown?.value;

    const statusSelected = formValue?.status != null && formValue.status !== '';
    const paymentSelected = formValue?.paymentMethod != null && formValue.paymentMethod.length > 0;
    const groupNameSelected = formValue?.groupName != null && formValue.groupName.length > 0;
    const serviceCodeFilled = this.serviceCode != null && this.serviceCode.trim() !== '';
    const keyWordFilled = this.keyWord != null && this.keyWord.trim() !== '';

    return statusSelected || paymentSelected || groupNameSelected || serviceCodeFilled || keyWordFilled;
  }

  checkOpenCreate() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.doOpenPage();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.openDialogUnverifiedAccountAndEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.openDialogUnverifiedAccountAndNoEmail();
        break;
      default:
        console.warn('Trạng thái xác minh không hợp lệ:', verifyUser);
        break;
    }
  }

  openDialogUnverifiedAccountAndEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message = `Hệ thống sẽ gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(this.auth?.getUserInfo()?.emailChange)}</b>.`;
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonLeftLabel = 'Thay đổi email';
    dataDialog.buttonRightLabel = 'Xác thực email';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.verifyEmail();
      } else {
        this.updateEmail();
      }
    });
  }

  openDialogUnverifiedAccountAndNoEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message =
      'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
    dataDialog.icon = 'icon-warning';
    dataDialog.hiddenButtonLeft = true;
    dataDialog.iconColor = 'warning';
    dataDialog.buttonRightLabel = 'Bổ sung email';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateEmail();
      } else {
      }
    });
  }

  updateEmail() {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '600px',
      data: {
        title: 'Cập nhật email',
        type: 'email',
        isEmailInfo: true,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/profile']);
      }
    })
  }

  verifyEmail() {
    this.api.post(USER_ENDPOINT.SEND_VERIFY_MAIL).subscribe(res => {
      let content = `Chúng tôi vừa gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(this.auth?.getUserInfo()?.emailChange)}</b>, vui lòng kiểm tra email và làm theo hướng dẫn để hoàn tất xác thực tài khoản.`
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Hệ thống đã gửi liên kết xác thực';
      dataDialog.message = content;
      dataDialog.buttonLabel = 'Tôi đã hiểu';
      dataDialog.icon = 'icon-mail';
      dataDialog.iconColor = 'icon info';
      dataDialog.viewCancel = false;
      const dialogRef = this.dialogCommon.openDialogInfo(dataDialog);
      dialogRef.subscribe(res => {
        this.router.navigate(['/profile']);
      })
    })
  }
}
