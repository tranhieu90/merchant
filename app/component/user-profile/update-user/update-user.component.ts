import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { NgIf } from '@angular/common';
import { REGEX_PATTERN } from '../../../common/enum/RegexPattern';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { USER_ENDPOINT } from '../../../common/enum/EApiUrl';
import moment from "moment";
import { ToastService } from '../../../common/service/toast/toast.service';
import { LoginNotificationComponent } from '../../dialog/login-notification/login-notification.component';
import { InputCommon } from '../../../common/directives/input.directive';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { environment } from '../../../../environments/environment';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    Button,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    NgIf,
    InputCommon,
    InputSanitizeDirective,
    ShowClearOnFocusDirective
  ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.scss'
})
export class UpdateUserComponent implements OnInit {
  formUser!: FormGroup;
  formEmail!: FormGroup;
  title!: string;
  isUserInfo: boolean = false;//Show update user
  isEmailInfo: boolean = false;//Show update email
  isDisable: boolean = true;
  userId!: string;
  maxDate: Date = new Date();
  constructor(
    public dialogRef: MatDialogRef<UpdateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    private dialog: MatDialog,
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService
  ) {
  }

  ngOnInit(): void {
    this.userId = this.auth.getUserInfo()?.id;
    this.isUserInfo = this.data['isUserInfo'];
    this.isEmailInfo = this.data['isEmailInfo'];
    if (this.isEmailInfo) {
      this.isDisable = false;
    }
    this.buildForm();
    if (this.data) {
      this.defaultDataDetail(this.data.dataInfo)
    }

  }

  buildForm() {
    this.formUser = this.fb.group({
      userName: ['', [Validators.required]],
      fullName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(REGEX_PATTERN.SPECIAL_CHARACTERS)]],
      dateOfBirth: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(REGEX_PATTERN.PHONE)]],
    })
    this.formEmail = this.fb.group({
      email: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(REGEX_PATTERN.EMAIL)]],
    })
  }

  defaultDataDetail(value: any) {
    this.formUser.patchValue({
      userName: value.userName,
      fullName: value.fullName,
      dateOfBirth: value.dateOfBirth ? moment(value.dateOfBirth).startOf('day').toDate() : null,
      phoneNumber: value.phoneNumber,
    })
    this.formUser.controls["userName"].disable();
  }

  clearValue(nameInput: string) {
    this.formUser.get(nameInput)?.setValue('');
    this.formEmail.get(nameInput)?.setValue('');
  }

  onClose() {
    this.dialogRef.close();
  }

  onUpdate(val?: string) {
    if (val === 'user') {
      if (this.formUser.invalid) {
        this.formUser.markAllAsTouched();
        return;
      }
      let params: any = this.formUser.getRawValue();

      this.api.put(USER_ENDPOINT.UPDATE, params).subscribe(res => {
        this.toast.showSuccess("Cập nhật thông tin tài khoản thành công")
        this.dialogRef.close(true);
      }, (error) => {
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == 'UPDATE_USER_ERROR_001') {
          this.formUser.get('phoneNumber')!.setErrors({ isPhoneNumberUsed: true });
        }
        if (errorData.soaErrorCode == '203') {
          this.toast.showError(errorData.soaErrorDesc);
        }
      })
    } else {
      this.handleDevelopAfter()
      return;
      if (this.formEmail.valid) {
        let params: any = {}
        params['emailChange'] = this.formEmail.get('email')?.value;
        params['userId'] = this.userId;

        this.api.put(USER_ENDPOINT.UPDATE_MAIL, params).subscribe(res => {
          if (res && res.data.isVerify === 0) {
            this.toast.showSuccess("Cập nhật email thành công", 'Vui lòng kiểm tra email và làm theo hướng dẫn để xác thực tài khoản.')
            let userInfo = this.auth.getUserInfo();
            if (userInfo) {
              userInfo.emailChange = this.formEmail.get('email')?.value;
            }
            localStorage.setItem(environment.userInfo, JSON.stringify(userInfo));
            this.dialogRef.close(true);

          } else {
            this.dialogRef.close(false);
            const dialogRef = this.dialog.open(LoginNotificationComponent, {
              panelClass: 'dialog-login-noti',
              data: {
                title: 'Thay đổi email',
                message: 'Hệ thống đã gửi liên kết xác thực qua email mới, yêu cầu thay đổi sẽ có hiệu lực khi bạn kiểm tra hộp thư và xác thực tài khoản.',
                lockText: 'Tôi đã hiểu',
                icon: 'icon-mail',
                typeClass: 'info',
                type: 'confirm',
                accountLock: true,
              },
              width: '30%',
              disableClose: true,
            })
            dialogRef.afterClosed().subscribe((result) => {
              window.location.reload();
            })
          }
        }, (error) => {
          const errorData = error?.error || {};
          if (errorData.soaErrorCode == 'UPDATE_EMAIL_ERROR_001') {
            this.formEmail.get('email')!.setErrors({ isEmailUsed: true });
          }
        })
      }
    }
  }

  sanitizePhoneNumber(): void {
    const control = this.formUser.get('phoneNumber');
    if (!control) return;

    const rawValue = control.value || '';

    // Giữ lại duy nhất các số và dấu +
    const sanitizedValue = rawValue.replace(/[^0-9+]/g, '').trim();

    if (sanitizedValue !== rawValue) {
      control.setValue(sanitizedValue, { emitEvent: false });
    }
  }

  handleDevelopAfter() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Lỗi tính năng';
    dataDialog.message = 'Tính năng đang trong giai đoạn phát triển.';
    dataDialog.buttonLabel = 'Thử lại';
    dataDialog.icon = 'icon-warning';
    dataDialog.width = '500px'
    dataDialog.iconColor = 'icon warning';
    dataDialog.viewCancel = false;
    dataDialog.buttonLabel = 'Tôi đã hiểu'
    this.dialogCommon.openDialogInfo(dataDialog)
  }
}
