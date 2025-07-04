import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
@Component({
  selector: 'app-m-checkbox',
  standalone: true,
  imports: [MatCheckboxModule, FormsModule, RadioButtonModule, InputSwitchModule, IconFieldModule, InputIconModule, InputTextModule, ChipsModule, ChipModule],
  templateUrl: './m-checkbox.component.html',
  styleUrl: './m-checkbox.component.scss'
})
export class MCheckboxComponent {
  checked: boolean = true
  unChecked: boolean = false;
  isRadio!: number
  radioDisable: number = 2
  radioCheck: number = 2;
  switchInput: boolean = false;
  values: string[] | undefined;
  indeterminate: boolean = true
}
