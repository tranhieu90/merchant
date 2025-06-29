import { Directive, ElementRef, HostListener, Input } from '@angular/core'
import { NgControl } from '@angular/forms'
import { turnAlphanumberic } from '../utils/utils.function'

/**
 * @description directive common for number input
 */

@Directive({
    selector: 'input[regex], textarea[regex]',
    standalone: true
})
export class FormRegexDirective {
  @Input() regex: any

  constructor(
    private _el: ElementRef,
    private control: NgControl
  ) {}

  @HostListener('paste', ['$event']) onPaste(event: KeyboardEvent) {
    if (!!this.regex) {
      this._el.nativeElement.value = turnAlphanumberic(
        this._el.nativeElement.value,
        this.regex
      )
      this.control?.control?.setValue(
        turnAlphanumberic(this._el.nativeElement.value, this.regex)
      )
    }
  }

  @HostListener('input', ['$event']) onInputChange(event: KeyboardEvent) {
    if (!!this.regex) {
      this._el.nativeElement.value = turnAlphanumberic(
        this._el.nativeElement.value,
        this.regex
      )
      this.control?.control?.setValue(
        turnAlphanumberic(this._el.nativeElement.value, this.regex)
      )
    }
  }
}
