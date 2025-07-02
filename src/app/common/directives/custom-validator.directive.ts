import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms'
import * as _ from 'lodash'

export function CustomValidatorDirective(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || ''
    if (value?.length && startsWithSpace(value)) {
      return { whitespace: true }
    }
    return null
  }
}

/**
 * ThanhNX
 * Cho phép nhận tiếng việt
 * Không cho phép nhập ký tự đặc biệt
 * @constructor
 */
export function ValidatorSpecialChars(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regx =
      /^[a-zA-Z0-9_ ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$/
    const value = control.value || ''
    if (!value || !regx.test(value.trim())) {
      return { required: true }
    }
    return null
  }
}

export function ValidatorRegex(regex: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || ''
    if (!value || !regex.test(value)) {
      return {
        customMessageError: true,
        errorValue: 'Giá trị nhập không đúng định dạng'
      }
    }
    return null
  }
}

export function ValidatorArrayControlUniqueValue(arraySource: [], uniqueField: any, error = ''): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || []
    const uniqueByKey = _.uniqBy(arraySource || [], uniqueField)
    console.log(uniqueByKey)
    if (arraySource?.length !== uniqueByKey?.length) {
      return { required: true }
      return null
      // return {
      //   customMessageError: true,
      //   errorValue: 'Hệ thống đã được chọn'
      // }
    }
    return null
  }
}

function startsWithSpace(str : any) {
  return /^\s/.test(str)
}



export function maxLengthArray(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      return control.length <= maxLength ? null : { maxLengthArray: { requiredLength: maxLength, actualLength: control.length } };
    }
    return null;
  };
}
