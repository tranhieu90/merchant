import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputSanitize]',
  standalone: true // BẮT BUỘC nếu bạn không dùng module
})
export class InputSanitizeDirective {
  @Input('appInputSanitize') sanitizePattern?: string;

  private defaultPattern = /^[\p{L}0-9\-_.(),\[\]{} ]+$/u;
  private defaultCleanup = /[^\p{L}0-9\-_.(),\[\]{} ]+/gu;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private control: NgControl
  ) {}

  @HostListener('input')
  onInput(): void {
    setTimeout(() => this.cleanValue(), 0);
  }

  public cleanValue(): void {
    const inputEl = this.el.nativeElement;
    const value = inputEl.value;

    const regex = this.sanitizePattern
      ? new RegExp(`^${this.sanitizePattern}+$`, 'u')
      : this.defaultPattern;

    const cleanup = this.sanitizePattern
      ? new RegExp(`[^${this.sanitizePattern}]+`, 'gu')
      : this.defaultCleanup;

    if (!regex.test(value)) {
      const newValue = value.replace(cleanup, '');
      inputEl.value = newValue;

      if (this.control?.control) {
        this.control.control.setValue(newValue, { emitEvent: false });
      }
    }
  }
}
