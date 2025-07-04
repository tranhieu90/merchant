import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnInit,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl
} from '@angular/forms';

@Component({
  selector: 'mb-dropdown',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, DropdownModule, FormsModule],
  templateUrl: './mb-dropdown.component.html',
  styleUrl: './mb-dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MbDropdown),
      multi: true
    }
  ]
})
export class MbDropdown implements ControlValueAccessor, OnInit {
  @Input() options: any[] = [];
  @Input() optionValue: string = 'value';
  @Input() optionLabel: string = 'label';
  @Input() placeholder: string = 'Chọn';
  @Input() disabled = false;
  @Input() filter: boolean = false;
  @Input() showIcon: boolean = false;
  @Input() iconClass: string = 'icon-default';
  @Input() dropdownClass: string = 'merchant-dropdown';
  @Input() showCheckmark: boolean = false;
  @Input() appendTo: string = '';
  value: any;
  onChange: any = () => { };
  onTouched: any = () => { };

  // Để lưu reference đến NgControl
  ngControl: NgControl | null = null;

  constructor(private injector: Injector, private cdr: ChangeDetectorRef) {
    // Thử cách khác để lấy NgControl
    setTimeout(() => {
      try {
        this.ngControl = this.injector.get(NgControl);
        if (this.ngControl) {
          this.ngControl.valueAccessor = this;
        }
      } catch (error) {
        this.ngControl = null;
      }
    });
  }

  ngOnInit(): void {
    // Lấy NgControl từ injector
    try {
      this.ngControl = this.injector.get(NgControl);
      if (this.ngControl) {
      }
    } catch (error) {
      this.ngControl = null;
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(event: any) {
    this.value = event;
    this.onChange(event);
    this.onTouched();
    this.cdr.detectChanges();
  }

  // Getter để check validation state
  get hasError(): boolean {
    if (!this.ngControl || !this.ngControl.control) {
      return false;
    }
    const control = this.ngControl.control;
    const hasError = control.invalid && (control.dirty || control.touched);
    return hasError;
  }
}