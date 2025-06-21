import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { environment } from '../../../../environments/environment';
import { DialogConfirmComponent } from '../../../base/shared/dialog-confirm/dialog-confirm.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { InputCommon } from '../../../common/directives/input.directive';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { GROUP_ENDPOINT, ORGANIZATION_ENDPOINT } from '../../../common/enum/EApiUrl';
import { fomatAddress } from '../../../common/helpers/Ultils';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { AreaModel } from '../../../model/AreaModel';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { AreaItemComponent } from '../area-item/area-item.component';
import { AreaViewComponent } from '../area-view/area-view.component';
import { DialogMoveMerchantComponent, MoveMerchantModel } from '../dialog-move-merchant/dialog-move-merchant.component';
import { TableMerchantComponent } from '../table-merchant/table-merchant.component';

@Component({
  selector: 'app-update-organization',
  standalone: true,
  imports: [ButtonModule, InputTextModule, NgFor, NgIf, AreaItemComponent, AreaViewComponent, ReactiveFormsModule, TableMerchantComponent, InputSanitizeDirective, InputCommon, ShowClearOnFocusDirective],
  templateUrl: './update-organization.component.html',
  styleUrl: './update-organization.component.scss'
})

export class UpdateOrganizationComponent implements OnChanges {
  @Input() merchantName: any;
  @Input() lstAreasInput: AreaModel[] = [];
  @ViewChild('areaNameInput') areaNameInput!: ElementRef;
  formEditArea!: FormGroup;
  isEditArea: boolean = false;
  lstAreas: AreaModel[] = [];
  lstAreaByOrder: AreaModel[] = [];
  isFormCreateAreaInvalid: boolean = false;
  areaActive: AreaModel = new AreaModel();
  lstMerchantActive: any = [];
  isMoveMerchantSuccess: boolean = false;
  assetPath = environment.assetPath;
  isCloseInput: boolean = false;
  areaBeforeDelete: AreaModel = new AreaModel();
  setActiveItem?: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthenticationService,
    private api: FetchApiService,
  ) {
    this.formEditArea = this.fb.group({
      areaName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.lstAreas = this.lstAreasInput;
    if (this.lstAreas.length > 0) {
      this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, this.lstAreas[0].parentId);
      this.areaActive = this.lstAreaByOrder[0];
      if (this.areaActive.children.length === 0) {
        this.getLstMerchant(this.areaActive.id);
      }
    }

  }

  setAreaActive(lstAreaByOrder: any, type: number) {
    if (type == 1) {
      this.areaActive = this.lstAreaByOrder[0];
      if (this.areaActive.children.length === 0) {
        this.getLstMerchant(this.areaActive.id);
      }
    } else {
      if (this.areaActive.id > 0 && this.isEditArea) {
        let areaActiveNew = this.lstAreas.find((item: any) => item.id === this.areaActive.id);
        if (areaActiveNew) this.areaActive = areaActiveNew;
        this.isEditArea = false;
      }
    }
  }

  getLstAreas(type: number) {
    this.api.post(ORGANIZATION_ENDPOINT.GET_LIST_GROUPS).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.lstAreas = res.data;

          this.updateActiveSubmit(this.setActiveItem, true);
          this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
          // this.setAreaActive(this.lstAreaByOrder, type);
        }
      }, (error: any) => {
        window.location.reload();
        // const errorData = error?.error || {};
        // this.toast.showError(errorData?.soaErrorDesc);
      });
  }

  getLstMerchant(areaId: any) {
    let dataReq = {
      groupIdList: [areaId],
      status: "",
      methodId: [],
      mappingKey: ""
    }

    let param = {
      page: 1,
      size: 1000,
    };
    let buildParams = CommonUtils.buildParams(param);
    this.api.post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams).subscribe((res: any) => {
      if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
        this.lstMerchantActive = res['data']['subInfo'].map((item: any) => ({
          ...item,
          formatAddress: fomatAddress([
            item.address,
            item.communeName,
            item.districtName,
            item.provinceName,
          ]),
        }));
      } else {
        this.lstMerchantActive = []
      }
    }, (error: any) => {
      this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.')
      this.lstMerchantActive = [];
    });
  }

  addArea(level: number, parentId: number | null, areaActive: any) {
    if (areaActive) {
      areaActive.expanded = true;
    }
    if (this.lstAreas.length === 1000) {
      let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
      dataConfirm.title = 'Nhóm của bạn vượt quá số lượng quy định';
      dataConfirm.message = 'Vui lòng thay đổi cách sắp xếp để hoàn thiện cơ cấu tổ chức theo đúng nhu cầu';
      dataConfirm.icon = 'icon-warning';
      dataConfirm.iconColor = 'warning';
      dataConfirm.buttonLabel = "Tôi đã hiểu";
      dataConfirm.viewCancel = false;
      this.dialog.open(DialogConfirmComponent, {
        width: '500px',
        data: dataConfirm,
        disableClose: true,
      });
      return;
    }

    if (!this.isFormCreateAreaInvalid) {
      let areaNew = {
        id: Math.floor(Math.random() * 1000000),
        parentId: parentId,
        level: level,
        groupName: '',
        expanded: true,
        children: [],
        lstMerchant: []
      }
      this.lstAreas.push(areaNew);
      this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
      this.isFormCreateAreaInvalid = true;
    }
  }

  validateDeleteArea(data: any) {
    let param = {
      groupId: data.id,
    }
    this.api.post(ORGANIZATION_ENDPOINT.VALIDATE_BEFORE_DELETE, param).subscribe(
      (res: any) => {
        if (res.data.merchantIdsInGroup) {
          let lstMerchant = JSON.parse(res.data.merchantIdsInGroup);
          if (lstMerchant.length > 0) {
            this.openDialogChangeMerchant(lstMerchant);
          }
        }
        else if (res.data.usersInOneGroup) {
          let lstUser = JSON.parse(res.data.usersInOneGroup);
          if (lstUser.length > 0) {
            this.openDialogInativeUser(lstUser.length);
          }
        }
        else {
          this.deleteArea(data);
        }
      }, (error: any) => {
        const errorData = error?.error || {};
        this.toast.showError(errorData?.soaErrorDesc);
      });
  }

  deleteArea(data: any) {
    const found = this.lstAreas.find(x => x.id == data);
    if (found && (found.groupName == "" || found.groupName == null)) {
      this.lstAreas = this.lstAreas.filter(x => x.id != data);
      this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
      this.isFormCreateAreaInvalid = false;
    } else {
      this.setActiveItem = data.parentId;
      let param = {
        groupId: data.id
      }
      this.api.post(ORGANIZATION_ENDPOINT.DELETE_GROUP, param).subscribe(
        (res: any) => {
          this.toast.showSuccess(`Xóa nhóm ${this.areaActive.groupName} thành công`);
          if (this.isMoveMerchantSuccess) this.isMoveMerchantSuccess = false;
          this.getLstAreas(1);
        }, (error: any) => {
          const errorData = error?.error || {};
          this.toast.showError(errorData?.soaErrorDesc);
        });
    }
  }

  deleteAreaMove(data: any) {
    let param = {
      groupId: data.id
    }
    this.api.post(ORGANIZATION_ENDPOINT.DELETE_GROUP, param).subscribe(
      (res: any) => {
        this.toast.showSuccess(`Xóa nhóm ${this.areaBeforeDelete.groupName} thành công`);
        if (this.isMoveMerchantSuccess) this.isMoveMerchantSuccess = false;
        this.getLstAreas(1);
      }, (error: any) => {
        const errorData = error?.error || {};
        this.toast.showError(errorData?.soaErrorDesc);
      });
  }

  openDialogChangeMerchant(lstMerchant: any) {
    let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
    dataConfirm.title = `Nhóm đang được gán cho ${lstMerchant.length} điểm kinh doanh`;
    dataConfirm.message = 'Vui lòng chuyển đổi tất cả điểm kinh doanh sang nhóm khác để hoàn tất thao tác xóa';
    dataConfirm.icon = 'icon-warning';
    dataConfirm.iconColor = 'warning';
    dataConfirm.buttonLabel = "Chuyển điểm kinh doanh"

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: dataConfirm,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.openDialogChangeGroup(lstMerchant);
      }
    })
  }

  openDialogInativeUser(countUser: any) {
    let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
    dataConfirm.title = `Xóa nhóm đồng nghĩa với chặn quyền truy cập hệ thống cho ${countUser} nhân sự`;
    dataConfirm.message = 'Hãy cân nhắc để tránh ảnh hưởng để hoạt động của Doanh nghiệp';
    dataConfirm.icon = 'icon-warning';
    dataConfirm.iconColor = 'warning';
    dataConfirm.buttonLabel = "Xác nhận xóa"

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: dataConfirm,
      disableClose: true,
    });


    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteArea(this.areaActive.id);
      }
    })
  }

  openDialogChangeGroup(lstMerchantIdMove: any) {
    let dataModel: MoveMerchantModel = new MoveMerchantModel();
    dataModel.lstAreas = this.lstAreas;
    dataModel.lstAreaByOrder = this.lstAreaByOrder;
    dataModel.areaIdActive = this.areaActive.id;
    dataModel.lstMerchantIdSelected = lstMerchantIdMove || [];

    const dialogRef = this.dialog.open(DialogMoveMerchantComponent, {
      width: '700px',
      data: dataModel,
    });

    dialogRef.afterClosed().subscribe((result: { areaId: number, merchantIds: number[] }) => {
      if (result.areaId > 0) {
        let param = {
          groupNewId: result.areaId,
          lstMerchant: result.merchantIds
        }

        this.callAPIMoveLstMerchant(param, false);

      }
    })
  }
  openPopupErrorMaxMerchant() {
    let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
    dataConfirm.title = 'Số lượng điểm kinh doanh đã vượt quá số lượng tối đa (1000 điểm)';
    dataConfirm.message = 'Vui lòng chuyển điểm kinh doanh sang nhóm khác';
    dataConfirm.icon = 'icon-warning';
    dataConfirm.iconColor = 'warning';
    dataConfirm.viewCancel = false;
    dataConfirm.buttonLabel = "Tôi đã hiểu"

    this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: dataConfirm,
      disableClose: true,
    });
  }

  onBlurCreateArea(event: any, areaId: number, isFormCreateInvalid: boolean) {
    if (!isFormCreateInvalid) {
      let areaName = event?.target?.value;
      let area = this.lstAreas.find((item: any) => item.id === areaId);
      if (area) {
        let param = {
          parentId: area.parentId,
          groupName: areaName
        };
        this.api.post(ORGANIZATION_ENDPOINT.ADD_GROUP, param).subscribe(
          (res: any) => {
            this.getLstAreas(2);
            //TODo
            // Lấy lại danh sách nhóm mới nhất
            this.toast.showSuccess(`Thêm nhóm ${areaName} thành công`);

            // Active nhóm mới sau khi load xong
            setTimeout(() => {
              // Giả sử API trả về ID nhóm mới ở res.data.id
              const newAreaId = res.data?.id;
              if (newAreaId) {
                const newActiveArea = this.lstAreas.find(item => item.id === newAreaId);
                if (newActiveArea) {
                  this.doActiveArea(newActiveArea);
                }
              } else {
                // Nếu không có ID trả về, active theo tên nhóm mới (tạm thời)
                const newActiveAreaByName = this.lstAreas.find(item => item.groupName === areaName);
                if (newActiveAreaByName) {
                  this.doActiveArea(newActiveAreaByName);
                }
              }
            }, 500);
          },
          (error: any) => {
            const errorData = error?.error || {};
            this.toast.showError(errorData?.soaErrorDesc);
          }
        );
      }
    }
    this.isFormCreateAreaInvalid = isFormCreateInvalid;
  }

  updateActiveSubmit(data: any, isFirts: boolean) {
    if (!data) {
      return;
    }
    this.lstAreas.forEach((item) => {
      if (item.id == data) {
        if (isFirts) {
          this.areaActive = item
        }
        item.expanded = true;
        if (item.parentId != null) {
          this.updateActiveSubmit(item.parentId, false);
        }
      }
    });
  }


  convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
    let result = list.filter(item => item.parentId === parentId);

    result.forEach(item => {
      let children = this.convertLstAreaByOrder(list, item.id);
      item.children = children;
      item.expanded = item.expanded ? item.expanded : false;
    });

    return result;
  }

  doActiveArea(area: AreaModel) {
    this.setActiveItem = area.id;
    if (this.isFormCreateAreaInvalid) {
      return;
    }
    this.lstMerchantActive = []
    this.areaActive = area;
    if (area.children.length === 0) {
      this.getLstMerchant(area.id);
    }
    this.isEditArea = false;
  }

  doAssignSubmerchant() {
    //chuyển về trang thêm mới điểm kinh doanh
    this.router.navigate(['/business/business-create'],
      { queryParams: { organizationSetup: true, groupId: this.areaActive.id } });
  }

  doEditArea() {
    if (this.isFormCreateAreaInvalid) {
      return;
    }
    this.isEditArea = true;
    this.formEditArea.get("areaName")?.setValue(this.areaActive.groupName);
    setTimeout(() => {
      this.areaNameInput.nativeElement.focus();
    });

  }

  clearValue(nameInput: string) {
    this.formEditArea.get(nameInput)?.setValue('');
    this.isCloseInput = true;
  
    setTimeout(() => {
      this.areaNameInput?.nativeElement.focus();
    });
  }
  

  updateAreaName() {
    let areaName = this.formEditArea.get("areaName")?.value;
    let param = {
      groupId: this.areaActive.id,
      groupName: areaName
    };
    this.api.post(ORGANIZATION_ENDPOINT.UPDATE_GROUP_NAME, param).subscribe((res: any) => {
      this.getLstAreas(2);  // Lấy lại danh sách mới nhất
      this.toast.showSuccess('Đổi tên nhóm thành công');
      this.isEditArea = false;

      this.areaActive.groupName = areaName;
    }, (error: any) => {
      if (error && error?.error?.soaErrorCode === 'GROUP_ERROR_001') {
        this.isCloseInput = true;
        this.formEditArea.get('areaName')!.setErrors({ areaExists: true });
        this.formEditArea.get('areaName')?.markAsTouched();
        this.formEditArea.updateValueAndValidity();

        return
      }
      const errorData = error?.error || {};
      this.toast.showError(errorData?.soaErrorDesc);
    });
  }


  doMoveMerchant(lstMerchantIdMove: any) {
    let lstAreaExistMove = this.lstAreas.filter((item) => item.id != this.areaActive.id && item?.children?.length == 0);

    if (lstAreaExistMove?.length > 0) {
      let dataModel: MoveMerchantModel = new MoveMerchantModel();
      dataModel.lstAreas = this.lstAreas;
      dataModel.lstAreaByOrder = this.lstAreaByOrder;
      dataModel.areaIdActive = this.areaActive.id;
      dataModel.lstMerchantIdSelected = lstMerchantIdMove?.lstRowId || [];

      const dialogRef = this.dialog.open(DialogMoveMerchantComponent, {
        width: '700px',
        data: dataModel,
      });

      dialogRef.afterClosed().subscribe((result: { areaId: number, merchantIds: number[] }) => {
        if (result?.areaId > 0) {
          let param = {
            groupNewId: result.areaId,
            lstMerchant: result.merchantIds
          };
          this.callAPIMoveLstMerchant(param, lstMerchantIdMove?.isNotDelete);
        }
      });

    } else {
      let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
      dataConfirm.title = 'Không tồn tại nhóm để chuyển điểm kinh doanh';
      dataConfirm.message = 'Vui lòng tạo nhóm mới để tiếp tục';
      dataConfirm.icon = 'icon-warning';
      dataConfirm.iconColor = 'warning';
      dataConfirm.buttonLabel = "Tạo nhóm mới"
      this.dialog.open(DialogConfirmComponent, {
        width: '500px',
        data: dataConfirm,
        disableClose: true,
      });
    }
  }


  callAPIMoveLstMerchant(param: any, isNotDelete: boolean) {
    this.api.post(ORGANIZATION_ENDPOINT.MOVE_LIST_MERCHANT, param).subscribe(
      (res: any) => {
        if (isNotDelete) {
          this.toast.showSuccess("Chuyển điểm kinh doanh thành công");

          // Active nhóm đích ngay sau khi lấy lại danh sách
          setTimeout(() => {
            const newActiveArea = this.lstAreas.find(item => item.id === param.groupNewId);
            if (newActiveArea) {
              this.doActiveArea(newActiveArea);
            }
          }, 100);
        } else {
          this.areaBeforeDelete = this.areaActive;
          this.isMoveMerchantSuccess = true;
          const newActiveArea = this.lstAreas.find(item => item.id === param.groupNewId);
          if (newActiveArea) {
            this.doActiveArea(newActiveArea);
          }
        }
      },
      (error: any) => {
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == "GROUP_ERROR_005") {
          this.openPopupErrorMaxMerchant();
        }
        else {
          this.toast.showError(errorData?.soaErrorDesc);
        }
      });
  }

  cancelEdit() {

    this.formEditArea.get('areaName')?.setValue(this.areaActive.groupName);
    this.isEditArea = false;
  }

  backOrganization() {
    this.isMoveMerchantSuccess = false;
    this.getLstAreas(1);
  }
  onEnterKey() {
    if (this.formEditArea.valid) {
      this.updateAreaName();
    }
  }

  onBlurEdit() {
    this.isCloseInput = false;
    setTimeout(() => {
      if (this.isEditArea && !this.isCloseInput) {
        this.cancelEdit();
      }
    }, 300);
  }

  doActiveAreaCheckbox(group: any) {
    this.lstAreaByOrder.forEach((i: any) => {
      if (i !== group) i.expanded = false;
    });
  }

}

