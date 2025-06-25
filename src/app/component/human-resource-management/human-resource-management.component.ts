import { NgClass, NgIf } from '@angular/common';
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
import { distinctUntilChanged } from 'rxjs';
import { MatBadge } from '@angular/material/badge';

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
    MatBadge,
    NgClass
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
  skipSearch = false;
  columns: Array<GridViewModel> = [
    {
      name: 'userId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
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
          return ['text-left', 'mw-180'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'dateOfBirth',
      label: 'NGÀY SINH',
      options: {
        customCss: (obj: any) => {
          return ['text-left', 'mw-140'];
        },
        customCssHeader: () => {
          return ['text-left'];
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
          return ['text-left', 'mw-140'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'roleName',
      label: 'VAI TRÒ',
      options: {
        customCssHeader: (obj: any) => {
          return ['text-left', 'mw-160'];
        },
        customCss: (obj: any) => {
          return ['text-left'];
        },
      },
    },
  ];
  action: any = [];

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
  hasRole?: boolean;
  countSelectFilter: number = 0;

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
    // this.formValueChange();
    this.userInfo = this.auth.getUserInfo();
    this.hasRole = this.auth.apiTracker([MERCHANT_RULES.USER_MANAGER_DETAIL]);
    if (this.hasRole) {
      this.columns.push({
        name: 'status',
        label: 'TRẠNG THÁI',
        options: {
          customCssHeader: (obj: any) => {
            return ['text-left'];
          },
          customCss: (obj: any) => {
            return ['text-left'];
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
      this.action.push({
        icon: 'icon-eye_on',
        title: 'Xem chi tiết',
        doAction: (item: any) => {
          this.skipSearch = true;
          this.checkOpenViewDetailPage(item);
        },
      });
    }

    this.doSearch();
    this.getLstRole();
  }

  // formValueChange() {
  //   this.formDropdown?.valueChanges
  //     .pipe(distinctUntilChanged())
  //     .subscribe(value => {
  //       console.log(value)
  //       if (value) {
  //         this.countSelectFilter++;
  //         return;
  //       }
  //       this.countSelectFilter--;
  //     });
  // }

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
      (error) => {
        this.totalItem = 0;
        this.dataList = [];
        // this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        const errorData = error?.error || {};
        let dataDialog: DialogConfirmModel = new DialogConfirmModel();
        switch (errorData.soaErrorCode) {
          case 'LOGIN_ERROR_006':
            dataDialog.title = 'Tài khoản đang bị khoá';
            dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-lock';
            dataDialog.width = '25%';
            dataDialog.viewCancel = false;
            dataDialog.iconColor = 'icon warning';
            this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
              if (result) {
              }
            });
            break;
          default:
            dataDialog.title = 'Lỗi hệ thống';
            dataDialog.message = 'Hệ thống đang bị gián đoạn. Vui lòng thử lại hoặc liên hệ quản trị viên để được hỗ trợ.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-error';
            dataDialog.width = '25%'
            dataDialog.viewCancel = false;
            dataDialog.iconColor = 'error';
            this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
              if (result) {
              }
            });
        }
      }
    );
  }

  onEnterSearch(): void {
    this.isSearch = true;
    this.pageIndex = 1;
    this.keyword = this.keyword?.trim();
    this.doSearch();
  }

  onBlurSearch() {
    setTimeout(() => {
      if (!this.skipSearch) {
        this.onEnterSearch();
      }
      this.skipSearch = false; // reset lại
    }, 100);
  }

  checkOpenViewDetailPage(item: any) {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.doDetail(item);
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
    dataDialog.message = `Hệ thống sẽ gửi liên kết xác thực tới <b>${this.auth.getUserInfo()?.emailChange
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
        this.router.navigate(['/profile']);
      } else {
      }
    });
  }

  doOpenPage() {
    // let verifyInfo = this.auth.checkVerifyUserInfo();
    // if (verifyInfo == 'VERIFIED') {
    //   this.router.navigate(['/hr/hr-create']);
    // } else {
    //   this.router.navigate(['/profile']);
    // }

    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.router.navigate(['/hr/hr-create']);
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

  doDetail(userDetail?: any) {
    // const hasRole = this.auth.apiTracker([MERCHANT_RULES.USER_MANAGER_DETAIL]);
    // if (!hasRole || !userDetail?.enableView) {
    //   this.showPopupUserNotPermission();
    // } else {
    if (userDetail['userId']) {
      this.api.get(HR_ENDPOINT.DETAIL, { userId: userDetail.userId }).subscribe(
        (res) => {
          this.router.navigate(['hr/hr-detail'], {
            queryParams: { userId: userDetail['userId'] },
            state: {
              personDetail: res?.data
            }
          });
        },
        (error) => {
          const errorData = error?.error || {};
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          switch (errorData.soaErrorCode) {
            case 'LOGIN_ERROR_006':
              dataDialog.title = 'Tài khoản đang bị khoá';
              dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.width = '25%';
              dataDialog.viewCancel = false;
              dataDialog.iconColor = 'icon warning';
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                }
              });
              break;
            case 'LOGIN_ERROR_009':
              dataDialog.title = 'Merchant mất kết nối';
              dataDialog.message = 'Merchant mất kết nối sử dụng dịch vụ, vui lòng liên hệ quản trị viên để được hỗ trợ.';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.width = '25%'
              dataDialog.viewCancel = false
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                }
              });
              break;
            case 'USER_ERROR_002':
              dataDialog.title = 'Người dùng không tồn tại hoặc đang bị khóa';
              dataDialog.message = 'Vui long liên hệ quản trị viên để được hỗ trợ.';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.width = '25%'
              dataDialog.viewCancel = false;
              dataDialog.iconColor = 'icon warning'
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                }
              });
              break;
            case 'USER_DETAIL_ERROR_001':
              this.showPopupUserNotPermission();
              break;
            case 'USER_ERROR_001':
              dataDialog.title = 'Tài khoản đang bị khoá';
              dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.width = '25%';
              dataDialog.viewCancel = false;
              dataDialog.iconColor = 'icon warning';
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                }
              });
              break;
            case 'SYSTEM_ERROR':
              dataDialog.title = 'Lỗi hệ thống';
              dataDialog.message = 'Hệ thống đang bị gián đoạn. Vui lòng thử lại hoặc liên hệ quản trị viên để được hỗ trợ.';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-error';
              dataDialog.width = '25%'
              dataDialog.viewCancel = false;
              dataDialog.iconColor = 'error';
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                }
              });
              break;
            default:
              this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
          }
        }
      );
    }

    // else this.router.navigate(['hr/hr-detail']);
    // }
  }

  showPopupUserNotPermission() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Bạn không có quyền xem nhân sự';
    dataDialog.message =
      'Nhân sự không thuộc tổ chức mà bạn được phân quyền.';
    dataDialog.icon = 'icon-warning';
    dataDialog.iconClosePopup = false;
    dataDialog.viewCancel = false;
    dataDialog.iconColor = 'icon warning';
    dataDialog.buttonLabel = 'Tôi đã hiểu';
    dataDialog.width = '23,5%';
    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
      if (result) {
      }
    });
  }

  changeFilter() {
    this.isFilter = !this.isFilter;
  }

  onConfirm() { }

  clearFilter() {
    this.formDropdown.get('status')?.setValue('');
    this.formDropdown.get('role')?.setValue('');
    this.doSearch();
  }

  getLstRole() {
    let param = {
      keyword: this.keyword,
      pageIndex: this.pageIndex,
      pageSize: 1000,
    };

    let buildParams = CommonUtils.buildParams(param);
    this.api
      .get(ROlE_ENDPOINT.AUTO_COMPLETE, buildParams)
      .subscribe((res) => {
        this.lstRole = res['data']['list'];
        this.lstRole.unshift({
          id: '',
          name: 'Tất cả',
          description: 'Tất cả vai trò',
        });
      });
  }

  checkHasSearchOrFilterData(): boolean {
    const status = this.formDropdown?.get('status')?.value;
    const role = this.formDropdown?.get('role')?.value;
    const p1 = status === null || status === undefined || status === '' ? true : false;
    const p2 = role === null || role === undefined || role === '' ? true : false;
    return (!p1 || !p2) ? false : true;
  }

  checkFilterNumber() {
    const status = this.formDropdown?.get('status')?.value;
    const role = this.formDropdown?.get('role')?.value;
    const p1 = status === null || status === undefined || status === '' ? 0 : 1;
    const p2 = role === null || role === undefined || role === '' ? 0 : 1;
    return (p1 + p2) > 0 ? (p1 + p2) : null;
  }

}
