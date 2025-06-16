import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from "lodash";
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { ROlE_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { FunctionModel } from '../../../model/FunctionModel';
import { DialogRoleComponent, DialogRoleModel } from '../dialog-role/dialog-role.component';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { InputCommon } from '../../../common/directives/input.directive';
import { environment } from '../../../../environments/environment';
import { REGEX_PATTERN } from '../../../common/enum/RegexPattern';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InputTextModule,
    ShowClearOnFocusDirective,
    InputTextareaModule, ButtonModule, NgFor, NgIf, CheckboxModule, MatCheckboxModule, MatIconModule, InputNumberModule, InputCommon, InputSanitizeDirective],
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.scss',

})

export class CreateRoleComponent implements OnInit {

  formNameRole!: FormGroup;
  listFunction: any = [];
  listFunctionConvert: FunctionModel[] = [];
  listFunctionIdsSelected: any = [];
  listFunctionIdsSelectedOld: any = [];
  userInfo: any;

  currentStep: number = 0;
  roleId!: number;
  countUserInRole: number = 0;
  isSuccess: number = -1;
  isHasRoleAddUser: boolean = false;
  assetPath = environment.assetPath;
  textError: string = "Chỉ cho phép chữ, số, khoảng trắng và các ký tự đặc biệt - _ . , ( ), [ ], { }";

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private dialogCommon: DialogCommonService
  ) {
    this.routeActive.queryParams.subscribe(params => {
      //this.roleId = params['roleId'] || null;
      if (params['roleId']) {
        this.roleId = _.toNumber(params['roleId']);
        this.getDetailFunc();
        this.getNumberUserInRole();
      } else {
        this.getListFunc();
      }
    });
  }

  ngOnInit(): void {
    this.formNameRole = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(REGEX_PATTERN.VALIDATE_TEXT)]],
      description: ['', [Validators.maxLength(150)]]
    });
    this.userInfo = this.auth.getUserInfo();
    this.hasRoleAddUser();
  }

  removeRoleExistsError() {
    const control = this.formNameRole.get('roleName');
    if (control && control.errors) {
      const errors = { ...control.errors };
      delete errors['roleExists'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  doNextStep() {
    if (this.currentStep < 2) {
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

  doSaveRole() {
    if (this.roleId != null) {
      this.updateRole()
    } else {
      this.createRole();
    }
  }

  createRole() {
    let param = {
      roleName: this.formNameRole.get('roleName')?.value,
      description: this.formNameRole.get('description')?.value,
      functionId: this.listFunctionIdsSelected
    }

    this.api.post(ROlE_ENDPOINT.CREATE_ROLE, param).subscribe(res => {
      this.isSuccess = 1;
      this.doNextStep();
    },
      error => {
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == "ROLE_ERROR_002") {
          this.openDialogRoleAlreadyExists(error?.error?.soaErrorDesc);
        } else if (errorData.soaErrorCode == "ROLE_ERROR_003" || errorData.soaErrorCode == "INPUT_ERROR_001" || errorData.soaErrorCode == "203") {
          this.toast.showError(error?.error?.soaErrorDesc);
        } else {
          this.isSuccess = 0;
          this.doNextStep();
        }

      });
  }

  updateRole() {
    if (this.countUserInRole > 0) {
      let dataDialog: DialogConfirmModel = new DialogConfirmModel();
      dataDialog.title = 'Vai trò đang gán cho ' + this.countUserInRole + ' nhân sự';
      dataDialog.message = 'Việc thay đổi thông tin vai trò sẽ ảnh hưởng đến danh sách tính năng được sử dụng của nhân sự. Bạn có chắc chắn muốn tiếp tục cập nhật vai trò không?';
      dataDialog.buttonLabel = 'Tiếp tục';
      dataDialog.icon = 'icon-warning';
      dataDialog.viewCancel = true;
      dataDialog.iconColor = 'icon warning';
      this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
        if (result) {
          this.doUpdate();
        }
      });
      return;
    }
    this.doUpdate();
  }

  doUpdate() {
    let lstAddFunctionIds = this.listFunctionIdsSelected.filter((item: any) => !this.listFunctionIdsSelectedOld.includes(item));
    let lstDeleteFunctionIds = this.listFunctionIdsSelectedOld.filter((item: any) => !this.listFunctionIdsSelected.includes(item));
    let param = {
      roleId: this.roleId,
      roleName: this.formNameRole.get('roleName')?.value,
      description: this.formNameRole.get('description')?.value,
      addFunctionIds: lstAddFunctionIds,
      deleteFunctionIds: lstDeleteFunctionIds
    }

    this.api.put(ROlE_ENDPOINT.UPDATE_ROLE, param).subscribe(res => {
      this.isSuccess = 1;
      this.doNextStep();

    },
      error => {
        const errorData = error?.error || {};
        if (errorData.soaErrorCode == "ROLE_ERROR_002") {
          this.openDialogRoleAlreadyExists(error?.error?.soaErrorDesc);
        } else if (errorData.soaErrorCode == "ROLE_ERROR_003" || errorData.soaErrorCode == "INPUT_ERROR_001" || errorData.soaErrorCode == "203") {
          this.toast.showError(error?.error?.soaErrorDesc);
        } else {
          this.isSuccess = 0;
          this.doNextStep();
        }
      });
  }

  onBlurRoleName() {
    let roleName = this.formNameRole.get('roleName')?.value;
    if (roleName && roleName.length <= 50) {
      let param = {
        roleName: roleName,
        roleId: this.roleId ?? null
      }
      this.api.get(ROlE_ENDPOINT.CHECK_ROLE_NAME, CommonUtils.buildParamsPassNull(param)).subscribe(res => {
        this.removeRoleExistsError();
        if (this.formNameRole.valid) {
          this.doNextStep();
        }
      },
        error => {
          const errorData = error?.error || {};
          if (errorData.soaErrorCode == "ROLE_EXIST") {
            this.formNameRole.get('roleName')!.setErrors({ roleExists: true })
          }
        });
    }
  }

  getListFunc() {
    this.api.get(ROlE_ENDPOINT.GET_LIST_FUNCTION).subscribe(res => {
      this.listFunction = res['data'];
      this.listFunctionConvert = this.getListFuncConvert(res['data'], null);
    });
  }

  getDetailFunc() {
    this.api.get(ROlE_ENDPOINT.GET_DETAILS_FUNC + this.roleId).subscribe(res => {
      this.formNameRole.get('roleName')?.setValue(res['data']['name']);
      this.formNameRole.get('description')?.setValue(res['data']['description']);
      this.listFunction = res['data']['functionGroupModels'];
      this.listFunctionConvert = this.getListFuncConvert(res['data']['functionGroupModels'], null);
      this.listFunctionIdsSelected = this.getSelectedIds(this.listFunctionConvert);
      this.listFunctionIdsSelectedOld = this.listFunctionIdsSelected;
    });
  }

  getListFuncConvert(list: any[], parentId: number | null): any[] {
    let result = list.filter(item => item.parentId === parentId);

    result.forEach(item => {
      let children = this.getListFuncConvert(list, item.id);
      item.children = children;
      if (children.length > 0 && parentId === null) {

        const totalChild = this.getTotalChildren(item);
        const totalchildIsChoose = this.getTotalChildIsChoose(item);

        if (totalchildIsChoose > 0 && totalchildIsChoose < totalChild) {
          item.partiallyComplete = true;
        }
      }
    });
    return result;
  }

  onParentCheckboxChange(funcActive: FunctionModel) {
    funcActive.partiallyComplete = false;
    this.setChildrenActiveState(funcActive);
    this.listFunctionIdsSelected = this.getSelectedIds(this.listFunctionConvert);
  }

  onChildCheckboxChange(funcActive: FunctionModel) {

    let parentLevel0 = new FunctionModel();

    if (funcActive.level === 1) {
      if (funcActive.isChoose === false) {
        this.setChildrenActiveState(funcActive);
      }
      parentLevel0 = this.listFunction.find((item: FunctionModel) => item.id === funcActive.parentId);
    }
    else {
      let parentLevel1 = this.listFunction.find((item: any) => item.id === funcActive.parentId);
      if (parentLevel1) {
        parentLevel1.isChoose = true;
      }
      parentLevel0 = this.listFunction.find((item: FunctionModel) => item.id === parentLevel1.parentId);
    }

    if (parentLevel0) {
      const totalChild = this.getTotalChildren(parentLevel0);
      const totalchildIsChoose = this.getTotalChildIsChoose(parentLevel0);

      if (totalchildIsChoose > 0) {
        if (totalchildIsChoose === totalChild) {
          parentLevel0.isChoose = true;
          parentLevel0.partiallyComplete = false;
        }
        else {
          parentLevel0.isChoose = false
          parentLevel0.partiallyComplete = true;
        }
      }
      else {
        parentLevel0.partiallyComplete = false;
        parentLevel0.isChoose = false
      }
    }

    if (funcActive.isChoose && funcActive.dependentFunctionId != null && funcActive.dependentFunctionId.length > 0) {
      funcActive.dependentFunctionId?.forEach((item) => {
        let func = this.listFunction.find((func: any) => func.id == item);
        if (func && !func.isChoose) {
          func.isChoose = true;
          this.onChildCheckboxChange(func);
        }
      })
    }

    this.listFunctionIdsSelected = this.getSelectedIds(this.listFunctionConvert);
  }

  setChildrenActiveState(parent: any) {
    parent.children.forEach((child: FunctionModel) => {
      child.isChoose = parent.isChoose;
      if (child.children?.length > 0) {
        this.setChildrenActiveState(child);
      }
    });
  }

  getTotalChildren(parent: FunctionModel) {
    let total = 0;

    if (parent.children && parent.children.length > 0) {
      total += parent.children.length;

      parent.children.forEach(child => {
        total += this.getTotalChildren(child);
      });
    }

    return total;
  }

  getTotalChildIsChoose(parent: FunctionModel) {
    let total = 0;

    if (parent.children && parent.children.length > 0) {
      parent.children.forEach(child => {
        if (child.isChoose) {
          total += 1;
        }
        total += this.getTotalChildIsChoose(child);
      });
    }
    return total;
  }

  getSelectedIds(arr: any) {
    let ids: number[] = [];

    arr.forEach((item: any) => {
      if (item.isChoose) {
        ids.push(item.id);
      }
      if (item.children && item.children.length > 0) {
        ids = ids.concat(this.getSelectedIds(item.children));
      }
    });

    return ids;
  }

  isFormNameRoleValid(): boolean {
    return this.formNameRole.valid;
  }

  onCancel() {
    let action = this.roleId ? 'chỉnh sửa' : 'thêm mới';
    let dataConfirm: DialogRoleModel = new DialogRoleModel();
    dataConfirm.title = `Hủy ${action} vai trò`;
    dataConfirm.message = `Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ ${action} vai trò không?`;
    dataConfirm.icon = 'icon-error';
    dataConfirm.iconColor = 'error';
    dataConfirm.buttonRightColor = 'error';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: dataConfirm,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      debugger
      if (result != undefined && result !== false) {
        this.router.navigate(['/role']);
      }

    })
  }

  openDialogRoleAlreadyExists(roleName: string) {
    let dataConfirm: DialogRoleModel = new DialogRoleModel();
    dataConfirm.title = 'Vai trò đã tồn tại';
    dataConfirm.message = `Các chức năng đã chọn trùng với vai trò <b>${roleName}</b>. Vui lòng kiểm tra và chọn lại chức năng khác.`;
    dataConfirm.icon = 'icon-warning';
    dataConfirm.iconColor = 'warning';
    dataConfirm.hiddenButtonLeft = true;
    dataConfirm.buttonRightLabel = 'Tôi đã hiểu';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '600px',
      data: dataConfirm,
      disableClose: true,
    });
  }

  clearValue(nameInput: string) {
    this.formNameRole.get(nameInput)?.setValue('');
  }

  hasRoleAddUser() {
    return this.isHasRoleAddUser = this.auth.apiTracker("/api/v1/add-user-role");;
  }

  getNumberUserInRole() {
    let param = {
      roleId: this.roleId,
      pageSize: 10
    }

    this.api.get(ROlE_ENDPOINT.SEARCH_LIST_USER_ROLE, param).subscribe(res => {
      this.countUserInRole = res['data']['count'];
    });
  }

  onEnterRoleName(event: any): void {
    event.preventDefault(); // Ngăn hành vi mặc định của Enter (như submit form)
    this.onBlurRoleName();
    const roleNameControl = this.formNameRole.get('roleName');
    if (roleNameControl) {
      roleNameControl.markAsTouched(); // Đánh dấu trường là touched để hiển thị lỗi nếu có
      this.formNameRole.updateValueAndValidity(); // Cập nhật trạng thái valid của form
    }
  }

  backRole() {
    this.router.navigate(['/role']);
  }

  onContinue() {
    this.onBlurRoleName();
  }
}