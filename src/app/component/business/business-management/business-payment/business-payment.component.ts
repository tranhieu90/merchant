import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { environment } from '../../../../../environments/environment';
import { DialogConfirmModel } from '../../../../model/DialogConfirmModel';
import { DialogCommonService } from '../../../../common/service/dialog-common/dialog-common.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { clone } from 'lodash';
import { isEqual } from 'lodash';
import { FetchApiService } from '../../../../common/service/api/fetch-api.service';
import { ToastService } from '../../../../common/service/toast/toast.service';
import { BUSINESS_ENDPOINT, USER_ENDPOINT } from '../../../../common/enum/EApiUrl';
import { CommonUtils } from '../../../../base/utils/CommonUtils';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { distinctUntilChanged } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode'
import { ShowClearOnFocusDirective } from '../../../../common/directives/showClearOnFocusDirective';
import { REGEX_PATTERN } from '../../../../common/enum/RegexPattern';
import { InputCommon } from '../../../../common/directives/input.directive';
import { InputSanitizeDirective } from '../../../../common/directives/inputSanitize.directive';
import { DialogRoleComponent, DialogRoleModel } from '../../../role-management/dialog-role/dialog-role.component';
import { AuthenticationService } from '../../../../common/service/auth/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserComponent } from '../../../user-profile/update-user/update-user.component';

@Component({
  selector: 'app-business-payment',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, InputSwitchModule, RadioButtonModule, CommonModule, InputCommon, InputSanitizeDirective,ShowClearOnFocusDirective],
  templateUrl: './business-payment.component.html',
  styleUrl: './business-payment.component.scss',
  animations: [
    trigger('accordion', [
      state('collapsed', style({
        height: '0px',
        opacity: 0,
        padding: '0'
      })),
      state('expanded', style({
        height: '*',
        opacity: 1,
        padding: '*'
      })),
      transition('collapsed <=> expanded', [
        animate('350ms ease-in-out')
      ])
    ])
  ],
})
export class BusinessPaymentComponent implements OnInit {
  assetPath = environment.assetPath;
  merchantId!: number;
  subId!: number;
  ischeck: number = 1
  isPaymentQR: boolean = false;
  isSoftPos: boolean = false;
  isPaymentTHDD: boolean = false;
  paymentQR: any;
  lstPaymentPod: any = [];
  lstPaymentTHDD: any = [];
  isAddPodId: boolean = false;
  isAddTHDDId: boolean = false;
  paymentMethodPodId!: string;
  paymentMethodTHDDId!: string;
  terminalId !: string;
  paymentTypeQr!: number;
  lstPaymentPodClone: any = [];
  lstPaymentTHDDClone: any = [];
  paymentMethodIdDeletePos: any = [];
  paymentMethodIdDeleteTHDD: any = [];
  lstPaymentMethod: any = [];
  paymentQRFormInsert!: FormGroup;
  paymentQRFormUpdate!: FormGroup;
  changedTerminalId = false;
  changedInfoQR = false;
  dataRespone!: any
  lstDuplicatePos: any = [];
  lstDuplicateId: any = [];
  hasQR: boolean = false;
  constructor(
    private fb: FormBuilder,
    private dialogCommon: DialogCommonService,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private dialog: MatDialog,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    const merchantData = state?.['dataInput'];
    if (merchantData) {
      this.merchantId = merchantData.merchantId;
      this.subId = merchantData.subId;
      this.getDataDetail(this.subId);
    }
  }
  ngOnInit(): void {
    this.buildForm();
    this.getLstPaymentMethod();
  }

  buildForm() {
    this.paymentQRFormInsert = this.fb.group({
      terminalId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      accountName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s`~!@#$%^&*()_\-+=\[\]{}\\|;:'",.<>\/?]+$/)]],
    })

    this.paymentQRFormUpdate = this.fb.group({
      terminalId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      initialTerminalId: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      initialAccountNumber: ['',],
      accountName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s`~!@#$%^&*()_\-+=\[\]{}\\|;:'",.<>\/?]+$/)]],
      initialAccountName: ['',],
      paymentType: [''],
    })
    this.setValidatorsByIsCheck(1);
  }
  setValidatorsByIsCheck(ischeck: number) {
    this.ischeck = ischeck;
    if (ischeck == 1) {
      this.paymentQRFormInsert.get('terminalId')?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]);
      this.paymentQRFormInsert.get('accountNumber')?.clearValidators();
      this.paymentQRFormInsert.get('accountName')?.clearValidators();
    } else {
      this.paymentQRFormInsert.get('terminalId')?.clearValidators();
      this.paymentQRFormInsert.get('accountNumber')?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]);
      this.paymentQRFormInsert.get('accountName')?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9\s`~!@#$%^&*()_\-+=\[\]{}\\|;:'",.<>\/?]+$/),
      ]);
    }
    this.paymentQRFormInsert.get('terminalId')?.updateValueAndValidity();
    this.paymentQRFormInsert.get('accountNumber')?.updateValueAndValidity();
    this.paymentQRFormInsert.get('accountName')?.updateValueAndValidity();
  }

  setDataFormUpdate(data: any) {
    if (data) {
      this.paymentQRFormUpdate.setValue({
        terminalId: data.terminalId,
        initialTerminalId: data.terminalId,
        accountNumber: data.accountNumber,
        initialAccountNumber: data.accountNumber,
        accountName: data.accountName,
        initialAccountName: data.accountName,
        paymentType: data.paymentType
      });

      this.paymentQRFormUpdate.get('terminalId')?.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(value => {
          const initial = this.paymentQRFormUpdate.get('initialTerminalId')?.value;
          this.changedTerminalId = value !== initial;
        });

      this.paymentQRFormUpdate.get('accountNumber')?.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => this.checkDisableTerminalId());

      this.paymentQRFormUpdate.get('accountName')?.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => this.checkDisableTerminalId());
    }
  }

  checkDisableTerminalId() {
    const accountNumber = this.paymentQRFormUpdate.get('accountNumber')?.value;
    const initialAccountNumber = this.paymentQRFormUpdate.get('initialAccountNumber')?.value;

    const accountName = this.paymentQRFormUpdate.get('accountName')?.value;
    const initialAccountName = this.paymentQRFormUpdate.get('initialAccountName')?.value;

    this.changedInfoQR = (accountNumber !== initialAccountNumber) || (accountName !== initialAccountName);

    if (this.changedInfoQR) {
      this.paymentQRFormUpdate.get('terminalId')?.disable({ emitEvent: false });
    } else {
      this.paymentQRFormUpdate.get('terminalId')?.enable({ emitEvent: false });
    }
  }

  getLstPaymentMethod() {
    this.api.get(BUSINESS_ENDPOINT.GET_LIST_PAYMENT_METHOD).subscribe(res => {
      if (res['data']) {
        this.lstPaymentMethod = res['data']['paymentMethodList'];
        this.paymentTypeQr = this.lstPaymentMethod.find((item: any) => item.paymentMethodId == 324)?.paymentType;
      }
    }, () => {
      this.lstPaymentMethod = [];
      this.toast.showError('Lấy phương thức thanh toán xảy ra lỗi')
    });
  }


  getDataDetail(subId: number) {
    let param = {
      subId: subId,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api.get(BUSINESS_ENDPOINT.GET_MERCHANT_DETAIL, buildParams).subscribe(res => {
      if (res && res['status'] == 200) {
        let merchantPaymentMethodList = res.data['merchantPaymentMethodList'];
        merchantPaymentMethodList.forEach((item: any) => {
          if (item.methodId == 324) {
            this.hasQR = true;
            this.paymentQR = item.paymentInfo[0];
            this.setDataFormUpdate(this.paymentQR);
            this.paymentQRFormUpdate.enable();
            this.isPaymentQR = true;
          } else if (item.methodId == 333) {
            this.lstPaymentPod = item.paymentInfo;
            this.lstPaymentPodClone = clone(this.lstPaymentPod);
            if (this.lstPaymentPod.length > 0) {
              this.isSoftPos = true;
            }

          } else if (item.methodId == 332) {
            this.lstPaymentTHDD = item.paymentInfo
            this.lstPaymentTHDDClone = clone(this.lstPaymentTHDD);
            if (this.lstPaymentTHDD.length > 0) {
              this.isPaymentTHDD = true;
            }

          }
        }
        )
      }
    }, (error) => {
      this.toast.showError('Xem chi tiết điểm bán xảy ra lỗi');
    });
  }

  setDefaultValue() {
    this.lstPaymentPod = []
    this.lstPaymentPodClone = [];
    this.lstPaymentTHDD = [];
    this.lstPaymentTHDDClone = [];
  }

  checkMethodExists(methodList: any[], methodId: number): boolean {
    return methodList.some(method => method.methodId === methodId);
  }

  findPaymentMethodById(methodId: number, data: any) {
    return data.find((pm: any) => pm.methodId === methodId)?.soaErrorCode;
  }


  deletePayment(item?: any, index?: number, type?: number) {
    if (!this.isSoftPos && type == 1) {
      return;
    }
    if (!this.isPaymentTHDD && type == 2) {
      return;
    }
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = `Xóa mã ${item}`
    dataDialog.message = `Điểm kinh doanh sẽ không ghi nhận giao dịch.<br>Bạn có chắc chắn muốn xóa mã ${item} không ? `;
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.icon = 'icon-error';
    dataDialog.iconColor = 'icon error';
    dataDialog.buttonColor = 'error';
    dataDialog.width = '25%'
    this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
      if (result) {
        if (type == 1) {
          this.lstPaymentPodClone.splice(index, 1);
          if (this.lstPaymentPodClone.length == 0) {
            this.isSoftPos = false;
          }
        }

        if (type == 2) {
          this.lstPaymentTHDDClone.splice(index, 1);
          if (this.lstPaymentTHDDClone.length == 0) {
            this.isPaymentTHDD = false;
          }
        }
      } 0
    });
  }
  doClose() {
    let merchantId = this.subId;
    this.router.navigate(['/business/business-detail'], { queryParams: { merchantId: merchantId } });
  }

  addPaymentPod() {
    if (this.isSoftPos) {
      this.isAddPodId = !this.isAddPodId;
    }
  }
  addPaymentTHDD() {
    if (this.isPaymentTHDD) {
      this.isAddTHDDId = !this.isAddTHDDId;
    }
  }

  doAddPaymentPod(control: NgModel, isBur?: boolean) {
    let paymentMethodId = control.value?.toLowerCase().trim();
    if (isBur && paymentMethodId == '') {
      this.paymentMethodPodId = '';
      control.reset();
      this.isAddPodId = false;
      return;
    }

    if (control.valid) {
      const exists = this.lstPaymentPodClone.some(
        (item: any) => item.toLowerCase() === paymentMethodId
      );

      if (!exists) {
        if (this.lstPaymentPodClone.length < 50)
          this.lstPaymentPodClone.push(control.value);
        this.paymentMethodPodId = '';
        control.reset();
        this.isAddPodId = false;
      } else {
        control.control.setErrors({ exitErorr: true });
      }
    }
  }

  doAddPaymentTHDD(control: NgModel) {
    if (control.valid) {
      let paymentMethodId = control.value?.toLowerCase().trim();
      const exists = this.lstPaymentTHDDClone.some(
        (item: any) => item.toLowerCase() === paymentMethodId
      );

      if (!exists) {
        if (this.lstPaymentTHDDClone.length < 50)
          this.lstPaymentTHDDClone.push(control.value);
        this.paymentMethodTHDDId = '';
        control.reset();
        this.isAddTHDDId = false;
      } else {
        control.control.setErrors({ exitErorr: true });
      }
    }
  }

  doCancelPayment(event: any, type: number) {
    if (event && type == 1) {
      this.paymentQRFormUpdate.enable();
    }
    if (!event) {
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = "Huỷ phương thức thanh toán";
      dataDialog.message = "Điểm kinh doanh sẽ không ghi nhận giao dịch. Bạn có chắc chắn muốn huỷ phương thức thanh toán không?";
      dataDialog.buttonLabel = 'Xác nhận';
      dataDialog.icon = 'icon-error';
      dataDialog.iconColor = 'icon error';
      dataDialog.buttonColor = 'error';
      dataDialog.width = '25%'
      this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
        if (result) {
          switch (type) {
            case 1:
              this.isPaymentQR = false;
              this.paymentQRFormUpdate.disable();
              break;
            case 2:
              this.isSoftPos = false;
              this.paymentMethodPodId = '';
              this.isAddPodId = false;
              break;
            default:
              this.isPaymentTHDD = false;
              this.paymentMethodTHDDId = '';
              this.isAddTHDDId = false;
              break;
          }
          this.doConfirm();
        } else {
          switch (type) {
            case 1:
              this.isPaymentQR = true;
              break;
            case 2:
              this.isSoftPos = true;
              break;
            default:
              this.isPaymentTHDD = true;
              break;
          }
        }
      });
    }
  }

  doConfirm() {
    if (this.isPaymentQR || this.isSoftPos || this.isPaymentTHDD) {
      return;
    }
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = "Điểm kinh doanh yêu cầu gắn với ít nhất 1 phương thức thanh toán";
    dataDialog.message = "Vui lòng thêm phương thức thanh toán.";
    dataDialog.buttonLabel = 'Tôi đã hiểu';
    dataDialog.viewCancel = false;
    dataDialog.icon = 'icon-information';
    dataDialog.iconColor = 'icon info';
    dataDialog.buttonColor = 'info';
    dataDialog.width = '25%'
    this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
    });
  }

  doUpdate() {
    if (!this.doCreateMerchantPaymentMethodList().length) {
      this.toast.showWarn('Không có sự thay đổi thông tin phương thức thanh toán')
      return;
    }
    let dataSave = {
      merchantId: this.merchantId,
      subId: this.subId,
      actionType: "PAYMENT-INFO",
      merchantPaymentMethodList: this.doCreateMerchantPaymentMethodList()
    }
    this.api.post(BUSINESS_ENDPOINT.UPDATE_SUB_MERCHANT, dataSave).subscribe(res => {
      if (res) {
        this.dataRespone = res?.data?.paymentMethod;
        if (res["status"] == 200) {
          let checkErrorMethod = 0;
          res["data"]["paymentMethod"].forEach((item: any) => {
            if (item["soaErrorCode"] != 200) {
              checkErrorMethod = 1;
              return;
            }
          });

          if (checkErrorMethod > 0) {
            this.toast.showSuccess('Cập nhật phương thức thanh toán thành công', "Vui lòng kiểm tra lại phương thức thanh toán do có lỗi khi thiết lập");
          } else {
            this.toast.showSuccess('Cập nhật phương thức thanh toán thành công');
          }
          this.doDetail(this.subId);
        } else if (res["status"] == 400) {
          this.handleResponeError400(this.dataRespone);
        }
      }
    }, (error) => {
      const errorData = error?.error || {};
      switch (errorData.soaErrorCode) {
        case '203':
          this.toast.showError(errorData.soaErrorDesc);
          break;
        case '5010':
          this.openDialogUnverifiedAccountAndEmail();
          break;
        default:
          this.toast.showError('Đã xảy ra lỗi, vui lòng thử lại');
          break;
      }
    });
  }

  handleResponeError400(dataRespone: any) {
    if (dataRespone) {
      dataRespone.forEach((item: any) => {
        if (item.soaErrorCode == "MAPPING_KEY_01" && item.methodId == 333) {
          this.lstDuplicatePos = item.keyAlreadyList;
        } else if (item.soaErrorCode == "MAPPING_KEY_01" && item.methodId == 332) {
          this.lstDuplicateId = item.keyAlreadyList;
        } else if (item.methodId == 324) {
          switch (item.soaErrorCode) {
            case 'MAPPING_KEY_01':
              this.paymentQR ? this.paymentQRFormUpdate.get('terminalId')!.setErrors({ Exited: true }) : this.paymentQRFormInsert.get('terminalId')!.setErrors({ Exited: true });
              break;
            case 'AC_01':
              this.paymentQR ? this.paymentQRFormUpdate.get('accountNumber')!.setErrors({ ExitErorr: true }) : this.paymentQRFormInsert.get('accountNumber')!.setErrors({ ExitErorr: true });
              break;
            case 'AC_02':
              this.paymentQR ? this.paymentQRFormUpdate.get('accountName')!.setErrors({ ExitErorr: true }) : this.paymentQRFormInsert.get('accountName')!.setErrors({ ExitErorr: true });
              break;
            case '223':
              this.paymentQR ? this.paymentQRFormUpdate.get('terminalId')!.setErrors({ ExitErorr: true }) : this.paymentQRFormInsert.get('terminalId')!.setErrors({ ExitErorr: true });
              break;
            case '203':
              this.paymentQR ? this.paymentQRFormUpdate.get('terminalId')!.setErrors({ Invalid: true }) : this.paymentQRFormInsert.get('terminalId')!.setErrors({ Invalid: true });
              break;
            case '251':
              this.paymentQR ? this.paymentQRFormUpdate.get('terminalId')!.setErrors({ NotValue: true }) : this.paymentQRFormInsert.get('terminalId')!.setErrors({ NotValue: true });
              break;
          }
        }
      })
      if (!dataRespone?.length) {
        this.toast.showError('Đã xảy ra lỗi, vui lòng thử lại');
      }
    } else {
      this.toast.showError('Đã xảy ra lỗi, vui lòng thử lại');
    }
  }
  isDuplicate(lstDuplicate: any, item: string): boolean {
    return lstDuplicate.some((dup: any) => dup.toLowerCase().trim() === item.toLowerCase().trim());
  }

  isDuplicateClass(lstDuplicate: any, item: string): { [key: string]: boolean } {
    const isDup = this.isDuplicate(lstDuplicate, item);
    return {
      'ng-invalid': isDup,
      'ng-dirty': isDup,
      'ng-touched': isDup
    };
  }

  doCreateMerchantPaymentMethodList() {
    let paymentQReq;
    let paymentPod;
    let paymentTHDD;
    // tao object cho phuong thuc thanh toan QR
    if (this.paymentQR && !this.isPaymentQR) {
      paymentQReq = {
        methodId: 324,
        paymentMethodType: "DELETE"
      }
    } else if (!this.paymentQR && this.isPaymentQR) {
      paymentQReq = {
        methodId: 324,
        paymentMethodType: "UPDATE",
        paymentMethodUpsert: [{
          actionType: "INSERT",
          type: this.ischeck == 1 ? "MANUAL" : "AUTO",
          terminalId: this.ischeck == 1 ? this.paymentQRFormInsert.get('terminalId')?.value : null,
          accountNumber: this.ischeck == 1 ? null : this.paymentQRFormInsert.get('accountNumber')?.value,
          accountName: this.ischeck == 1 ? null : this.paymentQRFormInsert.get('accountName')?.value,
        }]
      }
    } else if (!this.paymentQR && this.isPaymentQR && this.ischeck == 2) {
      paymentQReq = {
        methodId: 324,
        paymentMethodType: "UPDATE",
        paymentMethodUpsert: [{
          actionType: "INSERT",
          type: "AUTO",
          terminalId: null,
        }]
      }
    } else if (this.paymentQR && this.changedTerminalId) {
      paymentQReq = {
        methodId: 324,
        paymentMethodType: "UPDATE",
        paymentMethodUpsert: [{
          actionType: "UPDATE-KEY",
          terminalId: this.paymentQRFormUpdate.get('terminalId')?.value,
          terminalIdUp: this.paymentQRFormUpdate.get('initialTerminalId')?.value
        }]
      }
    } else if (this.paymentQR && this.changedInfoQR) {
      paymentQReq = {
        methodId: 324,
        paymentMethodType: "UPDATE",
        paymentMethodUpsert: [{
          actionType: "UPDATE-INFO",
          terminalIdUp: this.paymentQRFormUpdate.get('initialTerminalId')?.value,
          accountName: this.paymentQRFormUpdate.get('accountName')?.value,
          accountNumber: this.paymentQRFormUpdate.get('accountNumber')?.value
        }]
      }
    }
    let paymentMethodIdDeleteTHDD = this.lstPaymentTHDD.filter((item: any) => !this.lstPaymentTHDDClone.includes(item));
    let paymentMethodUpsertTHDD = this.lstPaymentTHDDClone.filter((item: any) => !this.lstPaymentTHDD.includes(item));

    let paymentMethodIdDeletePos = this.lstPaymentPod.filter((item: any) => !this.lstPaymentPodClone.includes(item));
    let paymentMethodUpsertPos = this.lstPaymentPodClone.filter((item: any) => !this.lstPaymentPod.includes(item));


    //tao object cho phuong thuc thanh toan pos
    if ((!this.isSoftPos && this.lstPaymentPod.length > 0) || (this.lstPaymentPod.length > 0 && isEqual(this.lstPaymentPod, paymentMethodIdDeletePos) && paymentMethodUpsertPos.length == 0)) {
      paymentPod = {
        methodId: 333,
        paymentMethodType: "DELETE"
      }
    } else if (paymentMethodIdDeletePos.length == 0 && paymentMethodUpsertPos.length == 0) {
      paymentPod = null;
    } else {
      paymentPod = {
        methodId: 333,
        paymentMethodType: "UPDATE",
        paymentMethodIdDelete: paymentMethodIdDeletePos,
        paymentMethodUpsert: paymentMethodUpsertPos
      }
    }

    //tao object cho phuong thuc thanh toan THDD
    if ((!this.isPaymentTHDD && this.lstPaymentTHDD.length > 0) || (this.lstPaymentTHDD.length > 0 && isEqual(this.lstPaymentTHDD, paymentMethodIdDeleteTHDD) && paymentMethodUpsertTHDD.length == 0)) {
      paymentTHDD = {
        methodId: 332,
        paymentMethodType: "DELETE"
      }
    } else if (paymentMethodIdDeleteTHDD.length == 0 && paymentMethodUpsertTHDD.length == 0) {
      paymentTHDD = null;
    } else {
      paymentTHDD = {
        methodId: 332,
        paymentMethodType: "UPDATE",
        paymentMethodIdDelete: paymentMethodIdDeleteTHDD,
        paymentMethodUpsert: paymentMethodUpsertTHDD
      }
    }
    let merchantPaymentMethodList = [];
    if (paymentQReq) {
      merchantPaymentMethodList.push(paymentQReq);
    }
    if (paymentPod) {
      merchantPaymentMethodList.push(paymentPod);
    }
    if (paymentTHDD) {
      merchantPaymentMethodList.push(paymentTHDD);
    }
    return merchantPaymentMethodList;
  }

  doCheckPayment(paymentMethodId: number) {
    return this.lstPaymentMethod.some(
      (item: any) => item.paymentMethodId === paymentMethodId && item.status === 'active'
    );
  }

  doDetail(merchantId?: any) {
    if (merchantId)
      this.router.navigate(['/business/business-detail'], { queryParams: { merchantId: merchantId } });
    else
      this.router.navigate(['/business/business-detail']);
  }

  openDialogUnverifiedAccountAndEmail() {
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
      if (result) {
        this.verifyEmail();
      } else {
        this.updateEmail();
      }
    });
  }

  updateEmail() {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '600px',
      panelClass: 'dialog-update-user',
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
    })
  }

  clearValue(formInput: FormGroup, nameInput: string) {
    formInput.get(nameInput)?.setValue(null);
  }
}
