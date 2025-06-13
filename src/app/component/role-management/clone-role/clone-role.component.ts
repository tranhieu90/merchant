import { Component } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatStepperModule } from "@angular/material/stepper";
import { NgFor, NgIf } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { FunctionModel } from '../../../model/FunctionModel';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import * as _ from 'lodash';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ROlE_ENDPOINT } from '../../../common/enum/EApiUrl';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { DialogRoleComponent, DialogRoleModel } from '../dialog-role/dialog-role.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CheckboxModule } from 'primeng/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputCommon } from '../../../common/directives/input.directive';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clone-role',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InputTextModule,
    InputTextareaModule, ButtonModule, NgFor, NgIf, CheckboxModule, MatCheckboxModule, MatIconModule, InputNumberModule, InputCommon],
  templateUrl: './clone-role.component.html',
  styleUrl: './clone-role.component.scss'
})
export class CloneRoleComponent {
  formNameRole!: FormGroup;
  listFunction: any = [];
  listFunctionConvert: FunctionModel[] = [];
  listFunctionIdsSelected: any = [];
  userInfo: any;

  currentStep: number = 0;
  roleId!: number;
  isSuccess: number = -1;
  isHasRoleAddUser: boolean = false;
  assetPath = environment.assetPath;
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
      this.roleId = params['roleId'] || null;
      if (params['roleId']) {
        this.roleId = _.toNumber(params['roleId']);
        this.getDetailFunc();
      }
    });
  }

  ngOnInit(): void {
    this.formNameRole = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(1000)]]
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
    let param = {
      roleName: this.formNameRole.get('roleName')?.value,
      description: this.formNameRole.get('description')?.value,
      functionId: this.listFunctionIdsSelected
    }

    this.api.post(ROlE_ENDPOINT.CREATE_ROLE, param).subscribe(res => {
      this.isSuccess = 1;
      this.doNextStep()
    },
      error => {
        const errorData = error?.error || {};
        let dataDialog: DialogConfirmModel = new DialogConfirmModel();
        if (errorData.soaErrorCode == "ROLE_ERROR_002") {
          dataDialog.title = 'Vai trò đã tồn tại';
          dataDialog.message = errorData.soaErrorDesc;
          dataDialog.buttonLabel = 'Tôi đã hiểu';
          dataDialog.icon = 'icon-change_password';
          dataDialog.iconColor = 'icon warning';
          dataDialog.width = '30%';
          dataDialog.viewCancel = false;
          this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
          });
          this.isSuccess = 0;
          this.doPreStep();
          return;
        }
        this.toast.showError(error?.error?.soaErrorDesc);
        this.doNextStep()
      });
    ;
  }

  onBlurRoleName(event: any) {
    let param = {
      roleName: event?.target?.value,
      roleId: null
    }
    this.api.get(ROlE_ENDPOINT.CHECK_ROLE_NAME, CommonUtils.buildParamsPassNull(param)).subscribe(res => {
      let status: number = res["data"]["status"];
      if (status && status === 1) {
        this.formNameRole.get('roleName')!.setErrors({ roleExists: true })
      } else {
        this.removeRoleExistsError();
      }
    });
  }

  getDetailFunc() {
    this.api.get(ROlE_ENDPOINT.GET_DETAILS_FUNC + this.roleId).subscribe(res => {
      this.formNameRole.get('roleName')?.setValue(res['data']['name']);
      this.formNameRole.get('description')?.setValue(res['data']['description']);
      this.listFunction = res['data']['functionGroupModels'];
      this.listFunctionConvert = this.initViewPermission(res['data']['functionGroupModels'], null);
      this.listFunctionIdsSelected = this.getSelectedIds(this.listFunctionConvert);
      this.onBlurRoleName({ target: { value: res['data']['name'] } });
      this.formNameRole.get('roleName')!.markAsTouched();
      this.formNameRole.get('roleName')!.updateValueAndValidity();
    });
  }

  initViewPermission(list: any[], parentId: number | null): any[] {
    let result = list.filter(item => item.parentId === parentId);

    result.forEach(item => {
      let children = this.initViewPermission(list, item.id);
      item.children = children;
      const allActive = item.children.every((child: FunctionModel) => child.isChoose);
      const anyActive = item.children.some((child: FunctionModel) => child.isChoose);
      const anyPartiallyComplete = item.children.some((child: FunctionModel) => child.partiallyComplete);
      if (anyActive && !allActive || anyPartiallyComplete) {
        item.partiallyComplete = true;
      }
    });

    return result;
  }


  onParentCheckboxChange(parentFunctionModel: any) {

    parentFunctionModel.partiallyComplete = false;
    // Nếu parent là active, tất cả các con (children) sẽ được active
    this.setChildrenActiveState(parentFunctionModel, parentFunctionModel.isChoose);
    this.listFunctionIdsSelected = this.getSelectedIds(this.listFunctionConvert);
  }

  onChildCheckboxChange(parentFunctionModel: FunctionModel) {

    // Kiểm tra nếu tất cả các child đều active, thì parent sẽ active
    const allActive = parentFunctionModel.children.every((child: FunctionModel) => child.isChoose);
    const anyActive = parentFunctionModel.children.some((child: FunctionModel) => child.isChoose);
    parentFunctionModel.isChoose = allActive; // Cập nhật trạng thái của parent

    if (anyActive && !allActive) {
      parentFunctionModel.partiallyComplete = true;
    } else {
      parentFunctionModel.partiallyComplete = false;
    }

    parentFunctionModel.children.forEach((child: FunctionModel) => {
      if (child.children?.length > 0) {
        this.setChildrenActiveState(child, child.isChoose);
      }
    });

    if (parentFunctionModel.level === 1) {
      const parentLevel0 = this.listFunctionConvert.find((item: FunctionModel) => item.id === parentFunctionModel.parentId);
      if (parentLevel0) {
        const allActiveLevel0 = parentLevel0.children.every((child: FunctionModel) => child.isChoose);
        const anyActiveLevel0 = parentLevel0.children.some((child: FunctionModel) => child.isChoose);
        const anyPartiallyComplete = parentLevel0.children.some((child: FunctionModel) => child.partiallyComplete);
        parentLevel0.isChoose = allActiveLevel0;

        if (anyActiveLevel0 && !allActiveLevel0 || anyPartiallyComplete) {
          parentLevel0.partiallyComplete = true;
        } else {
          parentLevel0.partiallyComplete = false;
        }
      }
    }

    this.listFunctionIdsSelected = this.getSelectedIds(this.listFunctionConvert);
  }

  // Hàm này giúp đồng bộ trạng thái của con và cha cho cả các cấp
  setChildrenActiveState(parentFunctionModel: any, isChoose: boolean) {
    parentFunctionModel.children.forEach((child: FunctionModel) => {
      child.isChoose = isChoose; // Cập nhật trạng thái của child
      if (parentFunctionModel.level === 0) {
        child.partiallyComplete = false;
      }

      if (child.children?.length > 0) {
        this.setChildrenActiveState(child, isChoose);
      }

    });
  }

  getSelectedIds(arr: any) {
    let ids: number[] = [];

    arr.forEach((item: any) => {
      if (item.isChoose) {
        ids.push(item.id);
      }
      if (item.children && item.children.length > 0) {
        ids = ids.concat(this.getSelectedIds(item.children)); // Đệ quy vào children
      }
    });

    return ids;
  }

  onCancel() {
    let dataConfirm: DialogRoleModel = new DialogRoleModel();
    dataConfirm.title = 'Hủy sao chép vai trò';
    dataConfirm.message = 'Các thông tin sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ thêm mới vai trò không?';
    dataConfirm.icon = 'icon-error';
    dataConfirm.iconColor = 'error';
    dataConfirm.buttonRightColor = 'error';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '600px',
      data: dataConfirm,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/role']);
      }
    })
  }

  clearValue(nameInput: string) {
    this.formNameRole.get(nameInput)?.setValue('');
  }

  hasRoleAddUser() {
    return this.isHasRoleAddUser = this.userInfo?.userName == 'admin';
  }

}
