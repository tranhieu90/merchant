import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { environment } from '../../../../environments/environment';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { MTreeComponent } from '../../../base/shared/m-tree/m-tree.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { InputCommon } from '../../../common/directives/input.directive';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import {
  GROUP_ENDPOINT,
  HR_ENDPOINT,
  ORGANIZATION_ENDPOINT
} from '../../../common/enum/EApiUrl';
import { REGEX_PATTERN } from '../../../common/enum/RegexPattern';
import { fomatAddress, generatePassword } from '../../../common/helpers/Ultils';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { GridViewModel } from '../../../model/GridViewModel';
import { IErrorRespone } from '../../../model/ma/funtion-group.model';
import {
  DialogRoleComponent,
  DialogRoleModel,
} from '../../role-management/dialog-role/dialog-role.component';

@Component({
  selector: 'app-human-resource-create',
  standalone: true,
  imports: [
    Button,
    InputCommon,
    InputTextModule,
    InputTextareaModule,
    MatButton,
    MatStep,
    MatStepper,
    PaginatorModule,
    ReactiveFormsModule,
    GridViewComponent,
    CalendarModule,
    CommonModule,
    ShowClearOnFocusDirective,
    MTreeComponent,
    MatCheckboxModule,
    RadioButtonModule,
  ],
  templateUrl: './human-resource-create.component.html',
  styleUrl: './human-resource-create.component.scss',
})
export class HumanResourceCreateComponent implements OnInit {
  assetPath = environment.assetPath;
  @ViewChild('gridViewRef') gridViewComponent!: GridViewComponent;
  @ViewChild('mTreeComponent') mTreeComponent!: MTreeComponent;
  id!: number;
  formInfo!: FormGroup;
  totalItem: number = 0;
  currentStep: number = 0;
  isSearch: boolean = false;
  maxDate: Date = new Date();
  lstDataRole: any = [];
  roleId: string = '';
  isSuccess: number = 0;
  isHaveEmail: boolean = false;
  userInfo!: any;
  roles: any = [];
  pointSales: any = [];
  pointSales2: any = [];
  organization: any = [];
  organizationSort: any = [];
  organizationIdActive: number | null = null;
  typeUpdate!: number;
  searchOrganization: string = '';
  masterIdSelected: number | null = null;
  pointSalesSelected: Set<any> = new Set();
  organizationSelected: any[] = [];
  totalPointSalesSelected: number = 0;
  countSelectedPoint: number = 0;
  activeOrganization: string = '';
  isShowMechantList: boolean = false;
  searchPoint: boolean = false;
  searchPointV2: boolean = false;
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private messageService: MessageService,
    private toast: ToastService,
    private api: FetchApiService,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private dialogCommon: DialogCommonService
  ) {
    this.routeActive.queryParams.subscribe((params) => {});
  }

  ngOnInit(): void {
    this.buildForm();
    this.userInfo = this.auth.getUserInfo();
    if (this.userInfo?.isConfig == 0) {
      this.getLstMerchant(true);
    } else {
      this.typeUpdate = 2;
      if (this.userInfo.orgType != 2) this.doGetGroup();
      if (this.userInfo.orgType == 2) this.getLstMerchant(true);
    }
  }
  columns: Array<GridViewModel> = [
    {
      name: 'id',
      label: 'ID',
      options: {
        width: '5%',
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return value ? `#${value}` : '';
        },
      },
    },
    {
      name: 'name',
      label: 'TÊN VAI TRÒ',
      options: {
        width: '35%',
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'description',
      label: 'MÔ TẢ',
      options: {
        width: '60%',
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
  ];
  columnsMerchant: Array<GridViewModel> = [
    {
      name: 'merchantId',
      label: 'ID',
      options: {
        width: '5%',
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return value ? `#${value}` : '';
        },
      },
    },
    {
      name: 'merchantBizName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        width: '45%',
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'formatAddress',
      label: 'ĐỊA CHỈ',
      options: {
        width: '50%',
        customCss: () => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
  ];
  buildForm() {
    this.formInfo = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(50),Validators.pattern(REGEX_PATTERN.FULL_NAME)]],
      emailChange: [
        '',
        [Validators.maxLength(254), Validators.pattern(REGEX_PATTERN.EMAIL), this.validateEmailPrefix],
      ],
      phoneNumber: ['', [Validators.pattern(REGEX_PATTERN.PHONE)]],
      dateOfBirth: [''],
      userName: ['', [Validators.required, Validators.maxLength(50),Validators.pattern(REGEX_PATTERN.USER_NAME)]],
      userPass: ['', [Validators.required]],
    });
  }
  doGetGroup() {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.organization = res.data;
          this.organizationSort = this.convertLstAreaByOrder(
            res.data,
            res.data[0].parentId
          );
        }
      },
      (error: any) => {
        var errData: IErrorRespone = error.error;
        switch (errData.soaErrorCode) {
          case 'GROUP_ERROR_007':
            this.toast.showError('Nhóm không tồn tại hoặc đã bị vô hiệu hóa!');
            break;
          default:
            this.toast.showError(
              'Có lỗi trong quá trình xử lý. Vui lòng thử lại sau!'
            );
            break;
        }
      }
    );
  }
  convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
    let result = list.filter((item) => item.parentId === parentId);
    result.forEach((item) => {
      let children = this.convertLstAreaByOrder(list, item.id);
      item.children = children;
    });

    return result;
  }

  doActiveArea(group: any) {
    this.organizationIdActive=null;
    this.activeOrganization = '';
    this.countSelectedPoint = 0;
    this.organizationIdActive = group.id;
    this.activeOrganization = group.groupName;
    if (group.children.length == 0) {
       this.isShowMechantList = true;
       this.searchPointV2 = false;
       this.getLstMerchant();
         
    }else{
         this.isShowMechantList = false;
       this.searchPointV2 = false;
        this.pointSales = [];
    }
  }
  selectMearchant(event: any) {
    if (event.checked) {
      this.masterIdSelected = this.userInfo?.merchantId; 
      if (this.mTreeComponent) {
        this.mTreeComponent.checkAllItems(true);
      }
    } else {
      this.masterIdSelected = null;
         this.mTreeComponent.checkAllItems(false);
    }
  }

  getLstMerchant(firstSearch: boolean = false) {
    this.isSearch = true;
    if(this.searchOrganization.length==0){
      this.searchPointV2 =true;
    }
    let dataReq = {
      groupIdList: this.activeOrganization ? [this.organizationIdActive] : [],
      status: '',
      methodId: [],
      mappingKey: '',
    };
    let param = {
      size: 1000,
      keySearch: this.searchOrganization ? this.searchOrganization : null,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api
      .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
      .subscribe(
        (res: any) => {
          if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
            this.pointSales = res['data']['subInfo'];
            this.pointSales = res['data']['subInfo'].map((item: any) => ({
              ...item,
              formatAddress: fomatAddress([
                item.address,
                item.communeName,
                item.districtName,
                item.provinceName,
              ]),
            }));
            if (firstSearch) {
              if (this.pointSales.length == 1) {
                this.pointSalesSelected.add(this.pointSales[0].merchantId);
                this.typeUpdate = 1;
                this.getLstRole();
              } else {
                this.typeUpdate = 0;
              }
            }
            if (this.pointSalesSelected.size > 0) {
              this.pointSales.forEach((item: any) => {
                item.checked = this.pointSalesSelected.has(item.merchantId);
              });
              this.countSelectedPoint = this.pointSales.filter((x:any)=>x.checked).length;
            }
          } else {
            this.searchPointV2 =true;
            this.pointSales = [];
          }
        },
        (error: any) => {
          this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.');
        }
      );
  }
  doCheckGroup(event: any) {
    this.roleId = '';
    if (event.checked) {
      this.organizationSelected.push(event.id);
    } else {
      this.organizationSelected = this.organizationSelected.filter(
        (item: string) => item !== event.id
      );
    }
  }
  setUpMerchantIds(event: any) {
    if (event && Array.isArray(event)) {
      let dataChange = event.map((item) => item.merchantId);
      if (event[0]?.checked) {
        this.addListToSet(dataChange);
      } else {
        this.removeListFromSet(dataChange);
      }
    } else {
      if (event.checked) {
        this.pointSalesSelected.add(event?.merchantId);
      } else {
        this.pointSalesSelected.delete(event?.merchantId);
      }
    }
    this.roleId = '';
  if (this.mTreeComponent) {
        this.mTreeComponent.checkAllItems(false);
      }
    this.totalPointSalesSelected = this.pointSalesSelected.size;
  }
  radioSetUpMerchantIds(event: any) {
    this.pointSalesSelected.add(event.merchantId);
    this.totalPointSalesSelected = this.pointSalesSelected.size;
  }
  seletedPointSales(event: any) {
    console.log('seletedPointSales', event);
    if (this.gridViewComponent) {
      this.countSelectedPoint = event;
    } else {
      this.countSelectedPoint = 0;
    }
  }
  onRadioChange(event: any) {
    this.masterIdSelected = event;
    if (this.masterIdSelected) {
      this.pointSalesSelected = new Set();
    }
  }
  markChecked(parentList: any[], childList: any[]) {
    const childIds = new Set(childList.map((item) => item.id));
    parentList.forEach((item) => {
      item.checked = childIds.has(item.id);
    });
    return parentList;
  }

  addListToSet(listToAdd: number[]): void {
    listToAdd.forEach((item) => this.pointSalesSelected.add(item));
  }

  removeListFromSet(listToRemove: number[]): void {
    listToRemove.forEach((item) => this.pointSalesSelected.delete(item));
  }
  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
  }
  doNextStep(number: number = 0) {
    if (number == 1) {
      this.getLstRole();
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }
  doPreStep() {
    if (this.currentStep >= 0) {
      this.currentStep--;
    }
  }
  setRoleId(event: any) {
    this.roleId = event['id'];
  }
  clearValue(nameInput: string) {
    this.formInfo.get(nameInput)?.setValue('');
  }
  createPassword() {
    const newPassword = generatePassword();
    this.formInfo.get('userPass')?.setValue(newPassword);
  }
  copyPassword() {
    const password = this.formInfo.get('userPass')?.value;
    console.log(password);
    if (!password) return;

    navigator.clipboard
      .writeText(password)
      .then(() => {
        this.toast.showSuccess('Đã sao chép');
      })
      .catch(() => {
        this.toast.showError('Lỗi, Không thể sao chép!');
      });
  }

  returnSelected(item: any) {
    this.roleId = item['id'];
  }

  getLstRole() {
    let orgTypeCreate = 2;
    if (this.masterIdSelected) {
      orgTypeCreate = 0;
    }
    if (this.organizationSelected.length > 0) {
      orgTypeCreate = 1;
    }
    this.api
      .get(
        HR_ENDPOINT.GET_ROLE_BY_USER_LOGIN + '?newUserOrgType=' + orgTypeCreate
      )
      .subscribe((res) => {
        this.roles = res['data']['roleList'];
      });
  }

  trimValue(controlName: string) {
    const control = this.formInfo.get(controlName);
    if (control) {
      control.setValue(control.value.trim());
    }
  }
  createHr() {
    let params = this.formInfo.getRawValue();
    params['roleId'] = this.roleId;
    params['organizationInfo'] = {
      masterId:
        this.pointSalesSelected.size > 0 || this.organizationSelected.length > 0
          ? ''
          : this.masterIdSelected,
      merchantIds: Array.from(this.pointSalesSelected),
      groupIds:
        this.pointSalesSelected.size > 0 ? [] : this.organizationSelected,
    };
    this.api.post(HR_ENDPOINT.CREATE_HR, params).subscribe(
      (res) => {
        if (res['data']['emailChange']) {
          this.isHaveEmail = true;
        }
        this.isSuccess = 1;
        this.doNextStep();
      },
      (error) => {
        const errorData = error?.error || {};
        switch (errorData.soaErrorCode) {
          case 'USER_CREATION_ERROR_003':
            this.formInfo.get('userName')!.setErrors({ userNameExist: true });
            break;
          case 'USER_CREATION_ERROR_004':
            this.formInfo.get('emailChange')!.setErrors({ emailExist: true });
            break;
          case 'USER_CREATION_ERROR_005':
            this.formInfo
              .get('phoneNumber')!
              .setErrors({ phoneNumberExist: true });
            break;
          default:
            this.toast.showError(errorData?.soaErrorDesc);
            this.isSuccess = 0;
            this.doNextStep();
            break;
        }
      }
    );
  }

  onCancel() {
    let dataConfirm: DialogRoleModel = new DialogRoleModel();
    dataConfirm.title = `Hủy thêm mới nhân sự`;
    dataConfirm.message =
      'Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ thêm mới nhân sự không?';
    dataConfirm.icon = 'icon-error';
    dataConfirm.iconColor = 'error';
    dataConfirm.buttonRightColor = 'error';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '600px',
      data: dataConfirm,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/hr']);
      }
    });
  }

  getSelectedItemForRadio(): any {
    return this.roles.find((p: any) => p.id === this.roleId);
  }

  validateEmailPrefix(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    const parts = email.split('@');
    if (parts.length < 2) return null; // chưa có @ thì không kiểm tra

    const prefix = parts[0];

    // Kiểm tra ký tự hợp lệ và độ dài
    const isValidLength = prefix.length >= 4 && prefix.length <= 64;

    if (!isValidLength) {
      return {
        localPartLength: true,
      };
    }

    return null;
  }
}
