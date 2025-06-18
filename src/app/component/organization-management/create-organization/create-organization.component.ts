import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import _ from 'lodash';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogConfirmComponent } from '../../../base/shared/dialog-confirm/dialog-confirm.component';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';
import { GROUP_ENDPOINT, ORGANIZATION_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { AreaModel } from '../../../model/AreaModel';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { AreaItemComponent } from '../area-item/area-item.component';
import { AreaViewComponent } from '../area-view/area-view.component';
import { DialogAssignMerchantComponent } from '../dialog-assign-merchant/dialog-assign-merchant.component';
import { DialogMoveMerchantComponent, MoveMerchantModel } from '../dialog-move-merchant/dialog-move-merchant.component';
import { TableMerchantComponent } from '../table-merchant/table-merchant.component';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { environment } from '../../../../environments/environment';
import { InputCommon } from '../../../common/directives/input.directive';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { fomatAddress } from '../../../common/helpers/Ultils';

@Component({
  selector: 'app-create-organization',
  standalone: true,
  imports: [ButtonModule, InputTextModule, NgFor, NgIf, AreaItemComponent, AreaViewComponent, ReactiveFormsModule, TableMerchantComponent, InputSanitizeDirective, InputCommon, ShowClearOnFocusDirective],
  templateUrl: './create-organization.component.html',
  styleUrl: './create-organization.component.scss'
})
export class CreateOrganizationComponent {
  assetPath = environment.assetPath;
  @Input() merchantName: any;
  @Output() cancelCreate = new EventEmitter();
  @Output() createSuccess = new EventEmitter();

  @ViewChild('areaNameInput') areaNameInput!: ElementRef;
  formEditArea!: FormGroup;
  isPermission: boolean = true;
  isEditArea: boolean = false;
  lstMerchantsAll: any = [];
  lstMerchantRemain: any = [];
  lstAreas: AreaModel[] = [];
  lstAreaByOrder: AreaModel[] = [];
  isFormCreateAreaInvalid: boolean = false;
  areaActive: AreaModel = new AreaModel();
  lstMerchantActive: any = [];
  isCloseInput: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthenticationService,
    private api: FetchApiService,
    private dialogCommon: DialogCommonService
  ) {
    this.formEditArea = this.fb.group({
      areaName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  ngOnInit() {
    this.getLstMerchant("");
  }
  checkValidCreate() {
    let isCreate = true;
    if (this.lstAreaByOrder.length > 0 || (this.lstAreaByOrder.length > 0 && (this.lstMerchantsAll.length > 0 && this.lstMerchantRemain.length == 0)))
      isCreate = false;
    return isCreate
  }
  getLstMerchant(groupId: string) {

    let dataReq = {
      groupIdList: [],
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
        this.lstMerchantsAll = res['data']['subInfo'].map((item: any) => ({
          ...item,
          formatAddress: fomatAddress([
            item.address,
            item.communeName,
            item.districtName,
            item.provinceName,
          ]),
        }));
        this.lstMerchantRemain = _.cloneDeep(res['data']['subInfo']);
        
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
        children: [],
        expanded: true,
        lstMerchant: []
      }
      this.lstAreas.push(areaNew);
      this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
      this.isFormCreateAreaInvalid = true;
    }
  }

  deleteArea(data: any) {
    
    const found = this.lstAreas.find(x=>x.id==data.id) ;
    if (found && (found.groupName =="" ||found.groupName ==null)) {
      this.lstAreas = this.lstAreas.filter(x=>x.id !=data.id) ;
      this.lstAreaByOrder= this.convertLstAreaByOrder(this.lstAreas,null);
      this.isFormCreateAreaInvalid= false;
    } else {
      if(this.isFormCreateAreaInvalid== true) {
        return;
      }
      let lstAreaIdsRemove = this.collectAreaIdsRemove(this.lstAreas, data.id);
      let lstMerchantIdsRestore: number[] = [];

      this.lstAreas.forEach((item) => {
        if (lstAreaIdsRemove.includes(item.id) && item.lstMerchant.length > 0) {
          lstMerchantIdsRestore = lstMerchantIdsRestore.concat(item.lstMerchant);
        }
      });
      this.lstAreas = this.lstAreas.filter(item => !lstAreaIdsRemove.includes(item.id));

      let lstMerchantIdsRemainOld = this.lstMerchantRemain.map((item: any) => item.merchantId);
      this.lstMerchantRemain = this.lstMerchantsAll.filter((item: any) => lstMerchantIdsRestore.includes(item.merchantId) || lstMerchantIdsRemainOld.includes(item.merchantId));

      this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
      this.toast.showSuccess(`Xóa nhóm ${this.areaActive.groupName} thành công`);
      this.updateActiveSubmit(data.parentId, true);
      // if (this.lstAreas.length > 0) {
      //   this.areaActive = this.lstAreas[0];
      //   if (this.areaActive.lstMerchant.length > 0) {
      //     this.lstMerchantActive = _.cloneDeep(this.lstMerchantsAll.filter((item: any) => this.areaActive.lstMerchant.includes(item.merchantId)));
      //   }
      // } else {
      //   this.areaActive = new AreaModel();
      //   this.lstMerchantActive = [];
      // }
    }
    this.cdr.detectChanges();
  }

  collectAreaIdsRemove(data: AreaModel[], idRemove: number) {
    let idsRemove: number[] = [idRemove];

    let itemRemove = data.find((item) => item.id == idRemove);
    if (itemRemove && itemRemove.children.length > 0) {
      idsRemove = idsRemove.concat(this.getAreaIdsChildren(itemRemove.children));
    }

    return idsRemove;
  }

  getAreaIdsChildren(arr: any) {
    let ids: number[] = [];

    arr.forEach((item: any) => {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        ids = ids.concat(this.getAreaIdsChildren(item.children));
      }
    });

    return ids;
  }

  onBlurCreateArea(event: any, areaId: number, isFormCreateInvalid: boolean) {

    let areaCreate:AreaModel = this.lstAreas.find(item => item.id == areaId) as AreaModel;
    if (areaCreate) {
      const { target } = event;
      let areaName = target?.value?.trim();
      let checkDuplicate = this.lstAreas.some(x => x.groupName == areaName);
      if (!checkDuplicate) {
        areaCreate.groupName = areaName;
        this.lstAreaByOrder = this.convertLstAreaByOrder(this.lstAreas, null);
        this.isFormCreateAreaInvalid = false;
        this.toast.showSuccess(`Tạo nhóm ${areaName} thành công`)
        this.updateActiveSubmit(areaCreate.id,true);
      }else
      {
        this.isFormCreateAreaInvalid = isFormCreateInvalid;
      }
    }
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
    if (this.isFormCreateAreaInvalid) {
      return;
    }
    this.areaActive = area;
    if (area.lstMerchant.length > 0) {
      this.lstMerchantActive = _.cloneDeep(this.lstMerchantsAll.filter((item: any) => area.lstMerchant.includes(item.merchantId)));
    }
    else {
      this.lstMerchantActive = [];
    }
    this.isEditArea = false;
  }

  doAssignSubmerchant() {
    const dialogRef = this.dialog.open(DialogAssignMerchantComponent, {
      width: '60%',
      data: this.lstMerchantRemain,
    });

    dialogRef.afterClosed().subscribe((lstMerchantIdChecked: number[]) => {
      if (lstMerchantIdChecked) {
        this.lstAreas.map((item: any) => {
          if (item.id == this.areaActive.id) {
            item.lstMerchant = lstMerchantIdChecked;
          }
        });
        this.lstMerchantActive = _.cloneDeep(this.lstMerchantsAll.filter((item: any) => lstMerchantIdChecked.includes(item.merchantId)));
        this.lstMerchantRemain = this.lstMerchantRemain.filter((item: any) => !lstMerchantIdChecked.includes(item.merchantId));
      }
    })

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

  onBlurEdit() {
    this.isCloseInput = false;
    setTimeout(() => {
      if (this.isEditArea && !this.isCloseInput) {
        this.cancelEdit();
      }
    }, 300);
  }

  updateAreaName() {
    let area = this.lstAreas.find(item => item.id === this.areaActive.id);
    if (area) {
      area.groupName = this.formEditArea.get("areaName")?.value;
    }
    let areaExits = this.lstAreas.find(item => item.groupName?.toLowerCase() === area?.groupName?.toLowerCase());
    if (areaExits && areaExits.id == this.areaActive.id) {
      this.formEditArea.get('areaName')!.setErrors({ areaExists: true });
      this.formEditArea.get('areaName')?.markAsTouched(); // Đánh dấu trường là touched để hiển thị lỗi nếu có
      this.formEditArea.updateValueAndValidity(); // Cập nhật trạng thái valid của form
  
    }

    this.isEditArea = false;
    this.toast.showSuccess('Đổi tên nhóm thành công')

  }

  doMoveMerchant(lstMerchantIdMove: any) {

    let lstAreaExistMove = this.lstAreas.filter(
      (item) => item.id != this.areaActive.id && item.children.length == 0
    );

    if (lstAreaExistMove?.length > 0) {
      let dataModel: MoveMerchantModel = new MoveMerchantModel();
      dataModel.lstAreas = this.lstAreas;
      dataModel.lstAreaByOrder = this.lstAreaByOrder;
      dataModel.areaIdActive = this.areaActive.id;
      dataModel.lstMerchantIdSelected = lstMerchantIdMove;

      const dialogRef = this.dialog.open(DialogMoveMerchantComponent, {
        width: '700px',
        data: dataModel,
      });

      dialogRef.afterClosed().subscribe((result: { areaId: number, merchantIds: any }) => {

        if (result?.areaId > 0) {
          let areaMove = this.lstAreas.find(item => item.id == result.areaId);

          if (areaMove) {

            const merchantIdsArray = result.merchantIds.lstRowId;
            let countMerchant = merchantIdsArray.length + areaMove.lstMerchant.length;


            if (countMerchant > 1000) {
              let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
              dataConfirm.title = 'Số lượng điểm kinh doanh đã vượt quá số lượng tối đa (1000 điểm)';
              dataConfirm.message = 'Vui lòng chuyển điểm kinh doanh sang nhóm khác';
              dataConfirm.icon = 'icon-warning';
              dataConfirm.iconColor = 'warning';
              dataConfirm.viewCancel = false;
              dataConfirm.buttonLabel = "Tôi đã hiểu";

              this.dialog.open(DialogConfirmComponent, {
                width: '500px',
                data: dataConfirm,
                disableClose: true,
              });
            } else {
              try {
                this.areaActive.lstMerchant = this.areaActive.lstMerchant.filter(
                  (id: number) => !merchantIdsArray.includes(id)
                );

              } catch (error) {
              }
              this.lstMerchantActive = _.cloneDeep(
                this.lstMerchantsAll.filter((item: any) =>
                  this.areaActive.lstMerchant.includes(item.merchantId)
                )
              );
              areaMove.lstMerchant = areaMove.lstMerchant.concat(merchantIdsArray);


              this.toast.showSuccess('Chuyển điểm kinh doanh thành công');
              this.doActiveArea(areaMove);
              areaMove.expanded = true;

            }
          } else {

          }
        } else {

        }
      });

    } else {

      let dataConfirm: DialogConfirmModel = new DialogConfirmModel();
      dataConfirm.title = 'Không tồn tại nhóm để chuyển điểm kinh doanh';
      dataConfirm.message = 'Vui lòng tạo nhóm mới để tiếp tục';
      dataConfirm.icon = 'icon-warning';
      dataConfirm.iconColor = 'warning';
      dataConfirm.buttonLabel = "Tạo nhóm mới";

      this.dialog.open(DialogConfirmComponent, {
        width: '500px',
        data: dataConfirm,
        disableClose: true,
      });
    }
  }

  doCreateOrg() {
    if (this.lstAreaByOrder.length > 0 && this.lstAreaByOrder[0].groupName) {
      let lstParam = _.cloneDeep(this.lstAreaByOrder);
      this.removeKeys(lstParam, ['id', 'parentId']);
      this.api.post(ORGANIZATION_ENDPOINT.SAVE_ORGANIZATION, lstParam).subscribe(
        (res: any) => {
          this.createSuccess.emit();
          this.toast.showInfo('Thiết lập tổ chức thành công!');
          //set thanh cong, update lại isconfig cho localstorage
          const userInfo = this.auth.getUserInfo();
          if (userInfo) {
            userInfo.isConfig = 1;
            localStorage.setItem(environment.userInfo, JSON.stringify(userInfo));
          }
        }, (error: any) => {
          const errorData = error?.error || {};
          this.toast.showError(errorData?.soaErrorDesc);
        });
    }
  }

  removeKeys(obj: any, keysToRemove: string[]): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.removeKeys(item, keysToRemove));
    } else if (obj !== null && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (keysToRemove.includes(key)) {
          delete obj[key];
        } else {
          this.removeKeys(obj[key], keysToRemove);
        }
      });
    }
  }

  doCancel() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Hủy thiết lập cơ cấu tổ chức';
    dataDialog.message = `Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn hủy thiết lập tổ chức không?`;
    dataDialog.icon = 'icon-error';
    dataDialog.iconColor = 'error';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.viewCancel = true;
    dataDialog.buttonColor = 'error';
    dataDialog.width = '500px'
    this.dialogCommon.openDialogInfo(dataDialog).subscribe((result: any) => {
      if (result) {
        this.cancelCreate.emit();
      }
    });

  }

  clearValue(nameInput: string) {
    this.formEditArea.get(nameInput)?.setValue('');
    this.isCloseInput = true
  }

  cancelEdit() {
    // Reset lại giá trị tên nhóm về tên cũ
    this.formEditArea.get('areaName')?.setValue(this.areaActive.groupName);
    this.isEditArea = false;
  }

  doActiveAreaCheckbox(group: any) {
    this.lstAreaByOrder.forEach((i: any) => {
      if (i !== group) i.expanded = false;
    });
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
          this.updateActiveSubmit(item, false);
        }
      }
    });
  }
}
