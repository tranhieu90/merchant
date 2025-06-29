import { Directive, ElementRef, HostListener, Input } from '@angular/core'

/**
 * nhập liệu text
 * @description directive common for number input
 */

@Directive({
  selector: 'input[micro], textarea[micro]',
  standalone: true
})
export class FormMicroDirective {
  @Input() micro: any

  constructor() {}

  @HostListener('paste', ['$event']) onPaste(event: KeyboardEvent) {}

  @HostListener('input', ['$event']) onInputChange(event: KeyboardEvent) {
    if (typeof this.micro === 'function') {
      this.micro.call(this)
    }
  }
}
