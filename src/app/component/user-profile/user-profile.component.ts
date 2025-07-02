import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { MenuItem } from "primeng/api";
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from "primeng/menu";
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { environment } from '../../../environments/environment';
import { CommonUtils } from '../../base/utils/CommonUtils';
import { NavigationService } from '../../base/utils/NavigationService';
import { USER_ENDPOINT } from '../../common/enum/EApiUrl';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { IdleService } from '../../common/service/idle/idle.service';
import { ToastService } from '../../common/service/toast/toast.service';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { LoginNotificationComponent } from '../dialog/login-notification/login-notification.component';
import { UpdateAvatarComponent } from './update-avatar/update-avatar.component';
import { UpdateUserComponent } from './update-user/update-user.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    InputTextModule,
    PaginatorModule,
    NgIf,
    ReactiveFormsModule,
    Button,
    TableModule,
    MenuModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  assetPath = environment.assetPath;
  userForm!: FormGroup;
  dataInfo: any;
  isVerifiedEmail: boolean = false;//User có email đã xác thực
  isUnverifiedEmail: boolean = false;//User có email chưa xác thực
  isPendingEmailVerification: boolean = false;//User có email đã xác thực nhưng yêu cầu thay đổi email mới và chưa xác thực
  isExpire: number = 0;//Hạn link xác thực
  historyLst = [];
  userInfo: any;
  items: MenuItem[] | undefined;
  isShow: boolean = true;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private routeActive: ActivatedRoute,
    private api: FetchApiService,
    private auth: AuthenticationService,
    private toast: ToastService,
    private dialogCommon: DialogCommonService,
    private router: Router,
    private navigate: NavigationService,
    private idleService: IdleService,
  ) {
    this.doVerifyMail();
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.userInfo = this.auth.getUserInfo();
    if (this.userInfo) {
      this.getInfoProfile();
    }

    this.items = [
      {
        label: 'Khóa Tài Khoản',
        icon: 'icon-default',
        command: () => this.onLockAccount()
      },
    ];
  }

  getInfoProfile() {
    this.api.get(USER_ENDPOINT.USER_INFO).subscribe(res => {
      this.dataInfo = res['data'];
      // set emailChange
      let storedUserInfo = localStorage.getItem(environment.userInfo);
      let userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : this.userInfo;
      userInfo['emailChange'] = this.dataInfo['emailChange'];
      this.auth.updateUserInfo(this.dataInfo)
      this.checkCaseUser();
    });
  }

  doVerifyMail() {
    this.routeActive.queryParams.subscribe(params => {
      if (params['key']) {
        //goi api xac thuc
        this.api.post(USER_ENDPOINT.VERIFY_MAIL, {}, { verifyKey: params['key'] }).subscribe(() => {
          this.toast.showSuccess("Xác thực tài khoản thành công");
          this.navigate.navigateAndBlockBack(['/login']);
          sessionStorage.removeItem('verify');
        }, (error) => {
          const errorData = error?.error || {};
          if (errorData.soaErrorCode === 'AUTH_ERROR_005') {
            let dataDialog: DialogConfirmModel = new DialogConfirmModel();
            dataDialog.title = 'Liên kết xác thực đã hết hiệu lực';
            dataDialog.message = 'Vui lòng truy cập vào Hồ sơ người dùng để nhận liên kết xác thực mới.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-warning_solid';
            dataDialog.viewCancel = false;
            dataDialog.iconColor = 'icon warning';
            dataDialog.width = "30%";
            this.dialogCommon.openDialogInfo(dataDialog);
          } else if (errorData.soaErrorCode === 'AUTH_ERROR_004') {
            let dataDialog: DialogConfirmModel = new DialogConfirmModel();
            dataDialog.title = 'Tài khoản đã được xác thực';
            dataDialog.message = 'Vui lòng tiếp tục sử dụng hệ thống.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-information';
            dataDialog.viewCancel = false;
            dataDialog.iconColor = 'icon info';
            dataDialog.width = "30%";
            this.dialogCommon.openDialogInfo(dataDialog);
          } else if (errorData.soaErrorCode === 'AUTH_ERROR_007') {
            this.dialog.open(LoginNotificationComponent, {
              panelClass: 'dialog-login-noti',
              data: {
                title: 'Email không hợp lệ',
                message: 'Vui lòng thay đổi email để xác thực',
                icon: 'icon-mail',
                typeClass: 'info',
                expired: true,
                textLeft: 'Hủy',
                type: 'email',
                textRight: 'Thay đổi email',
                isEmailInfo: true
              },
              width: '30%',
              disableClose: true,
            })
          } else if (errorData.soaErrorCode === 'AUTH_ERROR_006') {
            this.toast.showError("Thông tin xác thực không hợp lệ.");
          }
        })
        this.router.navigate([], {
          relativeTo: this.routeActive,
          queryParams: {},
          replaceUrl: true
        });
      }
    })
  }

  checkCaseUser() {
    this.isVerifiedEmail = this.dataInfo?.email && this.dataInfo?.isVerify == 1;
    this.isUnverifiedEmail = this.dataInfo?.emailChange && this.dataInfo?.isVerify == 0;
    this.isPendingEmailVerification = this.dataInfo?.email && this.dataInfo?.isVerify == 1 && this.dataInfo?.emailChange
    this.isExpire = this.dataInfo?.isExpire
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return moment(date).isValid() ? moment(date).format('DD/MM/YYYY') : '';
  }

  updateAvatar() {
    const dialogRef = this.dialog.open(UpdateAvatarComponent, {
      panelClass: 'dialog-update-avatar',
      width: '600px',
      disableClose: true,
      data: this.dataInfo.avatar
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getInfoProfile();
      }
    })
  }

  updateUser() {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '600px',
      panelClass: 'dialog-update-user',
      data: {
        title: 'Cập nhật thông tin tài khoản',
        type: 'user',
        dataInfo: this.dataInfo,
        isUserInfo: true,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getInfoProfile();
      }
    })
  }

  updateEmail() {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '600px',
      panelClass: 'dialog-update-user',
      data: {
        title: 'Cập nhật email',
        type: 'email',
        dataInfo: this.dataInfo,
        isEmailInfo: true,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getInfoProfile();
      }
    })
  }

  onLockAccount() {
    this.dialog.open(LoginNotificationComponent, {
      panelClass: 'dialog-login-noti',
      data: {
        title: 'Tài khoản của bạn sẽ bị khoá',
        message: 'Khi muốn truy cập lại hệ thống vui lòng liên hệ Quản trị viên để kích hoạt lại tài khoản.',
        textLeft: 'Hủy',
        textRight: 'Xác nhận',
        icon: 'icon-lock',
        typeClass: 'warning',
        type: 'lock-account',
        expired: true,
        userId: this.dataInfo['userId'],
      },
      width: '35%',
      disableClose: true,
    })
  }

  verifyEmail() {
    this.api.post(USER_ENDPOINT.SEND_VERIFY_MAIL).subscribe(res => {
      let content = `Chúng tôi vừa gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(this.dataInfo?.emailChange)}</b>, vui lòng kiểm tra email và làm theo hướng dẫn để hoàn tất xác thực tài khoản.`
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Hệ thống đã gửi liên kết xác thực';
      dataDialog.message = content;
      dataDialog.buttonLabel = 'Tôi đã hiểu';
      dataDialog.icon = 'icon-mail';
      dataDialog.iconColor = 'icon info';
      dataDialog.viewCancel = false;
      this.dialogCommon.openDialogInfo(dataDialog);
    }, (error) => {
      const errorData = error?.error || {};
      if (errorData.soaErrorCode == 'AUTH_ERROR_007') {
        this.dialog.open(LoginNotificationComponent, {
          panelClass: 'dialog-login-noti',
          data: {
            title: 'Email đã được xác thực bởi tài khoản khác',
            message: 'Vui lòng thay đổi email để xác thực tài khoản.',
            icon: 'icon-mail',
            typeClass: 'warning',
            expired: true,
            textLeft: 'Hủy',
            type: 'email',
            textRight: 'Thay đổi email',
            isEmailInfo: true
          },
          width: '30%',
          disableClose: true,
        })
      }
    })
  }
}
