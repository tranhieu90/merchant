import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormBuilder, FormGroup, FormsModule,ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-m-dropdown',
  standalone: true,
  imports: [DropdownModule, FormsModule, ReactiveFormsModule, TooltipModule, MultiSelectModule],
  templateUrl: './m-dropdown.component.html',
  styleUrl: './m-dropdown.component.scss'
})
export class MDropdownComponent {
  formDropdown: FormGroup;
  countryOptions: any[] =[];
  valueDefault: string= 'VN';

  constructor(
    private fb: FormBuilder,
  ) {
    this.formDropdown = this.fb.group({
      valueDropdown: [''],
      valueDisabled: [{ value: 'VN', disabled: true }],
      valueDropdownError: ['', [Validators.required]],
      valueDropdownShowIconLeftError: ['', [Validators.required]],
      valueMultiSelect:[[]],
      valueMultiSelectDisabled: [{ value: ['VN','AU'], disabled: true }],
      valueMultiSelectError:[[], [Validators.required]],
      valueMultiSelectShowIconLeftError:[[], [Validators.required]],
    });

  }

  ngOnInit() {
    this.countryOptions = [
      { name: 'Viet Nam', code: 'VN' },
        { name: 'Australia', code: 'AU' },
        { name: 'Brazil', code: 'BR' },
        { name: 'China', code: 'CN' },
        { name: 'Egypt', code: 'EG' },
        { name: 'France', code: 'FR' },
        { name: 'Germany', code: 'DE' },
        { name: 'India', code: 'IN' },
        { name: 'Japan', code: 'JP' },
        { name: 'Spain', code: 'ES' },
        { name: 'United States', code: 'US' }
    ];
  }

   onSubmit() {
      if (this.formDropdown.invalid) {
        touchAndDirtyForm(this.formDropdown);
        this.formDropdown.markAllAsTouched();
        return;
      }
    }
}

export const touchAndDirtyForm = (form: FormGroup) => {
  Object.keys(form.controls).forEach(field => {
    const control = form.get(field);
    control?.markAsTouched({ onlySelf: true });
    control?.markAsDirty({ onlySelf: true });
  });
}