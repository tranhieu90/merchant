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
import { MatRadioModule } from '@angular/material/radio';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { environment } from '../../../../environments/environment';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { MTreeCheckboxComponent } from '../../../base/shared/m-tree-checkbox/m-tree-checkbox.component';
import { MTreeComponent } from '../../../base/shared/m-tree/m-tree.component';
import { TreeViewComponent } from '../../../base/shared/tree-view/tree-view.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { InputCommon } from '../../../common/directives/input.directive';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import {
  GROUP_ENDPOINT,
  HR_ENDPOINT,
  ORGANIZATION_ENDPOINT,
} from '../../../common/enum/EApiUrl';
import { REGEX_PATTERN } from '../../../common/enum/RegexPattern';
import {
  convertLstAreaByOrder,
  createTextboxItem,
  fomatAddress,
  generatePassword,
} from '../../../common/helpers/Ultils';
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
import { Subscription } from 'rxjs';
import { MERCHANT_RULES } from '../../../base/constants/authority.constants';
import { DirectiveModule } from '../../../base/module/directive.module';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
// import { TextControlComponent } from '../../../base/shared/component/text-control/text-control.component';
import { TextboxItem } from '../../../base/shared/models/item-form.model';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';

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
    DirectiveModule,
    TreeViewComponent,
    MatCheckboxModule,
    RadioButtonModule,
    MatTooltipModule,
    MatRadioModule,
    MTreeCheckboxComponent,
    InputSanitizeDirective
  ],
  templateUrl: './human-resource-create.component.html',
  styleUrl: './human-resource-create.component.scss',
})
export class HumanResourceCreateComponent implements OnInit {
  readonly MERCHANT_RULES = MERCHANT_RULES;
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
  pointSalesInitFirt: any = [];
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
  isSelectGroup: boolean = false;
  isShowSearchPointSales: boolean = false;
  checkGroupHasPoinSales: boolean = false;
  orgTypeInput?: number;
  _isNavigating: boolean = false;

  // lstGroupIdMerchant: any[] = [];
  selectedValue?: number = 0;
  showRadioButton?: boolean = true;
  isLockAccount?: boolean;
  actionType?: string;
  isLoading = true;
  pageIndex: number = 1;
  totalSub: number = 0;

  // $fullName!: TextboxItem;
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
    this.routeActive.queryParams.subscribe((params) => { });
  }
  private navigationSubscription!: Subscription;
  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    const verifyUser = this.auth.checkVerifyUserInfo();
    this.buildForm();
    //  this.$fullName = new TextboxItem({
    //   key: 'fullName',
    //   label: 'Họ và tên',
    //   placeholder: 'Nhập họ và tên',
    //   value: `form.get('fullName')`,
    //   required: true,
    //   readOnly: false,
    //   maxLength: 50,
    //   pattern: REGEX_PATTERN.FULL_NAME.source
    // });
    this.userInfo = this.auth.getUserInfo();
    console.log(this.userInfo);
    this.setDefaultSelectedRadio();

    if (this.userInfo?.isConfig == 0) {
      this.getLstMerchant(true);
    } else {
      this.typeUpdate = 2;
      if (this.userInfo.orgType != 2) this.doGetGroup();
      if (this.userInfo.orgType == 2) this.getLstMerchant(true);
    }
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this._isNavigating) {
          // this._isNavigating = true;
          if (event.url !== '/login') {
            this.onCancel(event.url);
            this.router.navigate([], {
              replaceUrl: true,
              queryParamsHandling: 'preserve',
            });
          }
        }
      }
    });
  }

  ngOnChanges(): void {
    this.checkShowTextSearchPoinsales();
  }

  setDefaultSelectedRadio() {
    this.masterIdSelected = this.userInfo.merchantId;
    if (this.userInfo.isConfig == 1 && this.userInfo.orgType == 1) {
      this.selectedValue = 1;
      this.masterIdSelected = null;
    }

    if (this.userInfo.isConfig == 1 && this.userInfo.orgType == 2) {
      this.selectedValue = 2;
      this.masterIdSelected = null;
    }

    if (this.userInfo.orgType == 2) {
      this.orgTypeInput = 2;
    }

    if (this.userInfo.orgType == 1) {
      this.orgTypeInput = 1;
    }

    if (this.userInfo.orgType == 0) {
      this.orgTypeInput = 0;
    }
  }

  columns: Array<GridViewModel> = [
    {
      name: 'id',
      label: 'ID',
      options: {
        width: '5%',
        customCss: (obj: any) => {
          return ['text-left', 'mw-100'];
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
          return ['text-left', 'mw-140'];
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
          return ['text-left', 'mw-160'];
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
          return ['text-left', 'mw-100'];
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
          return ['text-left', 'mw-120'];
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
          return ['text-left', 'mw-180'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
  ];
  buildForm() {
    this.formInfo = this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(REGEX_PATTERN.FULL_NAME),
        ],
      ],
      emailChange: [
        '',
        [
          Validators.maxLength(254),
          Validators.pattern(REGEX_PATTERN.EMAIL),
          this.validateEmailPrefix,
        ],
      ],
      phoneNumber: ['', [Validators.pattern(REGEX_PATTERN.PHONE)]],
      dateOfBirth: [''],
      userName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(REGEX_PATTERN.USER_NAME),
        ],
      ],
      userPass: ['', [Validators.required]],
    });
  }
  checkShowTextSearchPoinsales() {
    var group = this.organization.filter(
      (gr: any) => gr.id == this.organizationIdActive
    );
    if (group && group.chidren.length == 0 && this.pointSales.length > 0) {
      this.isShowMechantList = true;
    }
    this.isShowMechantList = false;
  }
  openCreateGroups() {
    window.open(
      this.assetPath + '/organization',
      '_blank',
      'noopener,noreferrer'
    );
  }
  doGetGroup() {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.organization = res.data;
          this.organizationSort = convertLstAreaByOrder(
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
  // convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
  //   let result = list.filter((item) => item.parentId === parentId);
  //   result.forEach((item) => {
  //     let children = this.convertLstAreaByOrder(list, item.id);
  //     item.children = children;
  //   });

  //   return result;
  // }

  doActiveArea(group: any) {
    // this.organizationIdActive = null;
    // this.activeOrganization = '';
    // this.countSelectedPoint = 0;
    // this.organizationIdActive = group.id;
    // this.activeOrganization = group.groupName;
    // this.isShowSearchPointSales = false;
    // if (group.children.length == 0) {
    //   this.getLstMerchant();
    //   setTimeout(() => {
    //     if (this.pointSales.length > 0) {
    //       this.isShowSearchPointSales = true;
    //     }
    //   }, 300)
    // } else {
    //   this.pointSales = [];
    // }
  }

  selectMearchant(event: any) {
    if (event.checked) {
      this.masterIdSelected = this.userInfo?.merchantId;
      if (this.mTreeComponent) {
        this.mTreeComponent.checkAllItems(true);
      }
      this.organizationSelected = [];
    } else {
      this.masterIdSelected = null;
      this.mTreeComponent.checkAllItems(false);
      this.organizationSelected = [];
    }
  }

  getLstMerchant(firstSearch: boolean = false) {
    this.isSearch = true;
    this.pageIndex = 1;
    let dataReq = {
      groupIdList: this.activeOrganization ? [this.organizationIdActive] : [],
      status: 'active',
      methodId: [],
      mappingKey: '',
    };
    this.searchOrganization = this.searchOrganization?.trim();
    let param = {
      page: this.pageIndex,
      size: 10,
      keySearch: this.searchOrganization ? this.searchOrganization : null,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api
      .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
      .subscribe(
        (res: any) => {
          if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
            this.totalSub = res['data']['totalSub'];
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
              this.pointSalesInitFirt = this.pointSales;
              if (this.pointSales.length == 1) {
                this.pointSalesSelected.add(this.pointSales[0].merchantId);
                this.typeUpdate = 1;
                this.getLstRole();
              } else {
                this.typeUpdate = 0;
              }
            } else {
              this.isShowMechantList = true;
            }
            if (this.pointSalesSelected.size > 0) {
              this.pointSales.forEach((item: any) => {
                item.checked = this.pointSalesSelected.has(item.merchantId);
              });
              this.countSelectedPoint = this.pointSales.filter(
                (x: any) => x.checked
              ).length;
            }
          } else {
            this.pointSales = [];
          }
          if (firstSearch) {
            if (
              (this.userInfo.isConfig == 1 &&
                this.userInfo.orgType === 2 &&
                this.pointSales.length === 1) ||
              (this.userInfo.isConfig == 0 &&
                this.userInfo.orgType === 2 &&
                this.pointSales.length === 1) ||
              (this.userInfo.isConfig == 0 &&
                this.userInfo.orgType === 0 &&
                this.pointSales.length === 0)
            ) {
              this.getLstRole();
            }

            if (
              this.userInfo.isConfig == 0 &&
              this.userInfo.orgType === 0 &&
              this.pointSales.length > 0
            ) {
              this.orgTypeInput = 2;
              this.showRadioButton = false;
            }
          }
          this.checkAndSetShowView();
        },
        (error: any) => {
          const errorData = error?.error || {};
          this.checkRequetsError(errorData);
        }
      );
  }

  checkRequetsError(errorData: any) {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    switch (errorData.soaErrorCode) {
      case 'LOGIN_ERROR_006':
        dataDialog.title = 'Tài khoản đang bị khoá';
        dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
        dataDialog.buttonLabel = 'Tôi đã hiểu';
        dataDialog.icon = 'icon-lock';
        dataDialog.width = '25%';
        dataDialog.viewCancel = false;
        dataDialog.iconColor = 'icon warning';
        this.isLockAccount = true;
        this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
          if (result) {
            this.router.navigate(['/login'], {});
          }
        });
        break;
      case 'LOGIN_ERROR_009':
        dataDialog.title = 'Merchant mất kết nối';
        dataDialog.message =
          'Merchant mất kết nối sử dụng dịch vụ, vui lòng liên hệ quản trị viên để được hỗ trợ.';
        dataDialog.buttonLabel = 'Tôi đã hiểu';
        dataDialog.icon = 'icon-lock';
        dataDialog.width = '25%';
        dataDialog.viewCancel = false;
        this.isLockAccount = true;
        this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
          if (result) {
            this.router.navigate(['/login'], {});
          }
        });
        break;
      case 'USER_ERROR_002':
        dataDialog.title = 'Người dùng không tồn tại hoặc đang bị khóa';
        dataDialog.message = 'Vui long liên hệ quản trị viên để được hỗ trợ.';
        dataDialog.buttonLabel = 'Tôi đã hiểu';
        dataDialog.icon = 'icon-lock';
        dataDialog.width = '25%';
        dataDialog.viewCancel = false;
        dataDialog.iconColor = 'icon warning';
        this.isLockAccount = true;
        this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
          if (result) {
            this.router.navigate(['/hr'], {});
          }
        });
        break;
      case '4002':
        dataDialog.title = 'Tài khoản đang bị khoá';
        dataDialog.message = 'Vui lòng liên hệ Quản trị viên để được hỗ trợ.';
        dataDialog.buttonLabel = 'Tôi đã hiểu';
        dataDialog.icon = 'icon-lock';
        dataDialog.width = '25%';
        dataDialog.viewCancel = false;
        dataDialog.iconColor = 'icon warning';
        this.isLockAccount = true;
        this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
          if (result) {
            this.router.navigate(['/login'], {});
          }
        });
        break;
      case 'SYSTEM_ERROR':
        dataDialog.title = 'Lỗi hệ thống';
        dataDialog.message =
          'Hệ thống đang bị gián đoạn. Vui lòng thử lại hoặc liên hệ quản trị viên để được hỗ trợ.';
        dataDialog.buttonLabel = 'Tôi đã hiểu';
        dataDialog.icon = 'icon-error';
        dataDialog.width = '25%';
        dataDialog.viewCancel = false;
        dataDialog.iconColor = 'error';
        this.isLockAccount = true;
        this.dialogCommon.openDialogInfo(dataDialog).subscribe((result) => {
          if (result) {
          }
        });
        break;
      default:
        this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  }

  checkAndSetShowView() {
    if (this.userInfo.orgType === 2 && this.pointSales.length === 1) {
      this.pointSalesSelected.add(this.pointSales[0].merchantId);
    }

    if (
      this.userInfo.isConfig === 0 &&
      this.userInfo.orgType === 0 &&
      this.pointSales.length === 0
    ) {
      this.masterIdSelected = this.userInfo.merchantId;
    }
  }

  doCheckDisableAnotherlevel(level: number, parentId?: any) {
    this.organization.forEach((item: any) => {
      if (item.level != level) {
        item.disabled = true;
      }

      if (item.level == level && item?.parentId != parentId) {
        item.disabled = true;
      }
    });
    this.organizationSort = convertLstAreaByOrder(
      this.organization,
      this.organization[0].parentId
    );
  }
  doCheckUnDisableAnotherlevel(level: number, parentId?: any) {
    if (this.organizationSelected.length == 0) {
      this.organization.forEach((item: any) => {
        if (item.level != level) {
          item.disabled = false;
        }

        if (item.level == level && item?.parentId != parentId) {
          item.disabled = false;
        }
      });
      this.organizationSort = convertLstAreaByOrder(
        this.organization,
        this.organization[0].parentId
      );
    }
  }
  doCheckGroup(event: any) {
    console.log(event);
    this.toggleChildren(event);
    this.roleId = '';
    this.isSelectGroup = false;
    this.isShowSearchPointSales = false;
    if (event.checked) {
      this.organizationSelected.push(event.id);
      this.isSelectGroup = true;
      this.pointSalesSelected = new Set();
      if (event.children.length == 0) {
        this.isSelectGroup = true;
        // this.getLstMerchant();
        setTimeout(() => {
          if (this.pointSales.length > 0) {
            this.isShowSearchPointSales = true;
          }
          this.countSelectedPoint = this.pointSales.length;
        }, 200);
        setTimeout(() => {
          if (this.gridViewComponent) {
            this.gridViewComponent.doCheckAllPointSales();
          }
        }, 500);
      } else {
        this.pointSales = [];
      }
      this.doCheckDisableAnotherlevel(event.level, event.parentId);
    } else {
      this.organizationSelected = this.organizationSelected.filter(
        (item: string) => item !== event.id
      );
      this.isSelectGroup = false;
      if (event.children.length == 0) {
        this.countSelectedPoint = 0;
        this.pointSales = [];
      }
      this.doCheckUnDisableAnotherlevel(event.level, event.parentId);
    }
  }
  setUpMerchantIds(event: any) {
    // if (this.gridViewComponent) {
    //   this.gridViewComponent.doUnCheckAllPointSales();
    // }

    if (event && Array.isArray(event)) {
      let dataChange = event.map((item) => item.merchantId);
      // let groupId = event.map((item) => item.groupId);
      if (event[0]?.checked) {
        this.addListToSet(dataChange);
        // groupId.forEach((id) => this.lstGroupIdMerchant?.push(id));
      } else {
        this.removeListFromSet(dataChange);
        // groupId.forEach((id) => {
        //   const index = this.lstGroupIdMerchant?.indexOf(id);
        //   if (index !== undefined && index !== -1) {
        //     this.lstGroupIdMerchant?.splice(index, 1);
        //   }
        // });
      }
    } else {
      if (event.checked) {
        this.pointSalesSelected.add(event?.merchantId);
        // this.lstGroupIdMerchant?.push(event?.groupId);
      } else {
        this.pointSalesSelected.delete(event?.merchantId);
        // const index = this.lstGroupIdMerchant?.indexOf(event?.groupId);
        // if (index !== undefined && index !== -1) {
        //   this.lstGroupIdMerchant?.splice(index, 1);
        // }
      }
    }
    this.roleId = '';
    if (this.mTreeComponent) {
      this.mTreeComponent.checkAllItems(false);
    }

    this.totalPointSalesSelected = this.pointSalesSelected.size;
    // this.markChecked(this.organizationSort, this.lstGroupIdMerchant);
  }
  radioSetUpMerchantIds(event: any) {
    this.pointSalesSelected.clear();
    this.pointSalesSelected.add(event.merchantId);
    this.totalPointSalesSelected = this.pointSalesSelected.size;
  }
  seletedPointSales(event: any) {
    if (this.gridViewComponent) {
      this.countSelectedPoint = event;
    } else {
      this.countSelectedPoint = 0;
    }
  }
  onRadioChange(event: any) {
    this.searchOrganization = '';
    this.orgTypeInput = +event;
    if (event == 2) {
      if (this.userInfo.isConfig == 0 && this.userInfo.orgType === 0) {
        this.showRadioButton = true;
      }
      if (this.pointSales?.length == 0) {
        this.getLstMerchant(true);
      } else {
        this.getLstMerchant();
      }
    }

    if (event == 0) {
      this.masterIdSelected = this.userInfo.merchantId;
      if (this.userInfo.isConfig == 0 && this.userInfo.orgType === 0) {
        this.orgTypeInput = 2;
        this.showRadioButton = false;
        this.getLstMerchant();
      }
    } else {
      this.masterIdSelected = null;
    }

    // this.masterIdSelected = event;
    // if (this.masterIdSelected) {
    //   this.pointSalesSelected = new Set();
    // }
  }
  // markChecked(parentList: any[], childList: any[]) {
  //   const childIds = new Set(childList.map((item) => item.id));
  //   parentList.forEach((item) => {
  //     item.checked = childIds.has(item.id);
  //   });
  //   return parentList;
  // }

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
    if (this.currentStep > 0) {
      this.currentStep--;
    } else {
      this.onCancel();
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

  copyPasswordExt(event: any) {
    console.log(event)
  }

  copyPassword() {
    const password = this.formInfo.get('userPass')?.value;
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
    let orgTypeCreate = 0;
    // if (this.masterIdSelected) {
    //   orgTypeCreate = 0;
    // }
    // if (this.organizationSelected.length > 0) {
    //   orgTypeCreate = 1;
    // }

    if (this.orgTypeInput == 1) {
      orgTypeCreate = 1;
    }

    if (this.orgTypeInput == 2) {
      orgTypeCreate = 2;
    }

    if (this.orgTypeInput == 2 && !this.showRadioButton) {
      orgTypeCreate = 0;
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
  allowPattern(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    let pattern: RegExp = /.*/;
    let maxLength = 254;

    switch (target?.id) {
      case 'email':
        pattern = REGEX_PATTERN.EMAIL_EXT;
        maxLength = 254;
        break;
      case 'userName':
        pattern = REGEX_PATTERN.USER_NAME_EXT;
        maxLength = 50;
        break;
      case 'fullName':
        pattern = REGEX_PATTERN.FULL_NAME_EXT;
        maxLength = 50;
        break;
    }
    if (
      !pattern.test(event.key) ||
      (event.key === ' ' && target?.id !== 'fullName') ||
      target.value.length >= maxLength
    ) {
      event.preventDefault();
    }
  }
  createHr() {
    const isVerify = CommonUtils.checkVerifyAccount(this.dialog, this.router, this.auth, this.api, this.dialogCommon);
    if (isVerify) {
      let params = this.formInfo.getRawValue();
      if (params['dateOfBirth']) {
        params['dateOfBirth'] = moment(params['dateOfBirth']).format(
          'DD/MM/YYYY'
        );
      }
      params['roleId'] = this.roleId;
      params['actionType'] = this.orgTypeInput == 2 ? this.actionType : undefined
      params['organizationInfo'] = {
        masterId:
          this.selectedValue == 0 ? this.masterIdSelected
            : undefined,
        merchantIds: this.selectedValue == 2 ? this.actionType == "ALL" ? undefined : Array.from(this.pointSalesSelected) : undefined,
        groupIds:
          this.selectedValue == 1
            ? this.organizationSelected
            : undefined,
      };
      this.api.post(HR_ENDPOINT.CREATE_HR, params).subscribe(
        (res) => {
          if (res['data']['emailChange']) {
            this.isHaveEmail = true;
          }
          this.isSuccess = 1;
          this._isNavigating = true;
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
    } else {
      this._isNavigating = true;
    }

  }

  onCancel(url?: string) {
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
      if (result === true) {
        this._isNavigating = true;
        if (url) {
          this.router.navigateByUrl(url);
        } else {
          this.router.navigate(['/hr']);
        }
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

  markChecked(parentList: any[], childList: number[]): any[] {
    if (parentList?.length && childList?.length) {
      this.flatParentGroup(parentList, childList);

      // const childIds = new Set(childList);
      // parentList.forEach((item) => {
      //   if (this.pointSalesSelected.size > 0 && childIds.has(item.id)) {
      //     item.checked = 'partial';
      //   } else {
      //     item.checked = childIds.has(item.id);
      //   }
      // });
    } else if (parentList?.length) {
      parentList.forEach((item) => {
        item.checked = false;
      });
    }
    return parentList;
  }

  flatParentGroup(parentList: any[], childList: number[]) {
    parentList.forEach((item) => {
      const childIds = new Set(childList);
      if (item?.children?.length > 0) {
        this.flatParentGroup(item?.children, childList);
      }
      if (this.pointSalesSelected.size > 0 && childIds.has(item.id)) {
        item.checked = 'partial';
      } else {
        item.checked = childIds.has(item.id);
      }
    });
  }

  doActiveAreaCheckbox(group: any) {
    this.organizationSort.forEach((i: any) => {
      if (i !== group) i.expanded = false;
    });
  }

  toggleChildren(item: any) {
    if (item.children) {
      item.children.forEach((child: any) => {
        child.checked = item.checked;
        this.toggleChildren(child);
      });
    }
  }

  getSelectedItemForRadioGridView(): any {
    if (this.pointSales.length > 0)
      return this.pointSales.find(
        (p: any) =>
          p.merchantId === +this.pointSalesSelected.values().next().value
      );
  }

  checkDisableButton(): boolean {
    if (this.orgTypeInput == 1 && this.organizationSelected.length === 0) {
      return true;
    }

    if (this.orgTypeInput == 0 && !this.masterIdSelected) {
      return true;
    }

    if (
      !this.masterIdSelected &&
      this.orgTypeInput == 2 &&
      this.totalPointSalesSelected == 0 &&
      this.pointSalesSelected.size === 0
    ) {
      return true;
    }
    return false;
  }

  setActionType(data: boolean) {
    if (data) {
      this.actionType = "ALL"
    } else {
      this.actionType = ""
    }
  }

  lazyLoadData(e: any) {
    const tableViewHeight = e.target.offsetHeight
    const tableScrollHeight = e.target.scrollHeight
    const scrollLocation = e.target.scrollTop;

    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit && this.isLoading) {
      this.isLoading = false;
      this.pageIndex++;
      let dataReq = {
        groupIdList: [] as number[],
        status: 'active',
        methodId: [],
        mappingKey: '',
      };
      this.searchOrganization = this.searchOrganization?.trim();
      let param = {
        page: this.pageIndex,
        size: 10,
        keySearch: this.searchOrganization ? this.searchOrganization : null,
      };
      let buildParams = CommonUtils.buildParams(param);
      this.api
        .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
        .subscribe(
          (res: any) => {
            if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
              let dataGroup = res['data']['subInfo'].map((item: any) => ({
                ...item,
                formatAddress: fomatAddress([
                  item.address,
                  item.communeName,
                  item.districtName,
                  item.provinceName,
                ]),
              }));

              if (this.actionType == "ALL") {
                dataGroup.forEach((item: any) => {
                  item.checked = true;
                  this.pointSalesSelected.add(item?.merchantId);
                });
              } else {
                if (this.pointSalesSelected.size > 0) {
                  dataGroup.forEach((item: any) => {
                    item.checked = this.pointSalesSelected.has(item.merchantId);
                  });
                  this.countSelectedPoint = this.pointSales.filter(
                    (x: any) => x.checked
                  ).length;
                }
              }
              this.pointSales = this.pointSales.concat(dataGroup);
              this.isLoading = true;

            } else {
              this.isLoading = false;
            }
          }
        );
    }
  }
}
