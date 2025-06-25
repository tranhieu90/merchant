import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { GridViewComponent } from '../../base/shared/grid-view/grid-view.component';
import { CommonUtils } from '../../base/utils/CommonUtils';
import { ROlE_ENDPOINT, USER_ENDPOINT } from '../../common/enum/EApiUrl';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { ToastService } from '../../common/service/toast/toast.service';
import { GridViewModel } from '../../model/GridViewModel';
import { DialogRoleComponent, DialogRoleModel } from './dialog-role/dialog-role.component';
import { UserVerifyStatus } from '../../common/constants/CUser';
import { InputCommon } from '../../common/directives/input.directive';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { UpdateUserComponent } from '../user-profile/update-user/update-user.component';
import { PermissionDirective } from '../../common/directives/permissionDirective';
import { MERCHANT_RULES } from '../../base/constants/authority.constants';
import { firstValueFrom } from 'rxjs';

export type Role = {
  id: number,
  parentId: string,
  level: number,
  code: string,
  name: string,
  isActive: number,
  path: string,
  createDate: Date,
  createBy: string,
  updateDate: Date,
  updateBy: string,
  isKey: number
  RoleChild: Role[]
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule, GridViewComponent, MatButtonModule, InputCommon, PermissionDirective],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})

export class RoleManagementComponent implements OnInit {
  keyWord: string = '';
  pageIndex = 0;
  pageSize = 10;
  totalItem: number = 0;
  dataList: any = [];
  isSearch: boolean = false;
  isShowUpdate: boolean = false;
  columns: Array<GridViewModel> = [
    {
      name: 'id',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left', 'mw-120'];
        },
        customCssHeader: (obj: any) => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return "#" + value;
        },
      }
    },
    {
      name: 'name',
      label: 'VAI TRÒ',
      options: {
        customCss: () => {
          return ['text-left', 'mw-180'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          //TH name có dạng </script>
          const newValue = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return newValue;
        },
      }
    },
    {
      name: 'type',
      label: 'LOẠI VAI TRÒ',
      options: {
        customCss: () => {
          return ['text-left', 'mw-140'];
        },
        customBodyRender: (value: any) => {
          let msg;
          if (value === 1) {
            msg = 'Vai trò thiết lập';
          } else if (value === 2) {
            msg = 'Vai trò quản trị';
          } else if (value === 3) {
            msg = 'Vai trò người dùng';
          }
          return msg;
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'createBy',
      label: 'NGƯỜI TẠO',
      options: {
        customCss: () => {
          return ['text-left', 'mw-120'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'createDate',
      label: 'NGÀY TẠO',
      options: {
        customCss: () => {
          return ['text-left', 'mw-120'];
        },
        customBodyRender: (value: any) => {
          return value ? moment(value).format('DD/MM/YYYY') : '';
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'updateDate',
      label: 'NGÀY CẬP NHẬT',
      options: {
        customCss: () => {
          return ['text-left', 'mw-120'];
        },
        customBodyRender: (value: any) => {
          return value ? moment(value).format('DD/MM/YYYY') : '';
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
  ];

  action: any = [
    {
      icon: 'icon-edit',
      title: 'Chỉnh sửa',
      doAction: (item: any) => {
        this.doOpenPage(item["id"]);
      },
      display: (item: any) => {
        return item["isDefault"] === 1 && this.isShowUpdate ? true : false;
      }
    },
    {
      icon: 'icon-eye_on',
      title: 'Xem chi tiết',
      doAction: (item: any) => {
        this.doDetail(item["id"]);
      },
    },
  ]

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService,
  ) {

  }

  ngOnInit() {
    this.isShowUpdate = this.auth.apiTracker([MERCHANT_RULES.ROLE_UPDATE]);
    this.doSearch();
  }

  async doOpenPage(roleId?: any) {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        if(roleId) {
          const totalUsers =  await this.getLstUsers(roleId);
          if (totalUsers > 0) {
            let dataDialog: DialogConfirmModel = new DialogConfirmModel();
            dataDialog.title =
              'Vai trò đang gán cho ' + totalUsers + ' nhân sự';
            dataDialog.message =
              'Việc thay đổi thông tin vai trò sẽ ảnh hưởng đến danh sách tính năng được sử dụng của nhân sự. Bạn có chắc chắn muốn tiếp tục cập nhật vai trò không?';
            dataDialog.buttonLabel = 'Xác nhận';
            dataDialog.icon = 'icon-warning';
            dataDialog.viewCancel = true;
            dataDialog.iconColor = 'icon warning';
            this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
              if (result) {
                this.router.navigate(['/role/create-role'], roleId ? { queryParams: { roleId } } : {});
              }
            });
            return;
          }
        } else {
          this.router.navigate(['/role/create-role'], roleId ? { queryParams: { roleId } } : {});
        }
        break;
      case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
        this.openDialogUnverifiedAccountHasEmail();
        break;
      case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
        this.openDialogUnverifiedAccountNoEmail();
        break;
      default:
        console.warn("Trạng thái xác minh không hợp lệ:", verifyUser);
        break;
    }
  }

  getLstUsers(roleId?: number): Promise<number> {
    const param = {
      roleId: roleId,
      pageIndex: 0,
      pageSize: 1000,
    };
    return firstValueFrom(this.api.get(ROlE_ENDPOINT.SEARCH_LIST_USER_ROLE, param))
      .then(res => res['data']['count']);
  }

  doDetail(roleId?: any) {
    if (roleId)
      this.router.navigate(['/role/detail-role'], { queryParams: { roleId: roleId } });
    else
      this.router.navigate(['/role/detail-role']);
  }

  clearValue(nameInput: string) {
    this.keyWord = '';
  }

  doSearch(pageInfo?: any) {
    if (pageInfo) {
      this.pageIndex = pageInfo["page"];
      this.pageSize = pageInfo["pageSize"]
    }
    else {
      this.pageIndex = 0;
    }

    let param = {
      keyword: this.keyWord,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };

    let buildParams = CommonUtils.buildParams(param);
    this.api.get(ROlE_ENDPOINT.SEARCH_LIST_ROLE, buildParams).subscribe(res => {
      this.dataList = res['data']['list'];
      this.totalItem = res['data']['count'];
    }, (error) => {
      const errorData = error?.error || {};
      switch (errorData.soaErrorCode) {
        case 'ACCOUNT_ERROR_001':
          this.openDialogUnverifiedAccountNoEmail();
          break;
        case 'ACCOUNT_ERROR_002':
          this.openDialogUnverifiedAccountHasEmail();
          break;
      }
    });
  }

  onEnterSearch(): void {
    this.isSearch = true;
    this.pageIndex = 0;
    this.keyWord = this.keyWord?.trim();
    this.doSearch();
  }

  openDialogUnverifiedAccountHasEmail() {
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
      if (result != undefined) {
        if (result === true) {
          this.verifyEmail();
        } else {
          this.updateEmail();
        }
      }
    })
  }

  openDialogUnverifiedAccountNoEmail() {
    let dataDialog: DialogRoleModel = new DialogRoleModel();
    dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
    dataDialog.message = 'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
    dataDialog.icon = 'icon-warning';
    dataDialog.iconColor = 'warning';
    dataDialog.buttonRightLabel = 'Bổ sung email';
    dataDialog.hiddenButtonLeft = true
    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataDialog,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined) {
        this.updateEmail();
      }
    })
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
    }, (error) => {
      const errorData = error?.error || {};
      // if (errorData.soaErrorCode == 'AUTH_ERROR_007') {
      //   this.dialog.open(LoginNotificationComponent, {
      //     panelClass: 'dialog-login-noti',
      //     data: {
      //       title: 'Email đã được xác thực bởi tài khoản khác',
      //       message: 'Vui lòng thay đổi email để xác thực tài khoản.',
      //       icon: 'icon-mail',
      //       typeClass: 'warning',
      //       expired: true,
      //       textLeft: 'Hủy',
      //       type: 'email',
      //       textRight: 'Thay đổi email',
      //       isEmailInfo: true
      //     },
      //     width: '30%',
      //     disableClose: true,
      //   })
      // }
    })
  }

  clearKeyword() {
    this.keyWord = '';
    this.onEnterSearch();
  }
}
