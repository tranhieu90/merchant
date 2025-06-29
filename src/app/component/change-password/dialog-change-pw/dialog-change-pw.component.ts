import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Button } from 'primeng/button';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../base/shared/material.module';
import { InputCommon } from '../../../common/directives/input.directive';
import { InputTextModule } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { USER_ENDPOINT } from '../../../common/enum/EApiUrl';
import { ToastService } from '../../../common/service/toast/toast.service';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { Router } from '@angular/router';
import { NavigationService } from '../../../base/utils/NavigationService';
import { IdleService } from '../../../common/service/idle/idle.service';
import { environment } from '../../../../environments/environment';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';

@Component({
  selector: 'app-dialog-change-pw',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    MaterialModule,
    InputCommon,
    InputTextModule,
    ShowClearOnFocusDirective
  ],
  templateUrl: './dialog-change-pw.component.html',
  styleUrl: './dialog-change-pw.component.scss'
})
export class DialogChangePwComponent implements OnInit {
  formChangePw!: FormGroup;
  title!: string;
  isValidPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  passwordCriteria = {
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  };
  userInfo: any;
  isCurrentPw: boolean = false;
  isNewPw: boolean = false;
  isConfirmPassword: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogChangePwComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    private dialogCommon: DialogCommonService,
    private auth: AuthenticationService,
    private router: Router,
    private navigate: NavigationService,
    private idleService: IdleService,
  ) {
  }

  ngOnInit() {
    this.userInfo = this.auth.getUserInfo();
    this.formChangePw = this.fb.group({
      currentPw: ['', Validators.required],
      newPw: ['', [Validators.required]],
      confirmPw: [{ value: '', disabled: true }, Validators.required],
    },
      { validator: this.passwordsMatchValidator }
    )
    this.formChangePw.get('newPw')?.valueChanges.subscribe(value => {
      this.checkPassword(value);
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  clearValue(nameInput: string) {
    this.formChangePw.get(nameInput)?.setValue('');
  }

  checkPassword(password: string) {
    this.passwordCriteria.length = password.length >= 8 && password.length <= 50;
    this.passwordCriteria.uppercase = /[A-Z]/.test(password);
    this.passwordCriteria.number = /\d/.test(password);
    this.passwordCriteria.specialChar = /[\W_]/.test(password);
    this.isValidPassword = this.passwordCriteria.length && this.passwordCriteria.uppercase && this.passwordCriteria.number && this.passwordCriteria.specialChar;
    if (this.isValidPassword) {
      this.formChangePw.get('confirmPw')?.enable();
    }
    else {
      this.formChangePw.get('confirmPw')?.disable();
    }
  }

  passwordsMatchValidator(form: AbstractControl) {
    const newPw = form.get('newPw')?.value;
    const confirmPw = form.get('confirmPw')?.value;

    if (newPw && confirmPw && newPw !== confirmPw) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  onChangePw() {
    let params: any = this.formChangePw.getRawValue();

    this.api.postEncrypted(USER_ENDPOINT.CHANGE_NEW_PW, params).subscribe(() => {
      this.onClose();
      this.router.navigate(['/login']);
      localStorage.removeItem(environment.accessToken);
      localStorage.removeItem(environment.refeshToken);
      localStorage.removeItem(environment.userInfo);
      localStorage.removeItem(environment.settingPayment);
      localStorage.removeItem(environment.settingCashback);
      this.toast.showSuccess("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.")
      this.idleService.stopIdleWatching();
    }, (error) => {
      const errorData = error?.error || {};
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      switch (errorData.soaErrorCode) {
        case 'CPW_ERROR_003':
          this.formChangePw.get('currentPw')!.setErrors({ passwordFail: true });
          break;
        case 'CPW_ERROR_004':
          this.formChangePw.get('newPw')!.setErrors({ newPassFail: true });
          break;
        case 'CPW_ERROR_005':
          this.onClose();
          this.router.navigate(['/login']);
          this.idleService.stopIdleWatching();
          dataDialog.title = 'Nhập sai mật khẩu quá nhiều lần';
          dataDialog.message = 'Vui lòng đăng nhập để xác minh lại tài khoản';
          dataDialog.buttonLabel = 'Tôi đã hiểu';
          dataDialog.icon = 'icon-lock';
          dataDialog.iconColor = 'warning';
          dataDialog.viewCancel = false;
          dataDialog.width = "30%";
          this.dialogCommon.openDialogInfo(dataDialog);
          break;
        default:
          this.toast.showError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    })
  }
}
