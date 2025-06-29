import { FormType } from './form-type.model'

export class DropdownItem extends FormType<string> {
  override controlType = 'dropdown'
}

export class RadioItem extends FormType<string> {
  override controlType = 'radio'
}

export class TextAreaItem extends FormType<string> {
  override controlType = 'textarea'
}

export class DateTimeItem extends FormType<string> {
  override controlType = 'datetime'
}

export class TextboxItem extends FormType<string> {
  override controlType = 'textbox'
}

export class CheckboxItem extends FormType<string> {
  override controlType = 'checkbox'
}

export class NgSelectItem extends FormType<string> {
  override controlType = 'ngselect'
}

export class AutoComplateItem extends FormType<string> {
  override controlType = 'autocomplate'
}

export class HiddenItem extends FormType<string> {
  override controlType = 'hidden'
}

export class SlideItem extends FormType<boolean> {
  override controlType = 'slide'
}

export class Template extends FormType<string> {
  override controlType = 'template'
}

export class FormControlModel extends FormType<string> {
}
