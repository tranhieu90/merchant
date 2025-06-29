import { Directive, EventEmitter, Input, isDevMode, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms'

import * as _ from 'lodash'
import { CustomValidatorDirective, ValidatorRegex } from '../../../common/directives/custom-validator.directive'
import { FormType } from '../models/form-type.model'
import { IFormControls } from '../models/form-control.model'

@Directive()
export abstract class FormGroupAbstractComponent implements OnInit, OnChanges {
  get f(): IFormControls {
    return this.form.controls
  }
  @Input()
  item!: FormType<string>
  @Input()
  form: FormGroup = new FormGroup({})
  @Output() onChanged = new EventEmitter()
  id!: string // id open
  code!: string // id open
  errors = []

  // Biến flag để đánh dấu component đã được load lần đầu tiên hay chưa
  isFirstLoad: boolean = true

  protected constructor() {}

  ngOnInit() {
    // Kiểm tra xem component đã được load lần đầu tiên hay không
    if (this.isFirstLoad) {
      // Thực hiện các công việc cần thiết khi component được load lần đầu tiên
      console.log('Component được load lần đầu tiên')
      // Đặt biến isFirstLoad thành false để không thực hiện lại trong các lần load sau
      this.isFirstLoad = false
    }
  }

  emitOnChanged($event: any, extraData = {}) {
    this.onChanged.emit({ form: this.form, data: $event, item: this.item, ...extraData })
  }

  ngAfterContentInit() {
    this.emitOnChanged('onCreateForm')
  }

  /**
   * builder form ui sẽ cần để case này.
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form.get(this.item.key)) {
      // tạo mới control với case form builder, ko cần truyền formGroup
      this.form.setControl(this.item.key, this.toFormGroup([this.item]))
    } else {
      // nếu object config thay đổi thì sẽ cập nhật lại form
      if (!changes?.['item']?.firstChange && !_.isEqual(changes?.['item']?.currentValue, changes?.['item']?.previousValue)) {
        this.form.setControl(this.item.key, this.toFormGroup([this.item]))
        this.emitOnChanged('onCreateForm')
      }
      // cập nhật giá trị nếu item thay đổi cho case thay đổi cấu trúc item thì sẽ update lại formControl
      const control = this.form?.get(this.item.key);
      if (this.item.syncValue && this.item.value && control && control.value !== this.item.value) {
        control.setValue(this.item?.value)
      }
    }
  }

  /**
   * Xử lý valid input
   * @param formGroup
   * @param controlName
   * @returns
   */
  public static isInvalidInput(formGroup: FormGroup, controlName: string): boolean {
    if (formGroup == null) {
      return false
    }

    const control = formGroup.get(controlName)
    if (!control) {
      console.error('Không tìm thấy control: ', controlName)
      return false
    }
    if (control == null) {
      return false
    }
    return (control.dirty || control.touched) && control.invalid
  }

  /**
   * Xử lý kiểm tra valid control
   * @param controlName
   * @param error
   * @returns
   */
  isValidControl(controlName: string, error: string = '') {
    const control = this.f[controlName]
    if (!control) {
      console.error('Không tìm thấy control: ', controlName)
      return
    }
    if (!error) {
      return control?.touched && control?.invalid
    }
    return control?.touched && control.hasError(error)
  }

  /**
   * Xử lý kiểm tra valid input date
   * @param controlName
   * @param error
   * @returns
   */
  isValidControlDate(controlName: string, error: string = '') {
    const control = this.f[controlName]
    // Kiểm tra nếu có 2 lỗi thì hiển thị 1 lỗi
    if (!control) {
      console.error('Không tìm thấy control: ', controlName)
      return
    }
    if (_.values(control.errors).length > 1 && control.hasError('matDatepickerParse')) {
      if (error === 'matDatepickerParse') {
        if (!error) {
          return control?.touched && control?.invalid
        }
        return control?.touched && control.hasError(error)
      }
      return false
    } else {
      if (!error) {
        return control?.touched && control?.invalid
      }
      return control?.touched && control.hasError(error)
    }
  }

  /**
   * Xử lý kiểm tra custom validate của item
   * @param controlName
   * @param error
   * @returns
   */

  isValidCustom(controlName: string, error: string | string[] = '') {
    const control = this.f[controlName]

    // mảng lỗi 1 phần tử thì ép về kiểu string để parse error
    if (control.errors?.['errorValue'] && this.isJsonString(control.errors?.['errorValue']) && error?.length === 1) {
      const message = JSON.parse(control.errors?.['errorValue'])
      if (message?.data?.length) {
        error = error[0]
      }
    }

    // Kiểm tra nếu có lỗi khác thì không hiển thị lỗi custom nữa
    const keysError = _.keys(control.errors).filter((x) => x != 'errorValue')
    if (keysError.length > 1) {
      const intersection = keysError.filter((element) => error.includes(element))
      if (intersection.length == keysError.length) {
        return {
          key: control?.touched,
          value: keysError[0] == 'customMessageError' ? control.errors?.['errorValue'] : keysError[0]
        }
      } else {
        return { key: false, value: '' }
      }
    }
    if (typeof error === 'string') {
      if (!error) return { key: control.touched && control.invalid, value: '' }
      //case message isJSON, trường hợp object để báo lỗi với ID có thể click để open dialog
      if (this.isJsonString(control.errors?.['errorValue'])) {
        const message = JSON.parse(control.errors?.['errorValue'])
        this.id = message?.id // id click open
        this.code = message?.code // code display

        this.errors = message?.data || []

        return {
          key: control?.touched && control.invalid,
          value: error == 'customMessageError' ? message?.message : error
        }
      } else {
        return {
          key: control?.touched && control.invalid,
          value: error == 'customMessageError' ? control.errors?.['errorValue'] : error
        }
      }
    } else {
      let err
      let isErr = 0
      if (Array.isArray(error)) {
        error.forEach((val) => {
          if (control?.touched && control.hasError(val)) {
            err = {
              key: true,
              value: val == 'customMessageError' ? control?.errors?.['errorValue'] : val
            }
            isErr++
          }
        })
      }
      const errorLength = _.values(control?.errors).filter((x) => x == true).length
      if (errorLength > 1 && isErr != errorLength) {
        return { key: false, value: '' }
      }
      return err ? err : { key: control?.touched && control?.invalid, value: '' }
    }
  }

  /**
   *  Xử lý kiểm tra custom validate của input
   * @param formGroup
   * @param controlName
   * @returns
   */
  public isValidInput(formGroup: FormGroup, controlName: string): boolean {
    if (!formGroup) {
      return false
    }
    if (formGroup == null) {
      return false
    }
    const control = formGroup.get(controlName)
    if (control == null) {
      return false
    }
    return (control.dirty || control.touched) && !control.invalid
  }

  isJsonString(str: any) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  toFormGroup(items: FormType<any>[]) {
    let control = null
    items.forEach((item) => {
      if (item.controlType === 'template') {
        return
      }
      const validate: ValidatorFn[] = []
      if (item.max) {
        validate.push(Validators.max(Number(item.max)))
      }
      if (item.min) {
        validate.push(Validators.min(Number(item.min)))
      }
      if (item.maxLength) {
        validate.push(Validators.maxLength(Number(item.maxLength)))
      }
      if (item.minLength) {
        validate.push(Validators.minLength(Number(item.minLength)))
      }
      if (item.required) {
        validate.push(Validators.required)
        validate.push(CustomValidatorDirective())
      }
      if (item.regex) {
        validate.push(ValidatorRegex(item.regex))
      }
      if (item.updateOn === 'blur') {
        control = new FormControl(item.value, {
          validators: validate,
          updateOn: 'blur'
        })
      } else if (item.updateOn === 'submit') {
        control = new FormControl(item.value, {
          validators: validate,
          updateOn: 'submit'
        })
      } else {
        control = new FormControl(item.value, validate)
      }
    })
    return control
  }

  clearArrayErrors() {
    this.errors = []
  }
}
