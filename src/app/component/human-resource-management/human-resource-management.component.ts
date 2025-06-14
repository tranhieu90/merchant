import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment/moment';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TreeSelectModule } from 'primeng/treeselect';
import { GridViewComponent } from '../../base/shared/grid-view/grid-view.component';
import { InputCommon } from '../../common/directives/input.directive';
import {
  GROUP_ENDPOINT,
  HR_ENDPOINT,
  ROlE_ENDPOINT,
} from '../../common/enum/EApiUrl';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { ToastService } from '../../common/service/toast/toast.service';
import { GridViewModel } from '../../model/GridViewModel';
import { CommonUtils } from '../../base/utils/CommonUtils';
import { UserVerifyStatus } from '../../common/constants/CUser';
import {
  DialogRoleComponent,
  DialogRoleModel,
} from '../role-management/dialog-role/dialog-role.component';
import { MERCHANT_RULES } from '../../base/constants/authority.constants';
import { HasRolesDirective } from '../../base/directive/has-roles.directive';
import { DirectiveModule } from '../../base/module/directive.module';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';

@Component({
  selector: 'app-human-resource-management',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    GridViewComponent,
    MatButtonModule,
    InputCommon,
    NgIf,
    DropdownModule,
    MultiSelectModule,
    TreeSelectModule,
    DirectiveModule,
  ],
  templateUrl: './human-resource-management.component.html',
  styleUrl: './human-resource-management.component.scss',
})
export class HumanResourceManagementComponent implements OnInit {
  readonly MERCHANT_RULES = MERCHANT_RULES;
  keyword: string = '';
  isFilter: boolean = false;
  pageIndex = 0;
  pageSize = 10;
  totalItem: number = 0;
  dataList: any = [];
  isSearch: boolean = false;
  userInfo: any = {};
  columns: Array<GridViewModel> = [
    {
      name: 'userId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-center'];
        },
        customCssHeader: () => {
          return ['text-center'];
        },
        customBodyRender: (value: any) => {
          return '#' + value;
        },
      },
    },
    {
      name: 'fullName',
      label: 'HỌ VÀ TÊN',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-center'];
        },
      },
    },
    {
      name: 'dateOfBirth',
      label: 'NGÀY SINH',
      options: {
        customCss: (obj: any) => {
          return ['text-center'];
        },
        customCssHeader: () => {
          return ['text-center'];
        },
        customBodyRender: (value: any) => {
          return value ? moment(value).format('DD/MM/YYYY') : '';
        },
      },
    },
    {
      name: 'phoneNumber',
      label: 'SỐ ĐIỆN THOẠI',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-center'];
        },
      },
    },
    {
      name: 'roleName',
      label: 'VAI TRÒ',
      options: {
        customCssHeader: (obj: any) => {
          return ['text-center'];
        },
        customCss: (obj: any) => {
          return ['text-left'];
        },
      },
    },
  ];
  action: any = [
    {
      icon: 'icon-eye_on',
      title: 'Xem chi tiết',
      doAction: (item: any) => {
        this.checkOpenViewDetailPage(item);
      },
    },
  ];

  formDropdown: FormGroup;
  statusOptions: any[] = [
    { name: 'Tất cả', code: '' },
    { name: 'Khóa', code: 0 },
    { name: 'Hoạt động', code: 1 },
  ];

  roleOptions: any[] = [];
  userId: any;
  merchantId: any;
  lstRole: any = [];
  dataPointSale: any = [];
  businessPoint: boolean = false; //Được gán với điểm kinh doanh
  merchantNoGroup: boolean = false; //Được gán với merchant không có nhóm
  merchantWithGroup: boolean = false; //Được gán với merchant có nhóm

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService
  ) {
    this.formDropdown = this.fb.group({
      status: [''],
      role: [''],
    });
  }

  ngOnInit() {
    this.userInfo = this.auth.getUserInfo();
    if (this.userInfo && this.userInfo.orgType != 2) {
      this.columns.push({
        name: 'status',
        label: 'TRẠNG THÁI',
        options: {
          customCss: (obj: any) => {
            return ['text-center'];
          },
          customBodyRender: (value: any, obj: any) => {
            let msg;
            if (value !== 1) {
              msg = "<span class='status lock'> KHÓA </span>";
            } else {
              msg = "<span class='status success'> HOẠT ĐỘNG </span>";
            }
            return msg;
          },
        },
      });
    }
    this.doSearch();
    this.getLstRole();
  }

  doSearch(pageInfo?: any) {
    this.isSearch = true;
    if (pageInfo) {
      this.pageIndex = pageInfo['page'];
      this.pageSize = pageInfo['pageSize'];
    } else {
      this.pageIndex = 0;
    }

    let params: any = {
      keyword: this.keyword,
      status: this.formDropdown.controls['status']?.value,
      roleId: this.formDropdown.controls['role']?.value,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };

    this.api.get(HR_ENDPOINT.GET_LIST_HR, params).subscribe(
      (res) => {
        this.dataList = res['data']['list'];
        this.totalItem = res['data']['count'];
      },
      () => {
        this.totalItem = 0;
        this.dataList = [];
        this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    );
  }

  onEnterSearch(): void {
    this.isSearch = true;
    this.pageIndex = 1;
    this.keyword = this.keyword?.trim();
    this.doSearch();
  }

  checkOpenViewDetailPage(item: any) {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.doDetail(item['userId']);
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
    dataDialog.message = `Hệ thống sẽ gửi liên kết xác thực tới <b>${
      this.auth.getUserInfo()?.emailChange
    }</b>.`;
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
      if (result != undefined) {
        this.router.navigate(['/profile']);
      } else {
      }
    });
  }

  openDialogUnverifiedAccountAndNoEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message =
      'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonRightLabel = 'Bổ sung email';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/profile']);
      } else {
      }
    });
  }

  doOpenPage() {
    let verifyInfo = this.auth.checkVerifyUserInfo();
    if (verifyInfo == 'VERIFIED') {
      this.router.navigate(['/hr/hr-create']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  doDetail(userId?: any) {
    const hasRole = this.auth.apiTracker([MERCHANT_RULES.USER_MANAGER_DETAIL]);
    if (!hasRole) {
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Bạn không có quyền xem nhân sự';
      dataDialog.message =
        'Nhân sự này không thuộc tổ chức mà bạn được phân quyền.';
      dataDialog.icon = 'icon-warning';
      dataDialog.viewCancel = false;
      dataDialog.iconColor = 'icon warning';
      dataDialog.buttonLabel = 'Xác nhận';
      dataDialog.width = '23,5%';
      this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
        if (result) {
        }
      });
    } else {
      if (userId)
        this.router.navigate(['hr/hr-detail'], {
          queryParams: { userId: userId },
        });
      else this.router.navigate(['hr/hr-detail']);
    }
  }

  changeFilter() {
    this.isFilter = !this.isFilter;
  }

  onConfirm() {}

  clearFilter() {
    this.formDropdown.get('status')?.setValue('');
    this.formDropdown.get('role')?.setValue('');
    this.keyword = '';
    this.doSearch();
  }

  getLstRole() {
    let param = {
      keyword: this.keyword,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };

    let buildParams = CommonUtils.buildParams(param);
    this.api
      .get(ROlE_ENDPOINT.SEARCH_LIST_ROLE, buildParams)
      .subscribe((res) => {
        this.lstRole = res['data']['list'];
        this.lstRole.unshift({
          id: '',
          name: 'Tất cả',
          description: 'Tất cả vai trò',
        });
        console.log('lstRole', this.lstRole);
      });
  }
}
