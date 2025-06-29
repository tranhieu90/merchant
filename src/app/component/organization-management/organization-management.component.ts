import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import _ from 'lodash';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../common/service/toast/toast.service';
import { DialogRoleComponent, DialogRoleModel } from '../role-management/dialog-role/dialog-role.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { UserVerifyStatus } from '../../common/constants/CUser';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { CreateOrganizationComponent } from './create-organization/create-organization.component';
import { UpdateOrganizationComponent } from './update-organization/update-organization.component';
import { ORGANIZATION_ENDPOINT, USER_ENDPOINT } from '../../common/enum/EApiUrl';
import { environment } from '../../../environments/environment';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { CommonUtils } from '../../base/utils/CommonUtils';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { UpdateUserComponent } from '../user-profile/update-user/update-user.component';
import { MERCHANT_RULES } from '../../base/constants/authority.constants';

@Component({
  selector: 'app-organization-management',
  standalone: true,
  imports: [ButtonModule, InputTextModule, NgIf, CreateOrganizationComponent, UpdateOrganizationComponent],
  templateUrl: './organization-management.component.html',
  styleUrl: './organization-management.component.scss'
})

export class OrganizationManagementComponent {
  private MERCHANT_RULES = MERCHANT_RULES;
  assetPath = environment.assetPath;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isPermission: boolean = true;
  lstAreas: any = [];
  isAccountNotVerified: boolean = false;
  merchantName: string = '';
  hasRole?: boolean;

  constructor(
    private dialog: MatDialog,
    private toast: ToastService,
    private router: Router,
    private auth: AuthenticationService,
    private api: FetchApiService,
    private dialogCommon: DialogCommonService,
  ) {
  }

  ngOnInit() {
    let userInfo = localStorage.getItem(environment.userInfo);
    this.hasRole = this.auth.apiTracker([MERCHANT_RULES.ORGANIZATION_CREATE]);
    if (userInfo) {
      this.merchantName = JSON.parse(userInfo)["merchantName"];
    }
    this.getLstAreas();
  }

  getLstAreas() {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.isUpdate = true;
          this.lstAreas = res.data;
        }
      }, (error: any) => {
        const errorData = error?.error || {};
        switch (errorData.soaErrorCode) {
          case 'ACCOUNT_ERROR_001':
            this.openDialogUnverifiedAccountNoEmail();
            this.isAccountNotVerified = true;
            break;
          case 'ACCOUNT_ERROR_002':
            this.openDialogUnverifiedAccountHasEmail();
            this.isAccountNotVerified = true;
            break;
          case 'GROUP_ERROR_019':
            break;
          default:
            if (errorData?.soaErrorCode !== 'GROUP_ERROR_007') {
              this.toast.showError(errorData?.soaErrorDesc);
            }
        }
      });
  }

  doCancelCreate() {
    this.isCreate = false;
  }

  doCreateSuccess() {
    this.isCreate = false;
    this.isUpdate = true;
    this.getLstAreas();
  }

  doCreateOrg() {
    const verifyUser = this.auth.checkVerifyUserInfo();
    switch (verifyUser) {
      case UserVerifyStatus.VERIFIED:
        this.isCreate = true;
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.verifyEmail();
      } else {
        this.updateEmail();
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.router.navigate(['/profile']);
      }
    })
  }

  verifyEmail() {
    this.api.post(USER_ENDPOINT.SEND_VERIFY_MAIL).subscribe((res: any) => {
      let content = `Chúng tôi vừa gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(this.auth?.getUserInfo()?.emailChange)}</b>, vui lòng kiểm tra email và làm theo hướng dẫn để hoàn tất xác thực tài khoản.`
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Hệ thống đã gửi liên kết xác thực';
      dataDialog.message = content;
      dataDialog.buttonLabel = 'Tôi đã hiểu';
      dataDialog.icon = 'icon-mail';
      dataDialog.iconColor = 'icon info';
      dataDialog.viewCancel = false;
      const dialogRef = this.dialogCommon.openDialogInfo(dataDialog);
      dialogRef.subscribe((res: any) => {
        this.router.navigate(['/profile']);
      })
    }, (error: any) => {
      const errorData = error?.error || {};
      this.toast.showError(errorData?.soaErrorDesc);
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
}
