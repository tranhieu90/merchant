import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { CommonModule, ɵnormalizeQueryParams } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatStep, MatStepper, MatStepperIcon } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { InputCommon } from '../../../common/directives/input.directive';
import { GROUP_ENDPOINT, HR_ENDPOINT, ORGANIZATION_ENDPOINT, ROlE_ENDPOINT } from '../../../common/enum/EApiUrl';
import { REGEX_PATTERN } from '../../../common/enum/RegexPattern';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { GridViewModel } from '../../../model/GridViewModel';
import _ from 'lodash';
import { MTreeComponent } from '../../../base/shared/m-tree/m-tree.component';
import { DialogRoleComponent, DialogRoleModel } from '../../role-management/dialog-role/dialog-role.component';
import { generatePassword } from '../../../common/helpers/Ultils';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { IPersonelUpdate } from '../../../model/ma/personel.model';
@Component({
  selector: 'app-human-resource-update-v2',
  standalone: true,
  imports: [
    Button,
    InputCommon,
    InputTextModule,
    InputTextareaModule,
    MatButton,
    MatStep,
    MatStepper,
    MatStepperIcon,
    PaginatorModule,
    ReactiveFormsModule,
    GridViewComponent,
    CalendarModule,
    CommonModule,
    MTreeComponent, MatCheckboxModule, RadioButtonModule,
  ],
  templateUrl: './human-resource-update-v2.component.html',
  styleUrl: './human-resource-update-v2.component.scss'
})
export class HumanResourceUpdateV2Component implements OnInit {
  @ViewChild('gridViewRef') gridViewComponent!: GridViewComponent;
  id!: number;
  totalItem: number = 0;
  currentStep: number = 0;
  isSearch: boolean = false;
  maxDate: Date = new Date();
  lstDataRole: any = [];
  roleId: string = '';
  isSuccess: number = 0;
  isHaveEmail: boolean = false;
  userInfo!: any;
  userId?: number;
  roles: any = [];
  pointSales: any = [];
  organization: any = [];
  organizationSort: any = [];
  organizationIdActive: number | null = null;
  typeUpdate!: number;
  searchOrganization: string = '';
  masterIdSelected: number | null = null;
  pointSalesSelected: Set<any> = new Set();
  organizationSelected: any = [];

  selectedMerchantDefault?: any;
  merchantIdsSelectedAdd: any = [];
  merchantIdsSelectedDelete: any = [];
  masterIdSelectedDefault?: number;
  masterIdSelectedAdd?: number;
  masterIdSelectedDelete?: number;
  roleIdDefault: string = '';
  disableRadio: boolean = false;
  isUpdateRole: boolean = false;

  totalPointSalesSelected: number = 0;
  countSelectedPoint: number = 0;
  activeOrganization: string = '';
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
    this.routeActive.queryParams.subscribe(params => {
    })
    const navigation = this.router.getCurrentNavigation();
    this.selectedMerchantDefault = navigation?.extras.state?.['selectedMerchant'];
    this.userId = navigation?.extras.state?.['userId'];
    this.roleIdDefault = navigation?.extras.state?.['roleId'];
    const groupList = navigation?.extras.state?.['groupList'];
    if (groupList) {
      this.masterIdSelectedDefault = this.auth.getUserInfo().merchantId;
    }
  }

  ngOnInit(): void {
    this.userInfo = this.auth.getUserInfo();
    this.doGetPointSales();
    // if (this.userInfo && this.userInfo?.orgType == 2) {
    //   this.doGetPointSales();
    // }
    //  this.typeUpdate=2;
    //  this.organizationIdActive=495;
    //  this.getLstMerchant();
    if (this.userInfo?.isConfig == 0) {
      this.typeUpdate = 0;
    } else {
      this.typeUpdate = 2;
      this.doGetGroup();
    }
  }

  columns: Array<GridViewModel> = [
    {
      name: 'id',
      label: 'ID',
      options: {
        width: '10%',
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return value ? `# ${value}` : ''
        },
      }
    },
    {
      name: 'name',
      label: 'TÊN VAI TRÒ',
      options: {
        width: '25%',
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
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
      }
    }
  ];

  columnsMerchant: Array<GridViewModel> = [
    {
      name: 'merchantId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'merchantName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'address',
      label: 'ĐỊA CHỈ',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      }
    },
  ];


  doGetPointSales() {
    // this.api.post(GROUP_ENDPOINT.GET_POINT_SALE).subscribe((res: any) => {
    //   if (res['data']['subInfo']) {
    //     this.pointSales = res['data']['subInfo'];
    //     if(this.pointSales.length == 1 ) {
    //       this.pointSalesSelected.add(this.pointSales[0].merchantId);
    //       this.typeUpdate = 1;
    //       this.getLstRole();
    //     }
    //   }
    // }, (error: any) => {
    //   this.pointSales = [];
    //   this.toast.showError('Lấy danh sách điểm bán xảy ra lỗi')
    // });

    this.api.post(HR_ENDPOINT.GET_SUB, {
      userId: this.userInfo.id,
      page: 1,
      size: 10

    }).subscribe(res => {
      this.pointSales = res['data']['getPushSubInfos'];
    });
  }

  doGetGroup() {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.organization = res.data;
          this.organizationSort = this.convertLstAreaByOrder(res.data, res.data[0].parentId);
        }
      }, (error: any) => {
        this.toast.showError('Lấy danh sách nhóm xảy ra lỗi')
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

  doActiveArea(group: any) {
    if (group && group.children.length == 0) {
      this.organizationIdActive = group.id;
      this.getLstMerchant();
      this.seletedPointSales();
      this.activeOrganization = group.groupName;
    }
  }

  selectMearchant(event: any) {
    if (event.checked) {
      this.masterIdSelected = this.userInfo?.merchantId;
    } else {
      this.masterIdSelected = null;
    }
  }

  getLstMerchant() {
    this.isSearch = true;
    let dataReq = {
      groupIdList: [this.organizationIdActive],
      status: "",
      methodId: [],
      mappingKey: ""
    }

    let param = {
      page: 1,
      size: 1000,
      keySearch: this.searchOrganization ? this.searchOrganization : null
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api.post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams).subscribe((res: any) => {
      if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
        this.pointSales = res['data']['subInfo'];
        if (this.pointSalesSelected.size > 0) {
          this.pointSales.forEach((item: any) => {
            item.checked = this.pointSalesSelected.has(item.merchantId);
          });
        }
      } else {
        this.pointSales = []
      }
    }, (error: any) => {
      this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.')
    });
  }

  doCheckGroup(event: any) {
    if (event.checked) {
      this.organizationSelected.push(event.id);
    } else {
      this.organizationSelected = this.organizationSelected.filter((item: string) => item !== event.id);
    }
  }

  setUpMerchantIds(event: any) {
    if (event && Array.isArray(event)) {
      let dataChange = event.map((item) => item.merchantId);
      if (event[0]?.checked) {
        this.addListToSet(dataChange);
      }
    }
  }

  seletedPointSales() {
    if (this.gridViewComponent) {
      // this.countSelectedPoint = this.gridViewComponent.selectedItemCount;
    } else {
      this.countSelectedPoint = 0;
    }
  }

  onRadioChange(event: any) {
    if (event) {
      this.disableRadio = true;
      this.masterIdSelectedAdd = event;
      if (this.masterIdSelectedAdd === this.masterIdSelectedDefault) {
        this.masterIdSelectedAdd = undefined;
      }

      if (this.selectedMerchantDefault) {
        this.merchantIdsSelectedDelete = Array.of(this.selectedMerchantDefault);
      }
      // this.masterIdSelected = this.userInfo?.merchantId;
    } else {
      this.masterIdSelectedDelete = this.masterIdSelectedDefault
      this.disableRadio = false;
      this.masterIdSelectedAdd = undefined;
      if (this.selectedMerchantDefault) {
        this.merchantIdsSelectedAdd = Array.of(this.selectedMerchantDefault);
      }
      // this.masterIdSelected = null;
    }
  }

  markChecked(parentList: any[], childList: any[]) {
    const childIds = new Set(childList.map(item => item.id));
    parentList.forEach(item => {
      item.checked = childIds.has(item.id);
    });
    return parentList;
  }

  addListToSet(listToAdd: number[]): void {
    listToAdd.forEach(item => this.pointSalesSelected.add(item));
  }

  removeListFromSet(listToRemove: number[]): void {
    listToRemove.forEach(item => this.pointSalesSelected.delete(item));
  }

  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
  }

  setRoleId(event: any) {
    this.roleId = event['id'];
    this.isUpdateRole = false;
  }

  doNextStep(number: number = 0) {
    if (number == 1) {
      if (this.masterIdSelected) {
        if (this.masterIdSelected !== this.selectedMerchantDefault) {
          this.isUpdateRole = true;
        } else {
          this.isUpdateRole = false;
        }
      }

      if (this.merchantIdsSelectedAdd.length > 0) {
        const exist = this.merchantIdsSelectedAdd.some((a: any) => a === this.selectedMerchantDefault);
        if (!exist) {
          this.isUpdateRole = true;
        } else {
          this.isUpdateRole = false;
        }
      }

      this.getLstRole();
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  doNextStepSubmit() {
    const param: IPersonelUpdate = {
      userId: this.userId,
      roleId: this.roleId ? +this.roleId : +this.roleIdDefault,
      // oraganizationInfo: {
      //   masterId: (this.masterIdSelected !== null && this.masterIdSelected !== undefined) ? this.masterIdSelected : undefined,
      //   merchantIds: this.merchantIdsSelectedAdd?.length > 0 ? this.merchantIdsSelectedAdd : []
      // },
      // oraganizationDelete: {
      //   merchantIds: (this.merchantIdsSelectedAdd?.length === 0 && this.masterIdSelected === null) ? [] : (this.selectedMerchant ? Array.of(this.selectedMerchant) : []),
      // }
    }

    if (this.masterIdSelectedDelete || this.merchantIdsSelectedDelete.length > 0) {
      param.oraganizationDelete = {
        masterId: (this.masterIdSelectedDelete !== null && this.masterIdSelectedDelete !== undefined) ? this.masterIdSelectedDelete : undefined,
        merchantIds: this.merchantIdsSelectedDelete?.length > 0 ? this.merchantIdsSelectedDelete : [],
      }
    }

    if (this.masterIdSelectedAdd || this.merchantIdsSelectedAdd.length > 0) {
      param.oraganizationInfo = {
        masterId: (this.masterIdSelectedAdd !== null && this.masterIdSelectedAdd !== undefined) ? this.masterIdSelectedAdd : undefined,
        merchantIds: this.merchantIdsSelectedAdd?.length > 0 ? this.merchantIdsSelectedAdd : [],
      }
    }

    this.api.post(HR_ENDPOINT.UPDATE_HR, param).subscribe(res => {
      this.isSuccess = res.data.status;
    }, () => {
      this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
    })

    if (this.currentStep < 3) {
      this.currentStep++;
    }

  }

  doPreStep() {
    if (this.currentStep >= 0) {
      this.currentStep--;
    }
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
    let params = {
      newUserOrgType: orgTypeCreate,
    }
    let buildParams = CommonUtils.buildParams(params);
    this.api.get(HR_ENDPOINT.GET_ROLE_BY_USER_LOGIN + "?newUserOrgType=" + orgTypeCreate).subscribe(res => {
      this.roles = res['data']['roleList'];
    })
  }

  doSearch(pageInfo?: any) {
    this.totalItem = 10;
  }

  doSearchRoles() {
    this.isSearch = true;
    let param = {
      keyword: null,
      pageIndex: 0,
      pageSize: 1000,
    };

    let buildParams = CommonUtils.buildParams(param);
    this.api.get(ROlE_ENDPOINT.SEARCH_LIST_ROLE, buildParams).subscribe(res => {
      this.roles = res['data']['list'];
      this.totalItem = res['data']['count'];
    }, (error) => {
      this.toast.showError('Lấy danh sách vai trò xảy ra lỗi');
    });
  }

  onCancel() {
    let dataConfirm: DialogRoleModel = new DialogRoleModel();
    dataConfirm.title = `Hủy cập nhật nhân sự`;
    dataConfirm.message = 'Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ cập nhật nhân sự không?';
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

    })
  }

  getSelectedItemForRadio(): any {
    return this.pointSales.find((p: any) => p.merchantId === this.selectedMerchantDefault);
  }

  getSelectedItemRoleForRadio(): any {
    return this.roles.find((p: any) => p.id === this.roleIdDefault);
  }

  onSelectedItemChange(event: any) {
    this.merchantIdsSelectedAdd = Array.of(event.merchantId);
  }
}
