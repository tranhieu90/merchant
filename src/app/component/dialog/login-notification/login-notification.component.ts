import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from '../../login/login.component';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MaterialModule } from '../../../base/shared/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { USER_ENDPOINT } from '../../../common/enum/EApiUrl';
import { ToastService } from '../../../common/service/toast/toast.service';
import { UpdateUserComponent } from '../../user-profile/update-user/update-user.component';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { environment } from '../../../../environments/environment';
import { IdleService } from '../../../common/service/idle/idle.service';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { InputCommon } from '../../../common/directives/input.directive';
import { Button } from 'primeng/button';
import { NavigationService } from '../../../base/utils/NavigationService';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';

@Component({
  selector: 'app-login-notification',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    InputTextModule,
    MaterialModule,
    ReactiveFormsModule,
    InputCommon,
    Button,
    ShowClearOnFocusDirective
  ],
  templateUrl: './login-notification.component.html',
  styleUrl: './login-notification.component.scss'
})
export class LoginNotificationComponent implements OnInit {
  formLockAccount!: FormGroup;
  isClose: boolean = true;
  showPassword: boolean = false;
  userInfo: any;

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private idleService: IdleService,
    private dialogCommon: DialogCommonService,
    private navigate: NavigationService,
  ) {
  }

  ngOnInit() {
    if (this.data?.type === 'lock-account') {
      this.formLockAccount = this.fb.group({
        password: ['', Validators.required]
      });
    }
  }

  onClickLock(val: any) {
    if (val == 'logout') {
      let token: any = localStorage.getItem(environment.accessToken);
      let deviceId: any = localStorage.getItem('deviceId');
      let dataReq = {
        token: token,
        deviceId: deviceId ? deviceId : null,
      }
      this.api.post(USER_ENDPOINT.LOGOUT, dataReq).subscribe(
        (res) => {
          localStorage.removeItem(environment.accessToken);
          localStorage.removeItem(environment.refeshToken);
          localStorage.removeItem(environment.userInfo);
          localStorage.removeItem(environment.settingPayment);
          localStorage.removeItem(environment.settingCashback);
          sessionStorage.removeItem('verify');
          this.navigate.navigateAndBlockBack(['/login']);
          this.idleService.stopIdleWatching();
        }
      );
    }
    this.onClose();
  }

  onClickLeft() {
    this.onClose(false);
  }

  onClickRight(val?: any) {
    if (val === 'email') {
      this.onClose();
      this.dialog.open(UpdateUserComponent, {
        data: {
          title: 'Cập nhật email',
          type: 'email',
          isEmailInfo: true,
        },
        width: '35%',
        disableClose: true,
      })
    } else if (val === 'lock-account') {
      if (this.formLockAccount.invalid) {
        this.formLockAccount.markAllAsTouched();
        return;
      }
      let params: any = this.formLockAccount.getRawValue();
      params['userId'] = this.data['userId'];

      this.api.postEncrypted(USER_ENDPOINT.LOCK_ACCOUNT, params).subscribe(res => {
        this.onClose();
        localStorage.removeItem(environment.accessToken);
        localStorage.removeItem(environment.refeshToken);
        localStorage.removeItem(environment.userInfo);
        sessionStorage.removeItem('verify');
        this.navigate.navigateAndBlockBack(['/login']);
        this.idleService.stopIdleWatching();
        let dataDialog: DialogConfirmModel = new DialogConfirmModel();
        dataDialog.title = 'Tài khoản của bạn đã bị khoá';
        dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được kích hoạt tài khoản.';
        dataDialog.buttonLabel = 'Tôi đã hiểu';
        dataDialog.icon = 'icon-lock';
        dataDialog.iconColor = 'warning';
        dataDialog.viewCancel = false;
        dataDialog.width = "30%";
        this.dialogCommon.openDialogInfo(dataDialog);
      }, (error) => {
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == 'LOCKUSER_ERROR_001') {
          this.formLockAccount.get('password')!.setErrors({ incorrectPassword: true });
        } else if (errorData.soaErrorCode == 'LOCKUSER_ERROR_002') {
          this.onClose();
          this.router.navigate(['/login']);
          this.idleService.stopIdleWatching();
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          dataDialog.title = 'Nhập sai mật khẩu quá nhiều lần';
          dataDialog.message = 'Vui lòng đăng nhập lại để xác minh tài khoản.';
          dataDialog.buttonLabel = 'Tôi đã hiểu';
          dataDialog.icon = 'icon-change_password';
          dataDialog.iconColor = 'warning';
          dataDialog.viewCancel = false;
          dataDialog.width = "30%";
          this.dialogCommon.openDialogInfo(dataDialog);
        }
      })
    } else if (val === 'confirm') {
      this.onClose(true);
    }
  }

  onClose(e?: boolean): void {
    this.dialogRef.close(e);
  }

  clearValue(nameInput: string) {
    this.formLockAccount.get(nameInput)?.setValue('');
  }

  getClassByType(typeClass?: string | undefined) {
    switch (typeClass) {
      case 'success':
        return 'success-icon';
      case 'error':
        return 'error-icon';
      case 'warning':
        return 'warning-icon';
      case 'info':
        return 'info-icon';
      default:
        return '';
    }
  }
}
