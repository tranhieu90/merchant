import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { InputCommon } from '../../../common/directives/input.directive';
import { REGEX_PATTERN } from '../../../common/enum/RegexPattern';
import { ToastService } from '../../../common/service/toast/toast.service';
import { GridViewModel } from '../../../model/GridViewModel';
import {
  DialogRoleComponent,
  DialogRoleModel,
} from '../../role-management/dialog-role/dialog-role.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import {
  GROUP_ENDPOINT,
  HR_ENDPOINT,
  ORGANIZATION_ENDPOINT,
  ROlE_ENDPOINT,
} from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { AreaModel } from '../../../model/AreaModel';
import { AreaItemComponent } from '../../organization-management/area-item/area-item.component';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { MTreeComponent } from '../../../base/shared/m-tree/m-tree.component';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { clone } from 'lodash';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { IPersonelUpdate } from '../../../model/ma/personel.model';
import { environment } from '../../../../environments/environment';
import { fomatAddress } from '../../../common/helpers/Ultils';
@Component({
  selector: 'app-human-resource-update',
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
    // AreaItemComponent,
    CommonModule,
    TreeModule,
    MatCheckboxModule,
    RadioButtonModule,
    MTreeComponent,
  ],
  templateUrl: './human-resource-update.component.html',
  styleUrl: './human-resource-update.component.scss',
})
export class HumanResourceUpdateComponent implements OnInit {
  assetPath = environment.assetPath;
  id!: number;
  totalItem: number = 0;
  currentStep: number = 0;
  isSearch: boolean = false;
  maxDate: Date = new Date();
  userInfo!: any;
  typeUpdate!: number;
  lstAreas: AreaModel[] = [];

  listgroupIdInMerchant?: number[] = [];
  lstAreaByOrder: AreaModel[] = [];
  areaActive: AreaModel = new AreaModel();
  subMerchantList?: any;
  treeNodes?: any;
  keyWord!: string;
  groupList: any = [];
  groupListClone: any = [];
  roleId!: number;
  userId!: number;
  activeItemId: number | null = null;
  merchantIds: Set<number> = new Set();
  merchantIdsClone: Set<number> = new Set();
  totalMerchant: number = 0;
  totalSelect: number = 0;
  groupNameSelect!: string;
  totalSubmerchant: number = 0;
  isDisableCheckbox: boolean = false;
  pointSales: any = [];
  selectedMerchantDefault?: any;
  merchantIdsSelectedAdd: any = [];
  merchantIdsSelectedDelete: any = [];
  masterIdSelectedDefault?: number;
  masterIdSelectedAdd?: number;
  masterIdSelectedDelete?: number;
  roleIdDefault: string = '';
  disableRadio: boolean = false;
  isUpdateRole: boolean = false;
  masterIdSelected: number | null = null;
  searchOrganization: string = '';
  organizationSelected: any = [];
  isSuccess: number = 0;
  isHaveEmail: boolean = false;
  lstGroupInsert: any;
  lstGroupDelete: any;
  masterId?: number;
  orgTypeUser!: number;
  isCheckboxMerchant: boolean = false;
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
    const state = this.router.getCurrentNavigation()?.extras.state;
    const personData = state?.['dataInput'];
    if (personData) {
      this.roleId = personData.roleId;
      this.userId = personData.userId;
      this.selectedMerchantDefault = personData?.selectedMerchant;
      this.roleIdDefault = personData.roleId;
      this.orgTypeUser = personData.orgType;
      this.masterId = personData.masterId;
      const groupList = personData?.groupList;
      if (groupList) {
        this.masterIdSelectedDefault = this.auth.getUserInfo().merchantId;
      }
    }
  }

  ngOnInit(): void {
    this.userInfo = this.auth.getUserInfo();
    if (this.userInfo?.isConfig == 0) {
      this.typeUpdate = 0;
      this.getLstMerchant();
    } else if (this.userInfo?.isConfig == 1) {
      if (this.userInfo?.orgType == 2) {
        forkJoin({
          lstMerchant: this.getLstMerchantObs(),
          pointSales: this.doGetPointSalesObs(),
        }).subscribe({
          next: ({ lstMerchant, pointSales }) => {
            this.subMerchantList = lstMerchant;
            this.pointSales = pointSales;
            if (this.subMerchantList?.length == 1) {
              this.typeUpdate = 1;
              this.groupNameSelect = this.subMerchantList[0]?.merchantBizName;
            } else {
              this.typeUpdate = 4;
              this.merchantIds = new Set(
                pointSales.map((item: any) => Number(item.merchantId))
              );
              this.merchantIdsClone = clone(this.merchantIds);
              if (this.merchantIdsClone.size > 0) {
                this.totalSelect = 0;
                this.subMerchantList.forEach((item: any) => {
                  item.checked = this.merchantIdsClone.has(item.merchantId);
                  if (this.merchantIdsClone.has(item.merchantId)) {
                    this.totalSelect++;
                  }
                });
              }
            }
          },
          error: (err) => {
            console.error('Lỗi khi load dữ liệu:', err);
          },
        });
      } else {
        this.typeUpdate = 2;
        if (this.orgTypeUser == 2) {
          forkJoin({
            lstAreas: this.doGetGroupListLogin(),
            pointSales: this.doGetPointSalesObs(),
          }).subscribe({
            next: ({ lstAreas, pointSales }) => {
              this.lstAreas = lstAreas;
              this.pointSales = pointSales;
              const uniqueGroupIds = Array.from(
                new Set(pointSales.map((item: any) => Number(item.groupId)))
              );
              if (pointSales.length > 0) {
                this.isDisableCheckbox = true;
              }
              this.groupListClone = [...uniqueGroupIds];

              this.merchantIds = new Set(
                pointSales.map((item: any) => Number(item.merchantId))
              );
              this.merchantIdsClone = clone(this.merchantIds);
              // this.totalMerchant = this.merchantIds.size;
              this.activeItemId = this.groupListClone[0];
              this.getLstMerchantWithCheckedObs(true).subscribe((merchantList) => {
                const resultMarsk = this.markChecked(
                  this.lstAreas,
                  this.groupListClone
                );
                this.lstAreaByOrder = this.convertLstAreaByOrder(
                  resultMarsk,
                  resultMarsk[0]?.parentId
                );
              });
              // this.getLstMerchant();
            },
            error: (err) => {
              console.error('Lỗi khi load dữ liệu:', err);
            },
          });
        } else if (this.orgTypeUser == 1) {
          forkJoin({
            lstAreas: this.doGetGroupListLogin(),
            groupList: this.getGroupListUserUpdate(this.userId),
          }).subscribe({
            next: ({ lstAreas, groupList }) => {
              this.lstAreas = lstAreas;
              this.groupList = groupList;
              this.groupListClone = clone(this.groupList);
              const resultMarsk = this.markChecked(
                this.lstAreas,
                this.groupList
              );
              this.lstAreaByOrder = this.convertLstAreaByOrder(
                resultMarsk,
                resultMarsk[0]?.parentId
              );
            },
            error: (err) => {
              console.error('Lỗi khi load dữ liệu:', err);
            },
          });
        } else {
          this.doGetGroupListLogin().subscribe((data) => {
            this.isCheckboxMerchant = true;
            this.lstAreas = data;
            this.lstAreas = data.map((item) => ({
              ...item,
              checked: true,
            }));
            this.lstAreaByOrder = this.convertLstAreaByOrder(
              this.lstAreas,
              this.lstAreas[0]?.parentId
            );
          });
        }
      }
    }
    if (this.masterId === 0) {
      this.disableRadio = false;
    } else {
      this.disableRadio = true;
    }
  }

  doGetPointSales() {
    this.api
      .post(HR_ENDPOINT.GET_SUB, {
        userId: this.userInfo.id,
        page: 1,
        size: 10,
      })
      .subscribe((res) => {
        this.pointSales = res['data']['getPushSubInfos'];
      });
  }

  doGetPointSalesObs() {
    return this.api
      .post(HR_ENDPOINT.GET_SUB, {
        userId: this.userId,
        page: 1,
        size: 10,
      })
      .pipe(
        map((res: any) => {
          if (res.data && res?.data?.getPushSubInfos?.length > 0) {
            return res.data?.getPushSubInfos;
          }
          return [];
        }),
        catchError((error) => {
          this.toast.showError(
            'Lấy danh sách điểm bán thuộc nhân sự xảy ra lỗi'
          );
          return of([]);
        })
      );
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
          return value ? `# ${value}` : '';
        },
      },
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
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
    {
      name: 'merchantBizName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        customCss: (obj: any) => {
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
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
      },
    },
  ];
  dataRoles: any = [];
  dataBusiness: any = [];

  doSearch(pageInfo?: any) {
    this.totalItem = 10;
  }

  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
  }

  doPreStep() {
    this.currentStep--;
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
        const exist = this.merchantIdsSelectedAdd.some(
          (a: any) => a === this.selectedMerchantDefault
        );
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
    };
    const lstmerchantInsert = [...this.merchantIdsClone].filter(
      (x) => !this.merchantIds.has(x)
    );
    const lstmerchantDelete = [...this.merchantIds].filter(
      (x) => !this.merchantIdsClone.has(x)
    );
    const lstGroupDelete = this.groupList.filter(
      (item: any) => !this.groupListClone.includes(item)
    );
    if (
      this.masterIdSelectedDelete ||
      this.merchantIdsSelectedDelete.length > 0 ||
      lstGroupDelete?.length > 0 ||
      this.totalMerchant > 0 ||
      this.merchantIds.size > 0
    ) {
      param.oraganizationDelete = {
        masterId:
          this.masterIdSelectedDelete !== null &&
          this.masterIdSelectedDelete !== undefined
            ? this.masterIdSelectedDelete
            : undefined,
        merchantIds:
          this.merchantIds.size > 0
            ? [...lstmerchantDelete]
            : this.merchantIdsSelectedDelete?.length > 0
            ? this.merchantIdsSelectedDelete
            : [],
        groupIds: this.totalMerchant > 0 ? this.groupList : lstGroupDelete,
      };
    }

    const lstGroupInsert = this.groupListClone.filter(
      (item: any) => !this.groupList.includes(item)
    );
    if (
      this.masterIdSelectedAdd ||
      this.merchantIdsSelectedAdd.length > 0 ||
      lstGroupInsert?.length > 0 ||
      this.merchantIdsClone?.size > 0 ||
      this.totalMerchant > 0
    ) {
      param.oraganizationInfo = {
        masterId:
          this.masterIdSelectedAdd !== null &&
          this.masterIdSelectedAdd !== undefined
            ? this.masterIdSelectedAdd
            : undefined,
        merchantIds:
          this.totalMerchant > 0
            ? [...lstmerchantInsert]
            : this.merchantIdsSelectedAdd?.length > 0
            ? this.merchantIdsSelectedAdd
            : [],
        groupIds: this.totalMerchant > 0 ? [] : lstGroupInsert,
      };
    }

    this.api.post(HR_ENDPOINT.UPDATE_HR, param).subscribe(
      (res) => {
        this.isSuccess = res.data.status;
      },
      () => {
        this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    );

    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  onCancel() {
    let dataConfirm: DialogRoleModel = new DialogRoleModel();
    dataConfirm.title = `Hủy cập nhật nhân sự`;
    dataConfirm.message =
      'Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ cập nhật nhân sự không?';
    dataConfirm.icon = 'icon-error';
    dataConfirm.iconColor = 'error';
    dataConfirm.buttonRightColor = 'error';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '600px',
      data: dataConfirm,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['hr/hr-detail'], {
          queryParams: { userId: this.userId },
        });
      }
    });
  }

  doGetLstBusiness() {
    this.api.post(GROUP_ENDPOINT.GET_POINT_SALE).subscribe(
      (res: any) => {
        if (res['data']['subInfo']) {
          this.dataBusiness = res['data']['subInfo'];
        }
      },
      (error: any) => {
        this.dataBusiness = [];
        this.toast.showError('Lấy danh sách điểm bán xảy ra lỗi');
      }
    );
    if (this.dataBusiness.length == 1) {
      this.typeUpdate = 1;
    }
  }

  doGetGroupListLogin(): Observable<any[]> {
    return this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).pipe(
      map((res: any) => {
        if (res.data && res.data.length > 0) {
          return res.data;
        }
        return [];
      }),
      catchError((error) => {
        this.toast.showError('Lấy danh sách nhóm xảy ra lỗi');
        return of([]);
      })
    );
  }

  getGroupListUserUpdate(userId: number): Observable<any[]> {
    let param = {
      userId: userId,
    };
    let buildParams = CommonUtils.buildParams(param);

    return this.api.get(HR_ENDPOINT.GET_GROUP_BY_USER_UPDATE, buildParams).pipe(
      map((res: any) => {
        if (res.data && res.data.groupList?.length > 0) {
          this.listgroupIdInMerchant = res.data.groupList.map(
            (item: any) => item
          );
          return res.data.groupList;
        }
        return [];
      }),
      catchError((error) => {
        this.toast.showError('Lấy danh sách nhóm user xảy ra lỗi');
        return of([]);
      })
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
    this.subMerchantList = [];
    if (group && group.children.length == 0) {
      this.activeItemId = group.id;
      this.groupNameSelect = group?.groupName;
      // this.getLstMerchant();
      this.getLstMerchantWithCheckedObs(false)?.subscribe((merchantList) => {
        // this.subMerchantList = merchantList ? merchantList : [];
        this.markChecked(this.lstAreas, this.listgroupIdInMerchant ?? []);
      });
    }
  }

  doGroup(group: any) {
    if (group.checked) {
      this.groupListClone.push(group?.id);
    } else {
      this.groupListClone = this.groupListClone.filter(
        (item: number) => item !== group?.id
      );
    }
  }

  getLstMerchant() {
    this.getLstMerchantWithCheckedObs(true)?.subscribe();
    // this.isSearch = true;
    // let dataReq = {
    //   groupIdList: [] as number[],
    //   status: '',
    //   methodId: [],
    //   mappingKey: '',
    // };
    // if (this.activeItemId) {
    //   dataReq.groupIdList = [this.activeItemId];
    // }

    // let param = {
    //   page: 1,
    //   size: 1000,
    //   keySearch: this.keyWord ? this.keyWord : null,
    // };
    // let buildParams = CommonUtils.buildParams(param);
    // this.api
    //   .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
    //   .subscribe(
    //     (res: any) => {
    //       if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
    //         this.subMerchantList = res['data']['subInfo'];
    //         this.subMerchantList = res['data']['subInfo'].map((item: any) => ({
    //           ...item,
    //           formatAddress: fomatAddress([
    //             item.address,
    //             item.communeName,
    //             item.districtName,
    //             item.provinceName,
    //           ]),
    //         }));
    //         //check voi nhung diem ban da tich tu truoc
    //         if (this.merchantIdsClone.size > 0) {
    //           this.totalSelect = 0;
    //           this.subMerchantList.forEach((item: any) => {
    //             item.checked = this.merchantIdsClone.has(item.merchantId);
    //             if(item.checked){
    //               this.listgroupIdInMerchant?.push(item.groupId);
    //             }
    //             if (this.merchantIdsClone.has(item.merchantId)) {
    //               this.totalSelect++;
    //             }
    //           });
    //         }
    //       } else {
    //         this.subMerchantList = [];
    //       }
    //     },
    //     (error: any) => {
    //       this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.');
    //     }
    //   );
  }

  getLstMerchantWithCheckedObs(isFirstLoad?: boolean): Observable<any[]> {
    this.isSearch = true;
    let dataReq = {
      groupIdList: [] as number[],
      status: '',
      methodId: [],
      mappingKey: '',
    };
    if (this.activeItemId) {
      dataReq.groupIdList = [this.activeItemId];
    }

    let param = {
      page: 1,
      size: 1000,
      keySearch: this.keyWord ? this.keyWord : null,
    };
    let buildParams = CommonUtils.buildParams(param);

    return this.api
      .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
      .pipe(
        map((res: any) => {
          if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
            this.subMerchantList = res['data']['subInfo'];
            this.subMerchantList = res['data']['subInfo'].map((item: any) => ({
              ...item,
              formatAddress: fomatAddress([
                item.address,
                item.communeName,
                item.districtName,
                item.provinceName,
              ]),
            }));
            //check voi nhung diem ban da tich tu truoc
            if (this.merchantIdsClone.size > 0) {
              this.totalSelect = 0;
              this.subMerchantList.forEach((item: any) => {
                item.checked = this.merchantIdsClone.has(item.merchantId);
                // if(item.checked){
                //   this.listgroupIdInMerchant?.push(item.groupId);
                // }
                if (this.merchantIdsClone.has(item.merchantId)) {
                  this.totalSelect++;
                }
              });
            }

            if (this.pointSales?.length > 0 && isFirstLoad ) {
              this.listgroupIdInMerchant = this.pointSales
                ?.filter((item: any) =>
                  this.merchantIdsClone.has(+item.merchantId)
                )
                ?.map((item: any) => +item.groupId);
            }

            return this.subMerchantList;
          } else {
            this.subMerchantList = [];
            return this.subMerchantList;
          }
        }),
        catchError((err) => {
          this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.');
          return of([]);
        })
      );
  }

  getLstMerchantObs(): Observable<any[]> {
    this.isSearch = true;
    let dataReq = {
      groupIdList: [] as number[],
      status: '',
      methodId: [],
      mappingKey: '',
    };

    let param = {
      page: 1,
      size: 1000,
      keySearch: this.keyWord ? this.keyWord : null,
    };
    let buildParams = CommonUtils.buildParams(param);

    return this.api
      .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
      .pipe(
        map((res: any) => {
          if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
            let subList = res['data']['subInfo'].map((item: any) => ({
              ...item,
              formatAddress: fomatAddress([
                item.address,
                item.communeName,
                item.districtName,
                item.provinceName,
              ]),
            }));
            return subList;
          }
          return [];
        }),
        catchError((error) => {
          this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.');
          return of([]);
        })
      );
  }

  setUpMerchantIds(event: any) {
    if (event && Array.isArray(event)) {
      let dataChange = event.map((item) => item.merchantId);
      let groupId = event.map((item) => item.groupId);
      if (event[0]?.checked) {
        this.addListToSet(dataChange);
        groupId.forEach((id) => this.listgroupIdInMerchant?.push(id));
      } else {
        this.removeListFromSet(dataChange);
        groupId.forEach((id) => {
          const index = this.listgroupIdInMerchant?.indexOf(id);
          if (index !== undefined && index !== -1) {
            this.listgroupIdInMerchant?.splice(index, 1);
          }
        });
      }
    } else {
      if (event.checked) {
        if (
          this.groupListClone.length > 0 &&
          this.merchantIdsClone.size === 0
        ) {
          const setB = new Set(this.groupListClone?.map((item: any) => item));
          this.listgroupIdInMerchant = this.listgroupIdInMerchant?.filter(
            (id) => !setB.has(id)
          );
        }

        this.merchantIdsClone.add(event?.merchantId);
        this.listgroupIdInMerchant?.push(event?.groupId);
      } else {
        this.merchantIdsClone.delete(event?.merchantId);
        const index = this.listgroupIdInMerchant?.indexOf(event?.groupId);
        if (index !== undefined && index !== -1) {
          this.listgroupIdInMerchant?.splice(index, 1);
        }
        // this.listgroupIdInMerchant?.delete(event?.groupId);
      }
    }

    this.totalMerchant = this.merchantIdsClone.size;
    if (this.totalMerchant === 0) {
      this.isDisableCheckbox = false;
      this.listgroupIdInMerchant = this.groupListClone;
    }

    this.markChecked(
      this.lstAreas,
      Array.from(this.listgroupIdInMerchant ?? [])
    );
  }

  markChecked(parentList: any[], childList: number[]): any[] {
    if (parentList?.length && childList?.length) {
      const childIds = new Set(childList);
      parentList.forEach((item) => {
        if (this.merchantIdsClone.size > 0 && childIds.has(item.id)) {
          item.checked = 'partial';
        } else {
          item.checked = childIds.has(item.id);
        }
      });
    } else if (parentList?.length) {
      parentList.forEach((item) => {
        item.checked = false;
      });
    }
    return parentList;
  }

  addListToSet(listToAdd: number[]): void {
    listToAdd.forEach((item) => this.merchantIdsClone.add(item));
  }

  removeListFromSet(listToRemove: number[]): void {
    listToRemove.forEach((item) => this.merchantIdsClone.delete(item));
  }

  doUpdate() {
    let dataSave;
    if (this.totalMerchant == 0) {
      const lstGroupInsert = this.groupListClone.filter(
        (item: any) => !this.groupList.includes(item)
      );
      const lstGroupDelete = this.groupList.filter(
        (item: any) => !this.groupListClone.includes(item)
      );
      dataSave = {
        userId: this.userId,
        roleId: this.roleId,
        oraganizationInfo: {
          groupIds: [...lstGroupInsert],
        },
        oraganizationDelete: {
          groupIds: [...lstGroupDelete],
        },
      };
    } else if (this.totalMerchant > 0) {
      dataSave = {
        userId: this.userId,
        roleId: this.roleId,
        oraganizationInfo: {
          merchantIds: [...this.merchantIdsClone],
        },
        oraganizationDelete: {
          groupIds: [...this.groupList],
        },
      };
    }
    // call API
    // this.api.post(HR_ENDPOINT.UPDATE_HR, dataSave).subscribe((res: any) => {
    //   debugger
    // }, (error: any) => {
    //   this.toast.showError(error?.soaErrorDesc)
    // });
  }

  onRadioChange(event: any) {
    if (event === this.userInfo.merchantId) {
      this.disableRadio = true;
      this.masterIdSelectedAdd = event;
      if (this.masterIdSelectedAdd === this.masterIdSelectedDefault) {
        this.masterIdSelectedAdd = undefined;
      }

      if (this.selectedMerchantDefault) {
        this.merchantIdsSelectedDelete = Array.of(this.selectedMerchantDefault);
      }
      this.masterIdSelected = this.userInfo?.merchantId;
    } else {
      if (this.masterIdSelectedDefault) {
        this.masterIdSelectedDelete = this.masterIdSelectedDefault;
      }
      this.disableRadio = false;
      this.masterIdSelectedAdd = undefined;
      if (this.selectedMerchantDefault) {
        this.merchantIdsSelectedAdd = Array.of(this.selectedMerchantDefault);
      }
      this.masterIdSelected = null;
    }
  }

  onSelectedItemChange(event: any) {
    this.merchantIdsSelectedAdd = Array.of(event.merchantId);
    if (event.merchantId != this.selectedMerchantDefault) {
      this.merchantIdsSelectedDelete = Array.of(this.selectedMerchantDefault);
    }
  }

  getSelectedItemForRadio(): any {
    return this.subMerchantList.find(
      (p: any) => p.merchantId === +this.selectedMerchantDefault
    );
  }

  setRoleId(event: any) {
    this.roleId = event['id'];
    this.isUpdateRole = false;
  }

  getLstRole() {
    let orgTypeCreate = 2;
    if (this.masterIdSelected) {
      orgTypeCreate = 0;
    }

    const lstGroupInsert = this.groupListClone.filter(
      (item: any) => !this.groupList.includes(item)
    );
    if (lstGroupInsert.length > 0) {
      orgTypeCreate = 1;
    }

    this.api
      .get(
        HR_ENDPOINT.GET_ROLE_BY_USER_LOGIN + '?newUserOrgType=' + orgTypeCreate
      )
      .subscribe((res) => {
        this.dataRoles = res['data']['roleList'];
      });
  }

  getSelectedItemRoleForRadio(): any {
    return this.dataRoles.find((p: any) => p.id === this.roleIdDefault);
  }

  checkDisableCheckbox(): boolean {
    return this.totalMerchant > 0 || this.isDisableCheckbox;
  }

  truncateString(str: string): string {
    if (str && str.length > 100) {
      return str.substring(0, 100) + '...';
    }
    return str;
  }
}
