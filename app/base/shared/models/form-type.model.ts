/**
 * @author PHUONGPV
 * 12.08.2021
 * Với tham số paramData - Không sử dụng invalid và validations là tên biến (Đang sử dụng để check validate)
 */

import * as _ from 'lodash'

export type paramData = {
  isTag?:            boolean;
  url?:              string;
  key?:              string;
  value?:            string[];
  preLoad?:          boolean;
  defaultKeySearch?: string;
  maxSelectedItems?: string;
  isOpen?:           boolean;
  bindValue?:        string;
  changeEvent?:      any;
}

export class FormType<T> {
  value: T | T[] | undefined;
  key: string
  label: string
  required: boolean
  max?: string
  min?: string
  maxLength: string | number | null
  minLength: string | number | null
  maxDate?: string
  minDate?: string
  order: number
  controlType: string
  focus: boolean
  type: string
  placeholder: string
  options: { key: string; value: string; checked?: boolean; extra?: any }[]
  layout: string
  directives: string
  customDirectives: string
  microDirectives?: () => void
  customValidate: string | string[]
  updateOn: string
  template: string
  reset: boolean
  paramData: paramData
  title: boolean
  pattern: string
  checked: boolean // Sử dụng cho checkboxItem
  readOnly?: boolean
  minRow?: string
  hideValueCheckBox?: boolean
  hidden?: boolean // input hidden
  clearable?: boolean = false // clean ng select
  addTag?: boolean // add tag ng select,
  closeOnSelect?: boolean = true
  clearSearchOnAdd?: boolean = false
  regex?: RegExp
  checkBoxKey?: string // 'key' | 'value',
  syncValue?: boolean = true // nếu bật true mà value của item thay đổi sẽ update cho formControl của form đã tạo
  constructor(options: {
    value: T | T[]
    key?: string
    label?: string
    required?: boolean
    max?: string
    min?: string
    maxLength?: string | number | null
    minLength?: string | number | null
    maxDate?: string
    minDate?: string
    order?: number
    controlType?: string
    focus?: boolean
    type?: string
    placeholder?: string
    options?: {
      key: string
      value: string
      checked?: boolean
      extra?: any
    }[]
    layout?: string
    directives?: string
    customDirectives?: string
    microDirectives?: () => void
    customValidate?: string | string[]
    updateOn?: string
    template?: string
    reset?: boolean
    paramData?: any // Không sử dụng invalid và validations là tên biến (Đang sử dụng để check validate)
    title?: boolean
    pattern?: string
    checked?: boolean // Sử dụng cho checkboxItem
    readOnly?: boolean
    minRow?: string
    hidden?: boolean // input hidden,
    hideValueCheckBox?: boolean // hide value checkbox
    clearable?: boolean // clean ng select
    closeOnSelect?: boolean
    clearSearchOnAdd?: boolean
    addTag?: boolean // add tag ng select
    regex?: RegExp
    checkBoxKey?: string // 'key' | 'value',
    syncValue?: boolean
  }) {
    this.value = options.controlType === 'ngselect' && options.value == '' ? undefined : options.value
    this.key = options.key || ''
    this.label = options.label || ''
    this.required = !!options.required
    this.max = options.max
    this.min = options.min
    this.maxLength = options.maxLength ? options.maxLength : null
    this.minLength = options.minLength ? options.minLength : null
    this.maxDate = options.maxDate
    this.minDate = options.minDate
    this.order = options.order === undefined ? 1 : options.order
    this.controlType = options.controlType || ''
    this.type = options.type || ''
    this.placeholder = options.placeholder || ''
    this.focus = !!options.focus
    this.options = options.options || []
    this.layout = options.layout || '100'
    this.directives = options.directives || ''
    this.customDirectives = options.customDirectives || ''
    this.microDirectives = options.microDirectives
    this.customValidate = options.customValidate || ''
    this.updateOn = options.updateOn || ''
    this.template = options.template || ''
    this.reset = !!options.reset
    this.paramData = options.paramData
    this.title = !!options.title
    this.pattern = options.pattern || ''
    this.checked = !!options.checked
    this.readOnly = options.readOnly || false
    this.minRow = options.minRow || '2'
    this.hidden = options.hidden
    this.hideValueCheckBox = options.hideValueCheckBox
    this.clearable = _.isBoolean(options.clearable) ? options.clearable : false
    this.closeOnSelect = _.isBoolean(options.closeOnSelect) ? options.closeOnSelect : true
    this.clearSearchOnAdd = _.isBoolean(options.clearSearchOnAdd) ? options.clearSearchOnAdd : false
    this.addTag = options.addTag
    this.regex = options.regex ? options.regex : undefined
    this.checkBoxKey = options.checkBoxKey ? options.checkBoxKey : 'value'
    this.syncValue = options.syncValue
  }

  toJSON() {
    var jsonedObject = {};
    for (var x in this) {

      if (x === "toJSON" || x === "constructor") {
        continue;
      }
      // @ts-ignore
      jsonedObject[x] = this[x];
    }
    return jsonedObject;
  }
}
