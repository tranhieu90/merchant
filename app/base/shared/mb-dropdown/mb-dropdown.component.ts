import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter, forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {DropdownModule} from 'primeng/dropdown';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
 
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
export class MbDropdown implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionValue: string = 'value';
  @Input() optionLabel: string = 'label';
  @Input() placeholder: string = 'Chọn';
  @Input() disabled = false;
  @Input() filter: boolean = false;
  @Input() showIcon: boolean = false;
  @Input() iconClass: string = 'icon-default';
  // Template cho custom item
  @Input() showCheckmark: boolean = false;
 
  value: any;
  onChange: any = () => {};
  onTouched: any = () => {};
 
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
  }
}