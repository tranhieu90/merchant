import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  constructor() { }

  removeErrors(formGroup: FormGroup, controlNames: string[], errorKeys: string[]): void {
    controlNames.forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control && control.errors) {
        const errors = { ...control.errors };

        // Xóa các lỗi trong danh sách errorKeys
        errorKeys.forEach(errorKey => {
          delete errors[errorKey];
        });

        // Cập nhật lại errors, nếu không còn lỗi nào thì set null
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    });
  }
}
