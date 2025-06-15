import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputSanitize2]',
  standalone: true // BẮT BUỘC nếu bạn không dùng module
})
export class InputSanitizeDirective2 {
  @Input('appInputSanitize2') sanitizePattern?: string;

  private defaultPattern = /^[a-zA-Z0-9 ]+$/;
  private defaultCleanup = /[^a-zA-Z0-9 ]+/g;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private control: NgControl
  ) {}

  @HostListener('input')
  onInput(): void {
    this.cleanValue();
  }

  public cleanValue(): void {
    const inputEl = this.el.nativeElement;
    const rawValue = inputEl.value;

    // Bước 1: Loại bỏ dấu tiếng Việt
    const normalizedValue = rawValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Bước 2: Dùng pattern như cũ
    const regex = this.sanitizePattern
      ? new RegExp(`^${this.sanitizePattern}+$`, 'u')
      : this.defaultPattern;

    const cleanup = this.sanitizePattern
      ? new RegExp(`[^${this.sanitizePattern}]+`, 'gu')
      : this.defaultCleanup;

    // Nếu không hợp lệ → làm sạch
    if (!regex.test(normalizedValue)) {
      const cleaned = normalizedValue.replace(cleanup, '');
      inputEl.value = cleaned;

      if (this.control?.control) {
        this.control.control.setValue(cleaned, { emitEvent: false });
      }
    } else {
      // Nếu hợp lệ nhưng có dấu, thì vẫn cần cập nhật lại value không dấu
      if (rawValue !== normalizedValue) {
        inputEl.value = normalizedValue;
        if (this.control?.control) {
          this.control.control.setValue(normalizedValue, { emitEvent: false });
        }
      }
    }
  }
}
