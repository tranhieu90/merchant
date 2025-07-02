import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input:not([type=checkbox]):not([type=radio]), textarea',
  standalone:true
})
export class InputCommon {

  constructor(
    private el: ElementRef, 
    @Optional() private ngControl: NgControl
  ) { }

  @HostListener('blur') onBlur() {
    const trimmedValue = this.el.nativeElement.value.trim();
    
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(trimmedValue, { emitEvent: false });
    } else {
      this.el.nativeElement.value = trimmedValue;
    }
  }
}