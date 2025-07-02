import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MaterialModule } from '../../base/shared/material.module';
import { USER_ENDPOINT } from '../../common/enum/EApiUrl';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../common/service/toast/toast.service';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { InputCommon } from '../../common/directives/input.directive';
import { environment } from '../../../environments/environment';
import { NavigationService } from '../../base/utils/NavigationService';
import { ShowClearOnFocusDirective } from '../../common/directives/showClearOnFocusDirective';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [MaterialModule, FormsModule, InputTextModule, ButtonModule, NgIf, InputCommon,ShowClearOnFocusDirective],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  assetPath = environment.assetPath;
  changePasswordForm!: FormGroup;
  showConfirmPassword: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  isValidPassword: boolean = false
  passwordCriteria = {
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  };
  key: string | null = null;
  constructor(
    private fb: FormBuilder,
    private api: FetchApiService,
    private router: Router,
    private toast: ToastService,
    private auth: AuthenticationService,
    private route: ActivatedRoute,
    private dialogCommon: DialogCommonService,
    private navigate: NavigationService,
  ) {
  }
  ngOnInit(): void {
    this.key = this.route.snapshot.queryParamMap.get('key');
    this.buildForm();
  }


  buildForm() {
    this.changePasswordForm = this.fb.group({
      currentPw: ['', Validators.required],
      newPw: ['', [Validators.required]],
      confirmPassword: [{ value: '', disabled: true }, Validators.required],
    },
      { validator: this.passwordsMatchValidator }
    );

    this.changePasswordForm.get('newPw')?.valueChanges.subscribe(value => {
      this.checkPassword(value);
    });
    if (this.key) {
      this.changePasswordForm.controls['currentPw'].clearValidators();
      this.changePasswordForm.controls['currentPw'].updateValueAndValidity();
    }
  }
  clearValue(nameInput: string) {
    this.changePasswordForm.get(nameInput)?.setValue('');
  }

  checkPassword(password: string) {
    this.passwordCriteria.length = password.length >= 8 && password.length <= 50;
    this.passwordCriteria.uppercase = /[A-Z]/.test(password);
    this.passwordCriteria.number = /\d/.test(password);
    this.passwordCriteria.specialChar = /[\W_]/.test(password);
    this.isValidPassword = this.passwordCriteria.length && this.passwordCriteria.uppercase && this.passwordCriteria.number && this.passwordCriteria.specialChar;

    if (this.isValidPassword) {
      this.changePasswordForm.get('confirmPassword')?.enable();
    } else {
      this.changePasswordForm.get('confirmPassword')?.disable();
    }
  }

  passwordsMatchValidator(form: AbstractControl) {
    const newPw = form.get('newPw')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPw && confirmPassword && newPw !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.key) {
      this.changeForgot();
    } else {
      this.changePassword();
    }
  }

  onChangePassword() {
    this.router.navigate(['/login']);
  }

  changePassword() {
    if (this.changePasswordForm.valid) {
      let dataForm = this.changePasswordForm.value;
      let userInfo = this.auth.getUserInfo();
      let dataReq = { ...dataForm }

      this.api.putEncrypted(USER_ENDPOINT.CHANGE_PASSWORD, dataReq).subscribe(
        (res) => {
          if (res.status == 200 && res.data.isLogout == 1) {
            this.navigate.navigateAndBlockBack(['/login']);
            localStorage.removeItem(environment.accessToken);
            localStorage.removeItem(environment.userInfo);
            this.toast.showSuccess('Đổi mật khẩu thành công.Vui lòng đăng nhập lại.')
          }
        }, (error) => {
          const errorData = error?.error || {};
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          switch (errorData.soaErrorCode) {
            case 'CPW_ERROR_003':
              this.changePasswordForm.get('currentPw')!.setErrors({ passwordFail: true });
              break;
            case 'CPW_ERROR_002':
              dataDialog.title = 'Mật khẩu hiện tại không chính xác';
              dataDialog.message = errorData.soaErrorDesc;
              dataDialog.buttonLabel = 'Thử lại';
              dataDialog.icon = 'icon-change_password';
              dataDialog.iconColor = 'icon warning';
              dataDialog.width = '30%';
              dataDialog.viewCancel = false;
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                }
              });
              break;
            case 'CPW_ERROR_001':
              dataDialog.title = 'Tài khoản bị khóa tạm thời';
              dataDialog.message = errorData.soaErrorDesc;
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.iconColor = 'icon warning';
              dataDialog.width = '30%';
              dataDialog.viewCancel = false;
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
                if (result) {
                  this.navigate.navigateAndBlockBack(['/login']);
                }
              });
              break;
            case 'CPW_ERROR_004':
              this.changePasswordForm.get('newPw')!.setErrors({ newPassFail: true });
              break;
          }
        }
      );
    }
  }

  changeForgot() {
    if (this.changePasswordForm.valid) {
      let dataForm = this.changePasswordForm.value;
      let dataReq = {
        ...dataForm, resetKey: this.key
      }
      this.api.postEncrypted(USER_ENDPOINT.RESET_PASSWORD, dataReq).subscribe(
        (res) => {
          if (res.status == 200) {
            this.navigate.navigateAndBlockBack(['/login']);
            localStorage.removeItem(environment.accessToken);
            localStorage.removeItem(environment.userInfo);
            this.toast.showSuccess('Đổi mật khẩu thành công.Vui lòng đăng nhập lại.')
          }
        }, (error) => {
          const errorData = error?.error || {};
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          switch (errorData.soaErrorCode) {
            case 'FPW_ERROR_002':
              this.changePasswordForm.get('newPw')!.setErrors({ newPassFail: true });
              break;
            case 'INPUT_ERROR_001':
              this.toast.showError(errorData.soaErrorDesc);
              break;
            case 'USER_ERROR_001':
              this.toast.showError(errorData.soaErrorDesc);
              break;
            case 'LOGIN_ERROR_006':
              this.toast.showError(errorData.soaErrorDesc);
              break;
            case 'FPW_ERROR_004':
              dataDialog.title = 'Link quên mật khẩu hết hiệu lực';
              dataDialog.message = 'Vui lòng gửi lại yêu cầu quên mật khẩu mới';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.iconColor = 'icon warning';
              dataDialog.viewCancel = false;
              dataDialog.width = '30%'
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(res => {
                this.navigate.navigateAndBlockBack(['/login']);
              });
              break;
            case 'FPW_ERROR_005':
              dataDialog.title = 'Link quên mật khẩu không hợp lệ';
              dataDialog.message = 'Vui lòng quay lại màn hình đăng nhập để thao tác thiết lập mật khẩu mới';
              dataDialog.buttonLabel = 'Tôi đã hiểu';
              dataDialog.icon = 'icon-lock';
              dataDialog.iconColor = 'icon warning';
              dataDialog.viewCancel = false;
              dataDialog.width = '30%'
              this.dialogCommon.openDialogInfo(dataDialog).subscribe(res => {
                this.navigate.navigateAndBlockBack(['/login']);
              });
              break;
          }
        }
      );
    }

  }
}
