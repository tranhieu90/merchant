import {
  Component,
  forwardRef,
  Input,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'm-input',
  standalone: true,
  imports: [
    InputTextModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './m-input.component.html',
  styleUrl: './m-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MInputComponent),
      multi: true,
    },
  ],
})
export class MInputComponent
  implements ControlValueAccessor, Validator, OnInit {


  ngOnInit(): void { }
  control!: AbstractControl;
  value: string = '';
  disabled: boolean = false;
  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };
  onValidatorChange!: () => void;
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value?.trim();
    this.onChange(value);
    this.onTouched();
    if(this.control){
      this.control.updateValueAndValidity();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.control = control;
    return null;
  }
  registerOnValidatorChange?(fn: () => void): void {
    this.onValidatorChange = fn;
  }
  clearValue() {
    this.value = '';
    this.onChange(this.value);
    this.onTouched();
  }
}
