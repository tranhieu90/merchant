import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { NavigationStart, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { InputCommon } from '../../../common/directives/input.directive';
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
} from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { AreaModel } from '../../../model/AreaModel';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { MTreeComponent } from '../../../base/shared/m-tree/m-tree.component';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { isArray } from 'lodash';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { IPersonelUpdate } from '../../../model/ma/personel.model';
import { environment } from '../../../../environments/environment';
import {
  convertLstAreaByOrder,
  fomatAddress,
  setDisableOrNotForItemsNotAtLevel,
} from '../../../common/helpers/Ultils';
import { AreaViewComponent } from '../../organization-management/area-view/area-view.component';
import { TreeViewComponent } from '../../../base/shared/tree-view/tree-view.component';
import { MTreeCheckboxComponent } from '../../../base/shared/m-tree-checkbox/m-tree-checkbox.component';
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
    AreaViewComponent,
    CommonModule,
    TreeModule,
    MatCheckboxModule,
    RadioButtonModule,
    MTreeComponent,
    TreeViewComponent,
    MTreeCheckboxComponent
  ],
  templateUrl: './human-resource-update.component.html',
  styleUrl: './human-resource-update.component.scss',
})
export class HumanResourceUpdateComponent implements OnInit {
  @ViewChild('mTreeComponent') mTreeComponent!: MTreeComponent;
  assetPath = environment.assetPath;
  private _isNavigating: boolean = false;
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
  subMerchantList: any[] = [];
  subMerchantListTemp: any[] = [];
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
  pointSales: any = [];
  selectedMerchantDefault: any[] = [];
  selectedGroupDefault: any[] = [];
  roleIdDefault: number = 0;
  isUpdateRole: boolean = false;
  isSuccess: number = 0;
  isHaveEmail: boolean = false;
  masterId?: number;
  orgTypeUser!: number;
  isCheckboxMerchant: boolean = false;
  isShowPointSales: boolean = false;
  isShowGroup: boolean = false;
  isShowMerchant: boolean = false;
  orgTypeLogin!: number;
  newRoleId!: string;
  newOrganization!: any;
  isChooseOrganization: boolean = false;
  roleIdSeletecd!: any;
  personDataDetail!: any;
  searchGroup!: string;
  searchPointSales!: string;
  hasChangeRoleUpdate: boolean = false;
  roleTypePersonel?: number;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private toast: ToastService,
    private api: FetchApiService,
    private auth: AuthenticationService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    const personData = state?.['dataInput'];
    console.log('personData', personData);
    if (personData) {
      this.personDataDetail = personData;
      this.userId = personData.userId;
      this.orgTypeUser = personData.orgType;
      this.roleTypePersonel = personData.roleTypePersonel;
      if (this.orgTypeUser == 2 && personData?.selectedMerchant) {
        if (
          personData?.selectedMerchant &&
          isArray(personData?.selectedMerchant)
        ) {
          this.selectedMerchantDefault = JSON.parse(JSON.stringify(this.personDataDetail.selectedMerchant));
        } else {
          this.selectedMerchantDefault = [{ ...this.personDataDetail.selectedMerchant }];
        }
      }
      this.roleIdDefault = personData.roleId;
      this.masterId = personData.masterId;
      const groupList = personData?.groupList;
      if (this.orgTypeUser == 1 && groupList) {
        const maxLevel = Math.min(...groupList.map((x: any) => x.level));
        this.selectedGroupDefault = [...groupList];
        this.newOrganization = this.selectedGroupDefault.filter((it: any) => it.level == maxLevel).map(
          (group: any) => Number(group.id)
        );
      }
    }
  }
  private navigationSubscription!: Subscription;
  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
  //isConfig=0 orgType=0 pointsales==0   typeUpdate=0 => bỏ qua  vào vai trò gán vào merchant
  //isConfig=0 orgType=0 pointsales > 0  typeUpdate=1 => hiển thị opt 1 3 : 3 là radio button.
  //isConfig=0 orgType=2 typeUpdate=2     => vào luôn vai trò =>
  //isConfig=1 orgType=0 typeUpdate=3=> hiển thị 3 opt
  //isConfig=1 orgType=1 typeUpdate=4 => hiện thị 2 3 3là hiển thị checkbox
  //isConfig=1 orgType=2 pointsales > 0 typeUpdate= 5
  //isConfig=1 orgType=2 pointsales == 1 typeUpdate=6
  ngOnInit(): void {

    this.isSearch = true;
    this.userInfo = this.auth.getUserInfo();
    let lstPoinSales: any[] = [];
    this.getLstMerchantWithCheckedObs(true)?.subscribe(
      (dataPointSales: any[]) => {
        lstPoinSales.push(...dataPointSales);
        if (this.selectedMerchantDefault.length > 0)
          lstPoinSales.forEach((item) => {
            if (
              this.selectedMerchantDefault.some(
                (x: any) => x.merchantId == item.merchantId
              )
            ) {
              item.checked = true;
            }
          });
        const orgTypeLogin = this.userInfo?.orgType;
        this.orgTypeLogin = orgTypeLogin;
        if (this.userInfo?.isConfig == 0) {
          if (lstPoinSales.length == 0) {
            if (orgTypeLogin == 0) {
              this.typeUpdate = 0;
              this.isChooseOrganization = false;
            }
          }
          if (lstPoinSales.length > 0) {
            if (orgTypeLogin == 0) {
              this.typeUpdate = 1;
              this.isChooseOrganization = true;
            }
            if (orgTypeLogin == 2) {
              this.isChooseOrganization = false;
              this.typeUpdate = 2;
            }
          }
        } else {
          if (orgTypeLogin == 0) {
            this.isChooseOrganization = true;
            if (this.orgTypeUser == 1) {
              this.doGetGroupListLogin().subscribe((data) => {
                this.lstAreas = data;
                if (this.selectedGroupDefault.length > 0) {
                  const _level = this.selectedGroupDefault[0].level;
                  data.forEach((item) => {
                    if (
                      this.selectedGroupDefault.some((x: any) => x.id == item.id)
                    ) {
                      item.checked = true;
                    }
                    if (item.level != _level) {
                      item.disabled = true;
                    }
                  });
                }
                this.lstAreaByOrder = convertLstAreaByOrder(
                  this.lstAreas,
                  this.lstAreas[0]?.parentId
                );
              });
            }

            this.typeUpdate = 3;
          }
          if (orgTypeLogin == 1) {
            this.isChooseOrganization = true;
            this.typeUpdate = 4;
            if (this.orgTypeUser == 1) {
              this.doGetGroupListLogin().subscribe((data) => {
                this.lstAreas = data;
                if (this.selectedGroupDefault.length > 0) {
                  const _level = this.selectedGroupDefault[0].level;
                  data.forEach((item) => {
                    if (
                      this.selectedGroupDefault.some((x: any) => x.id == item.id)
                    ) {
                      item.checked = true;
                    }
                    if (item.level != _level) {
                      item.disabled = true;
                    }
                  });
                }
                this.lstAreaByOrder = convertLstAreaByOrder(
                  this.lstAreas,
                  this.lstAreas[0]?.parentId
                );
              });
            }

          }
          if (orgTypeLogin == 2) {
            if (lstPoinSales.length == 1) {
              this.isChooseOrganization = false;
              this.typeUpdate = 2;
            } else {
              this.isChooseOrganization = true;
              this.typeUpdate = 5;
            }
          }
        }
        if (this.typeUpdate == 0 || this.typeUpdate == 2) {
          this.getLstRole();
        }
      }
    );
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this._isNavigating) {
          // this._isNavigating = true;
          if (event.url !== '/login') {
            this.onCancel(event.url);
            this.router.navigate([], { replaceUrl: true, queryParamsHandling: 'preserve' });
          }
        }
      }
    });
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
        customCss: (obj: any) => {
          return ['text-left', 'mw-180'];
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
    if (this.currentStep > 0) {
      this.currentStep--;
    } else {
      this.onCancel();
    }
    // this.currentStep--;
  }

  doNextStep(number: number = 0) {
    if (number == 1) {
      this.checkChangeOrganization();
      this.getLstRole();
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  doNextStepSubmit() {
    const param: IPersonelUpdate = {
      userId: this.userId,
      roleId: this.roleIdDefault,
    };
    if (!this.isChangedInfo()) {
      this.isSuccess = 2
    } else {
      if (this.orgTypeUser == 0) {
        if (this.personDataDetail.orgType != 0) {
          param.oraganizationInfo = {
            masterId: this.auth.getUserInfo().merchantId,
          };
        }
        if (this.personDataDetail.orgType == 1) {
          let lstGr!: any;
          if (
            this.selectedGroupDefault &&
            Array.isArray(this.selectedGroupDefault)
          ) {
            const lstGr = this.selectedGroupDefault.map((g: any) => g.id);
          }
          param.oraganizationDelete = {
            // masterId: this.auth.getUserInfo().merchantId,
            groupIds: lstGr,
          };
        }
        if (this.personDataDetail.orgType == 2) {
          let lstPointSales!: any;
          if (this.personDataDetail?.selectedMerchant) {
            lstPointSales = this.personDataDetail?.selectedMerchant.map(
              (item: any) => Number(item.merchantId)
            );
          }
          param.oraganizationDelete = {
            // masterId: this.auth.getUserInfo().merchantId,
            merchantIds: lstPointSales,
          };
        }

        if (
          this.selectedMerchantDefault &&
          Array.isArray(this.selectedMerchantDefault)
        ) {
          lstPointSales = this.selectedMerchantDefault.map(
            (item: any) => Number(item.merchantId)
          );
        }
      }

      if (this.orgTypeUser == 1) {
        const maxLevel = Math.min(...this.selectedGroupDefault.map((x: any) => x.level));
        const selectedGroupIds = this.selectedGroupDefault.filter((it: any) => it.level == maxLevel).map(
          (group: any) => Number(group.id)
        );
        console.log(selectedGroupIds)
        if (this.personDataDetail.orgType == 1) {
          const groupIdsInsert = selectedGroupIds.filter(
            (id: any) => !this.newOrganization.includes(Number(id))
          );
          console.log(groupIdsInsert)
          const groupIdsDelete = this.newOrganization.filter(
            (id: any) => !selectedGroupIds.includes(Number(id))
          );
          if (groupIdsInsert.length > 0) {
            param.oraganizationInfo = {
              groupIds: groupIdsInsert,
            };
          }
          if (groupIdsDelete.length > 0) {
            param.oraganizationDelete = {
              groupIds: groupIdsDelete,
            };
          }
        } else if (this.personDataDetail.orgType == 0) {
          param.oraganizationInfo = {
            groupIds: selectedGroupIds,
          };
          param.oraganizationDelete = {
            masterId: this.auth.getUserInfo().merchantId,
          };
        } else {
          let lstPointSales!: any;
          if (this.personDataDetail?.selectedMerchant) {
            lstPointSales = this.personDataDetail?.selectedMerchant.map(
              (item: any) => +item.merchantId
            );
          }
          param.oraganizationInfo = {
            groupIds: selectedGroupIds,
          };
          param.oraganizationDelete = {
            merchantIds: lstPointSales,
          };
        }
      }
      if (this.orgTypeUser == 2) {
        const selectedPointSales = this.selectedMerchantDefault.map(
          (g: any) => Number(g.merchantId)
        );
        if (this.personDataDetail.orgType == 2) {
          var lstPointSales = this.personDataDetail?.selectedMerchant.map(
            (item: any) => Number(item.merchantId)
          );
          const pointsInsert = selectedPointSales.filter(
            (id: number) => !lstPointSales.includes(id)
          );
          const pointsDelete = lstPointSales.filter(
            (id: number) => !selectedPointSales.includes(id)
          );
          if (pointsInsert.length > 0) {
            param.oraganizationInfo = {
              merchantIds: pointsInsert,
            };
          }
          if (pointsDelete.length > 0) {
            param.oraganizationDelete = {
              merchantIds: pointsDelete,
            };
          }
        } else if (this.personDataDetail.orgType == 0) {
          param.oraganizationInfo = {
            merchantIds: selectedPointSales,
          };
          param.oraganizationDelete = {
            masterId: this.auth.getUserInfo().merchantId,
          };
        } else {
          param.oraganizationInfo = {
            merchantIds: selectedPointSales,
          };
          param.oraganizationDelete = {
            groupIds: this.newOrganization,
          };
        }
      }
      this.api.post(HR_ENDPOINT.UPDATE_HR, param).subscribe(
        (res) => {
          this.isSuccess = res.data.status;
          this._isNavigating = true;
        },
        (error) => {
          // if (err) {
          //   const { error } = err;
          //   this.toast.showError(error.soaErrorDesc);
          // } else this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');

          const errorData = error?.error || {};
          switch (errorData.soaErrorCode) {
            case '203':
              this.toast.showError("Danh sách cập nhật, hủy cơ cấu tổ chức cho nhân sự không hợp lệ.");
              break;
            default:
              this.toast.showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');

              break;
          }
        }
      );
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }
  onCancel(url?: string) {
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
      if (result === true) {
        this._isNavigating = true;
        if (url) {
          this.router.navigateByUrl(url);
        }
        else {
          this.router.navigate(['hr/hr-detail'], {
            queryParams: { userId: this.userId },
          });
        }
      }
    });
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
  doGroup(group: any) {

    if (group.checked) {
      this.selectedGroupDefault.push(group);
      setDisableOrNotForItemsNotAtLevel(this.lstAreas, group.level, true, group.parentId);

    } else {
      const index = this.selectedGroupDefault.findIndex(
        (x: any) => Number(x.id) === Number(group.id)
      );
      if (index !== -1) {
        this.selectedGroupDefault.splice(index, 1);
      }
      if (group.children && Array.isArray(group.children)) {
        group.children.forEach((child: any) => {
          const childIndex = this.selectedGroupDefault.findIndex(
            (x: any) => Number(x.id) === Number(child.id)
          );
          if (childIndex !== -1) {
            this.selectedGroupDefault.splice(childIndex, 1);
          }
        });
      }

      const unCheckGroup = this.selectedGroupDefault.filter((item: any) => item.level == group.level);
      if (unCheckGroup.length == 0) {
        this.selectedGroupDefault = [];
        setDisableOrNotForItemsNotAtLevel(this.lstAreas, group.level, false, group.parentId);
      }
      this.lstAreaByOrder = convertLstAreaByOrder(
        this.lstAreas,
        this.lstAreas[0]?.parentId
      );
    }
  }

  getLstMerchant() {
    return this.getLstMerchantWithCheckedObs(false)?.subscribe();
  }

  getLstMerchantWithCheckedObs(isFirstLoad?: boolean): Observable<any[]> {
    this.isSearch = true;
    let dataReq = {
      groupIdList: [] as number[],
      status: 'active',
      methodId: [],
      mappingKey: '',
    };
    this.searchPointSales = this.searchPointSales?.trim();
    let param = {
      page: 1,
      size: 1000,
      keySearch: this.searchPointSales ? this.searchPointSales : null,
    };
    let buildParams = CommonUtils.buildParams(param);
    return this.api
      .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
      .pipe(
        map((res: any) => {
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

            if (this.selectedMerchantDefault.length > 0) {
              dataGroup.forEach((item: any) => {
                item.checked = this.selectedMerchantDefault.some((el) => el.merchantId == item.merchantId);
              });
            }
            this.subMerchantList = dataGroup;
            if (isFirstLoad) {
              this.subMerchantListTemp = dataGroup;
            }
            return dataGroup;
          } else {
            this.subMerchantList = [];
            return [];
          }
        }),
        catchError((err) => {
          this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.');
          return of([]);
        })
      );
  }
  setUpMerchantIds(event: any) {
    console.log(1, event)
    if (event && Array.isArray(event)) {
      if (event[0]?.checked) {
        event.forEach((item: any) => {
          const exists = this.selectedMerchantDefault.some(
            (m: any) => Number(m.merchantId) === Number(item.merchantId)
          );
          if (!exists) {
            this.selectedMerchantDefault.push(item);
          }
        });
      } else {
        if (this.selectedMerchantDefault.length > 0) {
          event.forEach((item: any) => {
            const idx = this.selectedMerchantDefault.findIndex(
              (m: any) => Number(m.merchantId) === Number(item.merchantId)
            );
            if (idx !== -1) {
              this.selectedMerchantDefault.splice(idx, 1);
            }
          });
        }
      }
    } else {
      if (event.checked) {
        this.selectedMerchantDefault.push(event);
      } else {
        this.selectedMerchantDefault = this.selectedMerchantDefault.filter(
          (m: any) => Number(m.merchantId) !== Number(event.merchantId)
        );
      }
    } console.log(2, this.selectedMerchantDefault)
  }
  onRadioChange(event: any) {
    switch (event) {
      case 0:
        this.orgTypeUser = 0;
        this.searchGroup = '';
        this.searchPointSales = '';
        if (this.userInfo.isConfig == 0 && this.userInfo.orgType == 0 && this.subMerchantListTemp.length > 0) {
          this.getLstMerchant();
        }
        break;
      case 1:
        this.orgTypeUser = 1;
        this.searchGroup = '';
        this.searchPointSales = '';
        this.doGetGroupListLogin().subscribe((data) => {
          this.lstAreas = data;
          if (this.selectedGroupDefault.length > 0) {
            const _level = this.selectedGroupDefault[0].level;
            data.forEach((item) => {
              if (
                this.selectedGroupDefault.some((x: any) => x.id == item.id)
              ) {
                item.checked = true;
              }
              if (item.level != _level) {
                item.disabled = true;
              }
            });
          }
          this.lstAreaByOrder = convertLstAreaByOrder(
            this.lstAreas,
            this.lstAreas[0]?.parentId
          );
        });
        break;
      case 2:
        this.orgTypeUser = 2;
        this.searchGroup = '';
        this.searchPointSales = '';
        this.getLstMerchantWithCheckedObs(true)?.subscribe(
          (dataPointSales: any[]) => {
            if (this.selectedMerchantDefault.length > 0) {
              dataPointSales.forEach((item) => {
                if (
                  this.selectedMerchantDefault.some(
                    (x: any) => x.merchantId == item.merchantId
                  )
                ) {
                  item.checked = true;
                }
              })
            }
          })
        break;
    }
  }
  radioMerchant(event: any) {
    this.selectedMerchantDefault = [];
    this.selectedMerchantDefault.push(event);
  }
  getSelectedItemForRadio(): any {
    if (this.selectedMerchantDefault.length > 0)
      return this.subMerchantList.find(
        (p: any) => p.merchantId === +this.selectedMerchantDefault[0].merchantId
      );
  }

  setRoleId(event: any) {

    this.roleIdDefault = event['id'];
    this.roleIdSeletecd = this.dataRoles.find(
      (p: any) => p.id === this.roleIdDefault
    );
    this.hasChangeRoleUpdate = false;
  }

  getLstRole() {
    this.api
      .get(
        HR_ENDPOINT.GET_ROLE_BY_USER_LOGIN +
        '?newUserOrgType=' +
        this.orgTypeUser
      )
      .subscribe((res) => {
        this.dataRoles = res['data']['roleList'];
        this.roleIdSeletecd = this.dataRoles.find(
          (p: any) => p.id === this.roleIdDefault
        );
      });
  }
  getSelectedItemRoleForRadio(): any {
    return this.dataRoles.find((p: any) => p.id === this.roleIdDefault);
  }
  truncateString(str: string): string {
    if (str && str.length > 100) {
      return str.substring(0, 100) + '...';
    }
    return str;
  }
  openCreateGroups() {
    this.router.navigate(['organization'], {});
  }
  doActiveAreaCheckbox(group: any) {
    this.lstAreaByOrder.forEach((i: any) => {
      if (i !== group) i.expanded = false;
    });
  }
  checkChangeOrganization() {
    this.hasChangeRoleUpdate = false;
    // if (
    //   this.personDataDetail.orgType !== this.orgTypeUser
    // ) {
    //   this.hasChangeRoleUpdate = true;
    // }
    // if (this.orgTypeUser === 2) {
    //   const currentIds = (this.selectedMerchantDefault || []).map((m: any) => m.merchantId).sort();
    //   const originalIds = (this.personDataDetail.selectedMerchant || []).map((m: any) => m.merchantId).sort();
    //   if (currentIds.length !== originalIds.length) {
    //     this.hasChangeRoleUpdate = true;
    //   }
    //   for (let i = 0; i < currentIds.length; i++) {
    //     if (currentIds[i] !== originalIds[i]) {
    //       this.hasChangeRoleUpdate = true;
    //     }
    //   }
    // }
    // if (this.orgTypeUser === 1) {
    //   const currentGroupIds = (this.selectedGroupDefault || []).map((g: any) => g.id).sort();
    //   const originalGroupIds = (this.personDataDetail.groupList || []).map((g: any) => g.id).sort();
    //   if (currentGroupIds.length !== originalGroupIds.length) {
    //     this.hasChangeRoleUpdate = true;
    //   }
    //   for (let i = 0; i < currentGroupIds.length; i++) {
    //     if (currentGroupIds[i] !== originalGroupIds[i]) {
    //       this.hasChangeRoleUpdate = true;
    //     }
    //   }
    // }

    if (
      this.personDataDetail.orgType !== this.orgTypeUser
    ) {
      if (this.roleTypePersonel == 1) {
        this.hasChangeRoleUpdate = true;
      }
    }


  }
  checkHasOrganzation() {
    if (this.orgTypeUser === 2) {
      return Array.isArray(this.selectedMerchantDefault) && this.selectedMerchantDefault.length > 0;
    }
    if (this.orgTypeUser === 1) {
      return Array.isArray(this.selectedGroupDefault) && this.selectedGroupDefault.length > 0;
    }
    if (this.orgTypeUser === 0) {
      return true;
    }
    return false;
  }
  isChangedInfo(): boolean {
    if (this.personDataDetail.orgType !== this.orgTypeUser) {
      return true;
    }
    if (this.orgTypeUser === 2) {
      const currentIds = (this.selectedMerchantDefault || []).map((m: any) => m.merchantId).sort();
      const originalIds = (this.personDataDetail.selectedMerchant || []).map((m: any) => m.merchantId).sort();
      if (currentIds.length !== originalIds.length) {
        return true;
      }
      for (let i = 0; i < currentIds.length; i++) {
        if (currentIds[i] !== originalIds[i]) {
          return true;
        }
      }
    }
    if (this.orgTypeUser === 1) {
      const currentGroupIds = (this.selectedGroupDefault || []).map((g: any) => g.id).sort();
      const originalGroupIds = (this.personDataDetail.groupList || []).map((g: any) => g.id).sort();
      if (currentGroupIds.length !== originalGroupIds.length) {
        return true;
      }
      for (let i = 0; i < currentGroupIds.length; i++) {
        if (currentGroupIds[i] !== originalGroupIds[i]) {
          return true;
        }
      }
    }
    if (this.roleIdDefault !== this.personDataDetail.roleId) {
      return true;
    }
    return false;
  }
}
