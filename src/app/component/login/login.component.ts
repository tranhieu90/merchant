import { NgIf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import CryptoJS from 'crypto-js';
import { jwtDecode } from "jwt-decode";
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MaterialModule } from '../../base/shared/material.module';
import { LOGIN_ENDPOINT, USER_ENDPOINT } from '../../common/enum/EApiUrl';
import { REGEX_PATTERN } from '../../common/enum/RegexPattern';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { FormErrorService } from '../../common/service/form-error/form-error.service';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';
import { IdleService } from '../../common/service/idle/idle.service';
import { InputCommon } from '../../common/directives/input.directive';
import { environment } from "../../../environments/environment";
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../common/service/toast/toast.service';
import { DialogChangePwComponent } from '../change-password/dialog-change-pw/dialog-change-pw.component';
import { NavigationService } from '../../base/utils/NavigationService';
import { ShowClearOnFocusDirective } from '../../common/directives/showClearOnFocusDirective';

@Component({
  selector: 'login',
  standalone: true,
  imports: [MaterialModule, ButtonModule, InputTextModule, FormsModule, TooltipModule, NgIf, CheckboxModule, InputCommon, ShowClearOnFocusDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  assetPath = environment.assetPath;
  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  showPassword: boolean = false;
  isForgotPassword: boolean = false;
  isVerify: boolean = false;
  titleHeaderLogin: string = 'Chào mừng bạn tới MB MerchantX';
  titleTextLogin: string = 'Nền tảng cung cấp giải pháp thanh toán dành cho doanh nghiệp.'
  titleHeaderForgot: string = 'Quên mật khẩu';
  titleTextForgot: string = 'Vui lòng nhập thông tin để đặt lại mật khẩu.'
  titleHeaderVerify: string = 'Xác thực tài khoản';
  titleTextVerify: string = 'Vui lòng đăng nhập để hoàn tất xác thực tài khoản.';
  titleMail!: string;
  titleTextMail !: string;
  isFormMail: boolean = false;
  secretKey = 'merchantX@2025@#';
  urlVerifyEmail: string = 'login'
  @ViewChild('usernameInput') usernameInput!: ElementRef;
  constructor(
    private fb: FormBuilder,
    private api: FetchApiService,
    private router: Router,
    private auth: AuthenticationService,
    private formError: FormErrorService,
    private dialogCommon: DialogCommonService,
    private routerActivate: ActivatedRoute,
    private idleService: IdleService,
    private dialog: MatDialog,
    private toast: ToastService,
    private navigate: NavigationService,
  ) {
    if (sessionStorage.getItem("verify")) {
      this.isVerify = true;
      this.urlVerifyEmail = sessionStorage.getItem("verify") || '';

    }
  }

  isUsernameFocusedLogin = false;
  isPasswordFocused = false;
  isUsernameFocusedForgot = false;
  isEmail = false;

  ngOnInit(): void {
    this.buildForm();
    this.forgotPasswordForm.get('username')?.valueChanges.subscribe(() => {
      const emailControl = this.forgotPasswordForm.get('email');
      if (emailControl?.errors?.['valueFail']) {
        emailControl?.setErrors(null);
      }
    });

    this.loginForm.get('username')?.valueChanges.subscribe(() => {
      const passwordControl = this.loginForm.get('password');
      if (passwordControl?.errors?.['passwordFail']) {
        passwordControl?.setErrors(null);
      }
    });

    setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    });
  }

  buildForm() {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern(REGEX_PATTERN.USER_NAME),
      ]],
      password: ['', Validators.required],
      remember: [false]
    });

    this.forgotPasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(REGEX_PATTERN.USER_NAME)]],
      email: ['', [Validators.required, Validators.pattern(REGEX_PATTERN.EMAIL)]],
    });


    let userSave = localStorage.getItem('userName');
    let password = localStorage.getItem('password');
    if (userSave && password) {
      this.loginForm.patchValue({
        username: userSave,
        password: this.decryptPassword(password),
        remember: true
      });
    }
  }

  encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, this.secretKey).toString();
  }

  decryptPassword(encryptedPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    let params = this.loginForm.value;
    this.api.postEncrypted(LOGIN_ENDPOINT.LOGIN, params).subscribe(
      (res) => {
        if (params["remember"]) {
          localStorage.setItem('userName', params["username"]);
          localStorage.setItem('password', this.encryptPassword(params["password"]));
        } else {
          localStorage.removeItem('userName');
          localStorage.removeItem('password');
        }
        const decoded: any = jwtDecode(res.access_token);
        let userInfor = JSON.parse(decoded.sub);
        if (userInfor["expChangePass"] == 0) {
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          dataDialog.title = 'Mật khẩu đã hết hạn';
          dataDialog.message = 'Mật khẩu của bạn đã hết hạn. Vui lòng đổi mật khẩu mới để tiếp tục.';
          dataDialog.buttonLabel = 'Đổi mật khẩu';
          dataDialog.cancelTitle = 'Đóng';
          dataDialog.icon = 'icon-change_password';
          dataDialog.iconColor = 'icon warning';
          dataDialog.width = '30%'
          this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
            if (result) {
              this.auth.authenticate(res);
              this.router.navigate(['/change-password']);
            }
          });
        } else if (userInfor['expChangePass'] && userInfor['expChangePass'] <= 5 && userInfor['expChangePass'] > 0 && userInfor['countLogin'] == 0) {
          let dataDialog: DialogConfirmModel = new DialogConfirmModel();
          dataDialog.title = 'Mật khẩu sắp hết hạn';
          dataDialog.message = 'Mật khẩu của bạn sẽ hết hạn trong ' + userInfor['expChangePass'] + ' ngày tới, vui lòng thay đổi mật khẩu để việc sử dụng tài khoản không bị gián đoạn.';
          dataDialog.buttonLabel = 'Đổi mật khẩu';
          dataDialog.cancelTitle = 'Nhắc lại sau';
          dataDialog.icon = 'icon-change_password';
          dataDialog.iconColor = 'icon warning';
          dataDialog.width = '30%'
          this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
            if (result) {
              this.doChangePassword();
            }
          });
          this.auth.authenticate(res);
        } else {
          this.auth.authenticate(res);
        }

        if (this.urlVerifyEmail !== 'login') {
          //call api check verify
          this.doVerify();
        }
        this.idleService.startIdleWatching();
      }, (error) => {
        const errorData = error?.error || {};
        let dataDialog: DialogConfirmModel = new DialogConfirmModel();
        switch (errorData.soaErrorCode) {
          case 'LOGIN_ERROR_002':
            this.loginForm.get('password')!.setErrors({ passwordFail: true });
            this.loginForm.markAllAsTouched();
            return;
          case 'LOGIN_ERROR_003':
            this.formError.removeErrors(this.loginForm, ['password'], ['passwordFail']);
            dataDialog.title = 'Thông tin đăng nhập không chính xác';
            dataDialog.message = 'Bạn đã nhập sai mật khẩu ' + errorData.data + ' lần. Tài khoản của bạn sẽ bị khoá nếu nhập sai thông tin quá 5 lần. Vui lòng kiểm tra lại.';
            dataDialog.buttonLabel = 'Thử lại';
            dataDialog.icon = 'icon-change_password';
            break;
          case 'LOGIN_ERROR_001':
            this.formError.removeErrors(this.loginForm, ['password'], ['passwordFail']);
            dataDialog.title = 'Tài khoản bị khoá tạm thời';
            dataDialog.message = 'Tài khoản của bạn tạm thời không thể đăng nhập do nhập sai thông tin quá số lần quy định. Vui lòng thử lại sau 15 phút.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-lock';
            break;
          case 'LOGIN_ERROR_006':
            dataDialog.title = 'Tài khoản đang bị khoá';
            dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-lock';
            dataDialog.width = '25%'
            break;
          default:
            dataDialog.title = 'Đăng nhập không thành công';
            dataDialog.message = 'Vui lòng thử lại.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-warning';
            dataDialog.width = '25%'
          // case 'LOGIN_ERROR_009':
          //   dataDialog.title = 'Merchant mất kết nối';
          //   dataDialog.message = 'Merchant mất kết nối sử dụng dịch vụ, vui lòng liên hệ quản trị viên để được hỗ trợ.';
          //   dataDialog.buttonLabel = 'Tôi đã hiểu';
          //   dataDialog.icon = 'icon-lock';
          //   dataDialog.width = '25%'
          //   break;
        }
        dataDialog.viewCancel = false;
        dataDialog.iconColor = 'icon warning';
        this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
          if (result) {
          }
        });
      });
  }

  clearValue(nameInput: string) {
    this.loginForm.get(nameInput)?.setValue('');
  }

  clearValue1(nameInput: string) {
    this.forgotPasswordForm.get(nameInput)?.setValue('');
  }

  onChangePassword() {
    this.router.navigate(['/change-password']);
  }

  onChangeLogin() {
    this.isForgotPassword = false;
    this.isFormMail = false;
    this.forgotPasswordForm.reset();
    // this.buildForm();
  }

  resetPassword() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    let dataReq = this.forgotPasswordForm.value;
    this.api.post(USER_ENDPOINT.FORGET_PASSWORD, dataReq).subscribe(
      (res) => {
        if (res.status == 200) {
          this.isFormMail = true;
          this.titleMail = "Liên kết đặt lại mật khẩu đã được gửi";
          this.titleTextMail = `Liên kết đặt lại mật khẩu đã được gửi đến mail<br> <strong> ${dataReq.email}</strong> <br> Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.`
        }
      }, (error) => {
        const errorData = error?.error || {};
        let dataDialog: DialogConfirmModel = new DialogConfirmModel();
        switch (errorData.soaErrorCode) {
          case 'FPW_ERROR_001':
            this.forgotPasswordForm.get('email')!.setErrors({ valueFail: true });
            this.forgotPasswordForm.markAllAsTouched();
            break;
          case 'FPW_ERROR_002':
            this.forgotPasswordForm.get('email')!.setErrors({ valueFail: true });
            this.forgotPasswordForm.markAllAsTouched();
            break;
          case 'FPW_ERROR_003':
            dataDialog.title = 'Bạn đã nhập sai thông tin nhiều lần';
            dataDialog.message = 'Vui lòng liên hệ quản lý Merchant có quyền để được hỗ trợ cấp lại mật khẩu.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-lock';
            dataDialog.iconColor = 'icon warning';
            dataDialog.viewCancel = false;
            dataDialog.width = '30%'
            this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
              if (result) {
                this.onChangeLogin();
              }
            })
            break;
          case 'ACCOUNT_ERROR_002':
            dataDialog.title = 'Email chưa xác thực không đủ bảo mật để lấy mật khẩu';
            dataDialog.message = 'Vui lòng liên hệ quản lý có quyền để được hỗ trợ cấp lại mật khẩu.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-lock';
            dataDialog.iconColor = 'icon warning';
            dataDialog.viewCancel = false;
            dataDialog.width = '30%'
            this.dialogCommon.openDialogInfo(dataDialog);
            break;
          case 'LOGIN_ERROR_006':
            dataDialog.title = 'Tài khoản đang bị khoá';
            dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-lock';
            dataDialog.iconColor = 'icon warning';
            dataDialog.viewCancel = false;
            dataDialog.width = '30%'
            this.dialogCommon.openDialogInfo(dataDialog);
            break;
        }
      })
  }

  doVerify() {
    this.api.post(this.urlVerifyEmail).subscribe(() => {
      this.toast.showSuccess("Xác thực tài khoản thành công");
      this.removeVerify();
      this.router.navigate(['/login']);
    }, (error) => {
      this.router.navigate(['/profile']);
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
        dataDialog.width = "25%";
        this.dialogCommon.openDialogInfo(dataDialog);
      } else {
        this.toast.showError("Thông tin xác thực không hợp lệ. ");
      }
    })
  }

  doChangePassword() {
    const dialogRef = this.dialog.open(DialogChangePwComponent, {
      width: '600px',
      panelClass: 'dialog-change-pw',
      data: {
        title: 'Đổi mật khẩu mới',
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (!result) {
        this.logout();
      }
    })
  }

  logout() {
    let token: any = localStorage.getItem(environment.accessToken);
    let deviceId: any = localStorage.getItem('deviceId');
    let dataReq = {
      token: token,
      deviceId: deviceId ? deviceId : null,
    }
    this.api.post(USER_ENDPOINT.LOGOUT, dataReq).subscribe(
      (res) => {
        if (res.status === 200) {
          localStorage.removeItem(environment.accessToken);
          localStorage.removeItem(environment.userInfo);
          sessionStorage.removeItem('verify');
          this.navigate.navigateAndBlockBack(['/login']);
          this.idleService.stopIdleWatching();
        }
      }
    );
  }

  removeVerify() {
    this.isVerify = false;
    this.urlVerifyEmail = 'login';
    sessionStorage.removeItem('verify');
  }
}
