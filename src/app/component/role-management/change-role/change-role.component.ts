import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import {FetchApiService} from '../../../common/service/api/fetch-api.service';
import {ROlE_ENDPOINT} from '../../../common/enum/EApiUrl';

@Component({
  selector: 'app-change-role',
  standalone: true,
  imports: [ButtonModule, FormsModule, ReactiveFormsModule, InputTextModule, DropdownModule],
  templateUrl: './change-role.component.html',
  styleUrl: './change-role.component.scss'
})
export class ChangeRoleComponent {

  formChangeRole!: FormGroup;
  listRoles: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ChangeRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private api : FetchApiService
  ) {
    this.formChangeRole = this.fb.group({
      currentRole: ['', [Validators.required]],
      newRole: ['', [Validators.required]],
    });
    this.api.get(ROlE_ENDPOINT.GET_LIST_ROLE).subscribe(res => {
      this.listRoles = res['data'];
      this.formChangeRole.get("currentRole")?.setValue(this.data?.roleInfo?.id);
    })

  }

  ngOnInit() {
    this.formChangeRole.get('newRole')?.valueChanges.subscribe((newRole) => {
      this.validateRoleMatch(newRole);
    });
  }

  validateRoleMatch(newRole: string) {
    const currentRole = this.formChangeRole.get('currentRole')?.value;
    if (newRole && currentRole && newRole === currentRole) {
      this.formChangeRole.get('newRole')!.setErrors({ rolesMatch: true });
    } else {
      const control = this.formChangeRole.get('newRole');
      if (control && control.errors) {
        const errors = {...control.errors};
        delete errors['rolesMatch'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
  }

  onSubmit() {
    if (this.formChangeRole.invalid) {
      touchAndDirtyForm(this.formChangeRole);
      this.formChangeRole.markAllAsTouched();
      return;
    }
    const data = {
      "currentRole": this.formChangeRole.get("currentRole")?.value,
      "newRole": this.formChangeRole.get("newRole")?.value,
      "roleNameChange": this.listRoles.find(role => role.id === this.formChangeRole.get("newRole")?.value)?.name,
    }
    this.dialogRef.close(data);
  }

  onClose() {
    this.dialogRef.close();
  }

  onCancel() {
    this.dialogRef.close();
  }

  isFormChangeRoleValid(): boolean {
    return this.formChangeRole.valid;
  }

}


export const touchAndDirtyForm = (form: FormGroup) => {
  Object.keys(form.controls).forEach(field => {
    const control = form.get(field);
    control?.markAsTouched({ onlySelf: true });
    control?.markAsDirty({ onlySelf: true });
  });
}
