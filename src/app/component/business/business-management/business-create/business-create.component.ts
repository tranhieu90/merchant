import { animate, state, style, transition, trigger } from '@angular/animations';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { environment } from '../../../../../environments/environment';
import { CommonUtils } from '../../../../base/utils/CommonUtils';
import { InputCommon } from '../../../../common/directives/input.directive';
import { InputSanitizeDirective } from '../../../../common/directives/inputSanitize.directive';
import { ShowClearOnFocusDirective } from '../../../../common/directives/showClearOnFocusDirective';
import { BUSINESS_ENDPOINT, LOCATION_ENDPOINT, ORGANIZATION_ENDPOINT, USER_ENDPOINT } from '../../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../../common/service/toast/toast.service';
import { AreaModel } from '../../../../model/AreaModel';
import { DialogConfirmModel } from '../../../../model/DialogConfirmModel';
import { AreaViewComponent } from '../../../organization-management/area-view/area-view.component';
import { DialogRoleComponent, DialogRoleModel } from '../../../role-management/dialog-role/dialog-role.component';
import { UpdateUserComponent } from '../../../user-profile/update-user/update-user.component';

@Component({
  selector: 'app-business-create',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    CheckboxModule,
    MatCheckboxModule,
    MatIconModule,
    InputNumberModule,
    DropdownModule,
    InputSwitchModule,
    RadioButtonModule,
    AreaViewComponent,
    InputSanitizeDirective,
    InputCommon,
    ShowClearOnFocusDirective
  ],
  templateUrl: './business-create.component.html',
  styleUrl: './business-create.component.scss',
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
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class BusinessCreateComponent implements OnInit {
  @ViewChild('accountNumberId') accountNumberModel!: NgModel;
  @ViewChild('accountNameId') accountNameModel!: NgModel;
  @ViewChild('temiralId') temiralIdModel!: NgModel;
  @ViewChild('posCodeRef') posCodeModel!: NgModel;
  @ViewChild('thddCodeRef') thddCodeModel!: NgModel;
  formBusiness!: FormGroup;
  areaIdMove: number = 0;
  ischeck: number = 1
  currentStep: number = 0;
  isPayment1: boolean = false;
  isPayment2: boolean = false;
  isPayment3: boolean = false;
  isAdd: boolean = false;
  posCode!: string;
  thddCode!: string;
  selectedCountry: any;

  dataGroup: any = [];
  lstAreaByOrder: any = [];
  merchantPaymentMethodList: any = [];
  paymentMethodMap = new Map<number, any>();
  lstPaymentMethod: any = [];
  lstPaymentPos: any = [];
  lstPaymentThdd: any = [];
  terminalId: any;
  accountNumber: any;
  accountName: any;
  isSuccess: number = 0;
  merchantId: any;
  paymentType: any;
  lstProvince: any = [];
  lstDistrict: any = [];
  lstCommune: any = [];
  verifyInfo: any;
  quantity: any;
  organizationSetup: boolean = false;
  oneSuccessful: boolean = false;
  isAddPosId: boolean = false;
  isAddTHDDId: boolean = false;
  roleOrganization: boolean = false;
  roleHr: boolean = false;
  assetPath = environment.assetPath;
  searchAreaIdMove: string = '';
  filteredAreas: any = [];
  lstBusiness: any = [];
  accountNumberPattern = '^[a-zA-Z0-9]+$';
  accountNamePattern = '^[^àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ'
    + 'ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+$';

  tidPosErrorList: any = [];
  thddErrorList: any = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private dialogCommon: DialogCommonService,
  ) {
    this.routeActive.queryParams.subscribe(params => {
      this.organizationSetup = params['organizationSetup'] ? params['organizationSetup'] : false;
      this.lstBusiness = params['lstBusiness'] === 'true';
      this.areaIdMove = params['groupId'];
    });
  }

  ngOnInit(): void {
    this.verifyInfo = this.auth.checkVerifyUserInfo();
    this.buildForm();
    if (!this.organizationSetup) {
      this.getLstDataGroup();
    }
    this.getLstPaymentMethod();
    this.doGetProvince();
    if (this.verifyInfo == 'UN_VERIFIED_WITH_EMAIL') {
      this.router.navigate(['/profile'])
    }
  }

  buildForm() {
    this.formBusiness = this.fb.group({
      merchantBizName: ['', [Validators.required, Validators.maxLength(32)]],
      merchantName: ['', [Validators.required, Validators.maxLength(128)]],
      provinceId: ['', [Validators.required]],
      districtId: ['', [Validators.required]],
      communeId: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.maxLength(256)]],
    })
  }

  getLstDataGroup() {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.dataGroup = res.data;
          this.lstAreaByOrder = this.convertLstAreaByOrder(this.dataGroup, this.dataGroup[0].parentId);
          this.filteredAreas = this.lstAreaByOrder;
          this.handleOrganizationSet();
        } else {
          this.handleOrganizationNotSet();
        }
      }, (error: any) => {
        const errorData = error?.error || {};
        switch (errorData.soaErrorCode) {
          case 'GROUP_ERROR_019':
            this.handleOrganizationNotSet();
            break;
          case 'ACCOUNT_ERROR_001':
            this.toast.showError(errorData.soaErrorDesc);
            this.openDialogUnverifiedAccountNoEmail();
            break;
          case 'ACCOUNT_ERROR_002':
            this.openDialogUnverifiedAccountHasEmail();
        }
      });
  }

  convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
    let result = list.filter(item => item.parentId === parentId);

    result.forEach(item => {
      let children = this.convertLstAreaByOrder(list, item.id);
      item.children = children;
    });

    return result;
  }

  doChangeAreaIdMove(areaMove: AreaModel) {
    this.areaIdMove = areaMove.id;
  }

  clearValue(nameInput: string) {
    this.formBusiness.get(nameInput)?.setValue('');
  }

  doNextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  doPreStep() {
    if (this.currentStep >= 0) {
      this.currentStep--;
    }
  }

  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
  }

  doCreate() {
    let params: any = this.formBusiness.getRawValue();
    params['provinceId'] = this.formBusiness.controls['provinceId']?.value;
    params['districtId'] = this.formBusiness.controls['districtId']?.value;
    params['communeId'] = this.formBusiness.controls['communeId']?.value;
    params['groupId'] = this.areaIdMove;

    this.merchantPaymentMethodList = [];

    // ----- QR Thanh toán (methodId: 324) -----
    if (this.paymentMethodMap.has(324) && this.isPayment1) {
      if (this.isPayment1 && this.ischeck === 1 && this.terminalId) {
        this.merchantPaymentMethodList.push({
          methodId: '324',
          paymentInfo: [{
            type: 'MANUAL',
            terminalId: this.terminalId?.trim(),
          }]
        });
      } else if (this.accountNumber && this.accountName) {
        this.merchantPaymentMethodList.push({
          methodId: '324',
          paymentInfo: [{
            type: 'AUTO',
            accountNumber: this.accountNumber?.trim(),
            accountName: this.accountName?.trim(),
          }]
        });
      }
    }

    // ----- TID POS (methodId: 333) -----
    if (this.isPayment2 && this.lstPaymentPos.length > 0) {
      this.merchantPaymentMethodList.push({
        methodId: '333',
        paymentInfo: [...this.lstPaymentPos],
      });
    }

    // ----- THDD (methodId: 332) -----
    if (this.isPayment3 && this.lstPaymentThdd.length > 0) {
      this.merchantPaymentMethodList.push({
        methodId: '332',
        paymentInfo: [...this.lstPaymentThdd],
      });
    }
    if (this.merchantPaymentMethodList.length > 0) {
      params['merchantPaymentMethodList'] = this.merchantPaymentMethodList;
      this.checkInvalidPayment();

      this.api.post(BUSINESS_ENDPOINT.CREATE_SUB_MERCHANT, params).subscribe((res) => {
        this.merchantId = res?.data?.merchantId;
        const outputs = res['data']['methodSubMerchantXOutputs'];
        const soaErrorCode200 = outputs.filter((item: any) => item.soaErrorCode === '200');
        const soaErrorCode = outputs.filter((item: any) => item.soaErrorCode != '200');
        const method324Error = outputs.find((item: any) => item.methodId === 324 && item.soaErrorCode != '200' && item.soaErrorCode != '500');
        const errorMappingKey = outputs.filter((item: any) => item.soaErrorCode === 'MAPPING_KEY_01');
        if (method324Error) {
          this.checkErrorQr(method324Error);
          return;
        }

        if (errorMappingKey.length > 0) {
          this.checkErrorKey(errorMappingKey);
          return;
        }

        if (soaErrorCode200.length > 1 && soaErrorCode.length > 0) {
          this.oneSuccessful = true;
        } else {
          this.roleHr = this.auth.apiTracker("/api/v1/add-user-role");
        }

        if (res && res.status == 200) {
          let checkErrorMethod = 0
          outputs.forEach((item: any) => {
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

          this.isSuccess = 1;
          this.doNextStep();
        }
      }, (error) => {
        const errorData = error?.error || {};
        switch (errorData.soaErrorCode) {
          case '213':
            this.formBusiness.get('merchantBizName')!.setErrors({ isMerchantBizNameUsed: true });
            this.doPreStep();
            break;
          case '253':
            let outputs = errorData['data']['methodSubMerchantXOutputs'];
            this.checkErrorKey(outputs);
            break;
          default:
            this.isSuccess = 0;
            this.doNextStep();
            break;
        }
      });
    } else {
      this.isPayment1 = false
      this.isPayment2 = false
      this.isPayment3 = false
      this.toast.showError("Vui lòng nhập thông tin");
    }
  }

  checkInvalidPayment() {
    if (this.isPayment1 && this.ischeck == 1 && this.temiralIdModel?.invalid) {
      this.temiralIdModel.control.setErrors({ required: true });
      this.temiralIdModel.control.markAsTouched();
      return;
    } else if (this.isPayment1 && this.ischeck == 2 && this.paymentType == 0 && this.accountNameModel?.invalid) {
      this.accountNameModel.control.setErrors({ required: true });
      this.accountNameModel.control.markAsTouched();
      return;
    } else if (this.isPayment1 && this.ischeck == 2 && this.paymentType == 0 && this.accountNumberModel?.invalid) {
      this.accountNumberModel.control.setErrors({ required: true });
      this.accountNumberModel.control.markAsTouched();
      return;
    } else if (this.isAddPosId && this.posCodeModel?.invalid) {
      this.posCodeModel.control.setErrors({ required: true });
      this.posCodeModel.control.markAsTouched();
      return;
    } else if (this.isAddTHDDId && this.thddCodeModel?.invalid) {
      this.thddCodeModel.control.setErrors({ required: true });
      this.thddCodeModel.control.markAsTouched();
      return;
    }
  }

  checkErrorQr(method324Error: any) {
    const errorMap: { [key: string]: { control: any, errorKey: string } } = {
      'AC_01': { control: this.accountNumberModel?.control, errorKey: 'notCorrect' },
      'AC_02': { control: this.accountNameModel?.control, errorKey: 'notCorrect' },
      'MAPPING_KEY_01': { control: this.temiralIdModel?.control, errorKey: 'notCorrect' },
      '223': { control: this.temiralIdModel?.control, errorKey: 'invalidErorr' }
    };

    const errorConfig = errorMap[method324Error.soaErrorCode];
    if (errorConfig?.control) {
      errorConfig.control.setErrors({ [errorConfig.errorKey]: true });
      errorConfig.control.markAsTouched();
    }
  }

  checkErrorKey(item: any) {
    const errorQr = item.filter((item: any) => item.soaErrorCode === '223');
    const errorKey = item.filter((item: any) => item.soaErrorCode === 'MAPPING_KEY_01');
    const errorKeyPos = errorKey.find((item: any) => item.methodId === 333)?.keyAlreadyList || [];
    const errorKeyThd = errorKey.find((item: any) => item.methodId === 332)?.keyAlreadyList || [];
    const notSpCreate = item.filter((item: any) => item.soaErrorCode === '402');
    if (errorQr.length > 0) {
      this.temiralIdModel?.control.setErrors({ invalidErorr: true });
      this.temiralIdModel?.control.markAsTouched();
    }
    notSpCreate.length > 0 ? this.toast.showError('not support create payment method!') : '';
    errorKeyPos ? this.tidPosErrorList = errorKeyPos : '';
    errorKeyThd ? this.thddErrorList = errorKeyThd : '';
  }

  getLstPaymentMethod() {
    this.api.get(BUSINESS_ENDPOINT.GET_LIST_PAYMENT_METHOD).subscribe(res => {
      if (res['data']) {
        this.lstPaymentMethod = res['data']['paymentMethodList'];
        this.lstPaymentMethod.forEach((item: any) => {
          this.paymentMethodMap.set(item.paymentMethodId, item);
        });
        const paymentMethod = this.paymentMethodMap.get(324);
        this.paymentType = paymentMethod['paymentType'];
      }
    }, () => {
      this.lstPaymentMethod = [];
      this.toast.showError('Lấy phương thức thanh toán xảy ra lỗi')
    });
  }

  removePos(index: number) {
    this.lstPaymentPos.splice(index, 1);
    this.tidPosErrorList.splice(index, 1);
  }

  removeThdd(index: number) {
    this.lstPaymentThdd.splice(index, 1);
    this.thddErrorList.splice(index, 1);
  }

  doDetail() {
    if (this.merchantId)
      this.router.navigate(['/business/business-detail'], { queryParams: { merchantId: this.merchantId } });
  }

  doGetProvince() {
    this.api.get(LOCATION_ENDPOINT.GET_PROVINCE).subscribe(res => {
      if (res) {
        this.lstProvince = res['data'];
      }
    }, () => {
      this.toast.showError('Lấy danh sách tỉnh, thành phố xảy ra lỗi.');
    });
  }

  doGetDistrict(provinceId: number) {
    if (provinceId) {
      let param = {
        provinceId: provinceId
      }
      let buildParams = CommonUtils.buildParams(param);
      this.api.get(LOCATION_ENDPOINT.GET_DISTRIC, buildParams).subscribe(res => {
        if (res) {
          this.lstDistrict = res['data'];
          this.lstCommune = [];
        }
      }, () => {
        this.toast.showError('Lấy danh sách quận, huyện xảy ra lỗi.');
      });
    }
  }

  doGetCommune(provinceId: number, districtId: number, type: number) {
    if (type == 1) {
      provinceId = this.formBusiness.get('provinceId')?.value;
    }
    if (provinceId && districtId) {
      let param = {
        provinceId: provinceId,
        districtId: districtId
      }
      let buildParams = CommonUtils.buildParams(param);
      this.api.get(LOCATION_ENDPOINT.GET_COMMUNE, buildParams).subscribe(res => {
        if (res) {
          this.lstCommune = res['data'];
        }
      }, () => {
        this.toast.showError('Lấy danh sách xã, phường xảy ra lỗi.');
      });
    }
  }

  onCancel() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Hủy tạo mới điểm kinh doanh';
    dataDialog.message = 'Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ tạo mới điểm kinh doanh không? ';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.buttonColor = 'error';
    dataDialog.icon = 'icon-error';
    dataDialog.viewCancel = true;
    dataDialog.iconColor = 'icon error';
    dataDialog.width = "30%";

    this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
      if (result) {
        this.router.navigate(['/business']);
      }
    })
  }

  handleOrganizationNotSet() {
    let roleOrganizational = this.auth.apiTracker("/api/v1/group-management/save-organizational-setup");
    if (this.verifyInfo == 'VERIFIED' && roleOrganizational && !this.lstBusiness) {
      this.router.navigate(['/business']);
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Bạn chưa thiết lập mô hình tổ chức cho doanh nghiệp';
      dataDialog.message = 'Bạn có thể cân nhắc thiết lập tổ chức để phân cấp nhóm cho điểm kinh doanh hoặc tiếp tục tạo điểm kinh doanh..';
      dataDialog.buttonLabel = 'Thiết lập tổ chức';
      dataDialog.cancelTitle = 'Tạo điểm kinh doanh';
      dataDialog.iconColor = 'icon warning';
      dataDialog.icon = 'icon-warning';
      dataDialog.width = '30%'

      this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
        if (result) {
          this.router.navigate(['/organization']);
        } else if (result == false) {
          this.router.navigate(['/business/business-create'], { queryParams: { organizationSetup: true } });
        }
      })
    } else {
      this.organizationSetup = true;
    }
  }

  doCheckQuantity() {
    this.quantity = this.dataGroup.find((item: any) => item.id == this.areaIdMove)
    if (this.quantity['pointSaleCount'] > 1000) {
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Số lượng điểm kinh doanh thuộc nhóm vượt quá số lượng quy định';
      dataDialog.message = 'Vui lòng chọn nhóm khác.';
      dataDialog.buttonLabel = 'Tôi đã hiểu';
      dataDialog.icon = 'icon-warning';
      dataDialog.iconColor = 'icon warning';
      dataDialog.width = '30%';
      dataDialog.viewCancel = false;
      this.dialogCommon.openDialogInfo(dataDialog)
    } else {
      this.doNextStep();
    }
  }

  trimValue(controlName: string) {
    const control = this.formBusiness.get(controlName);
    if (control) {
      control.setValue(control.value.trim());
    }
  }

  doOpenOrganization() {
    this.router.navigate(['/organization'])
  }

  handleOrganizationSet() {
    let roleOrganizational = this.auth.apiTracker("/api/v1/group-management/save-organizational-setup");
    if (this.verifyInfo == 'VERIFIED' && roleOrganizational) {
      this.roleOrganization = true;
    }
  }

  doAddPaymentPos(control: NgModel) {
    if (control.valid) {
      let paymentMethodId = control.value?.toLowerCase().trim();
      const exists = this.lstPaymentPos.some(
        (item: any) => item.toLowerCase() === paymentMethodId
      );

      if (!exists) {
        if (this.lstPaymentPos.length < 50)
          this.lstPaymentPos.push(control.value);
        this.posCode = '';
        this.isAddPosId = false;
      } else {
        control.control.setErrors({ exitErorr: true });
      }
    }
  }

  doAddPaymentTHDD(control: NgModel) {
    if (control.valid) {
      let paymentMethodId = control.value?.toLowerCase().trim();
      const exists = this.lstPaymentThdd.some(
        (item: any) => item.toLowerCase() === paymentMethodId
      );

      if (!exists) {
        if (this.lstPaymentThdd.length < 50)
          this.lstPaymentThdd.push(control.value);
        this.thddCode = '';
        this.isAddTHDDId = false;
      } else {
        control.control.setErrors({ exitErorr: true });
      }
    }
  }

  addPaymentPos() {
    if (this.isPayment2) {
      this.isAddPosId = !this.isAddPosId;
    }
  }

  addPaymentTHDD() {
    if (this.isPayment3) {
      this.isAddTHDDId = !this.isAddTHDDId;
    }
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
      if (result) {
        this.updateEmail();
      }
    })
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
      if (result) {
        this.verifyEmail();
      } else {
        this.updateEmail();
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

  onStepOne() {
    if (this.currentStep >= 0) {
      this.currentStep = 0;
    }
  }

  onSearchChange() {
    if (!this.searchAreaIdMove.trim()) {
      this.filteredAreas = this.lstAreaByOrder;
    } else {
      this.filteredAreas = this.filterAreas(this.lstAreaByOrder, this.searchAreaIdMove.trim().toLowerCase());
    }
  }

  filterAreas(areas: any, term: string): any[] {
    const filtered = [];

    for (const area of areas) {
      const filteredChildren = area.children ? this.filterAreas(area.children, term) : [];

      if (area.groupName?.toLowerCase().includes(term) || filteredChildren.length > 0) {
        filtered.push({
          ...area,
          children: filteredChildren
        });
      }
    }
    return filtered;
  }

  isPtttInvalid(): boolean {
    if (this.isPayment1) {
      if (this.ischeck === 1) {
        if (this.temiralIdModel?.control.invalid || this.temiralIdModel?.control.errors != null) {
          return true;
        }
      } else if (this.ischeck === 2 && this.paymentType === 0) {
        if (
          this.accountNumberModel?.control.invalid || this.accountNumberModel?.control.errors != null ||
          this.accountNameModel?.control.invalid || this.accountNameModel?.control.errors != null
        ) {
          return true;
        }
      }
    }

    if (this.isPayment2) {
      if (this.posCodeModel?.control.invalid || this.posCodeModel?.control.errors != null) {
        return true;
      }
    }

    if (this.isPayment3) {
      if (this.thddCodeModel?.control.invalid || this.thddCodeModel?.control.errors != null) {
        return true;
      }
    }

    return false;
  }

  hasTidPosError(): boolean {
    return this.tidPosErrorList?.length > 0;
  }

  hasThddError(): boolean {
    return this.thddErrorList?.length > 0;
  }
}
