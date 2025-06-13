import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
@Component({
  selector: 'app-m-checkbox',
  standalone: true,
  imports: [CheckboxModule,FormsModule,RadioButtonModule,InputSwitchModule,IconFieldModule,InputIconModule,InputTextModule,ChipsModule,ChipModule],
  templateUrl: './m-checkbox.component.html',
  styleUrl: './m-checkbox.component.scss'
})
export class MCheckboxComponent {
  checked:boolean=true
  unChecked:boolean=false;
  isRadio!:number
  radioDisable:number=2
  radioCheck:number=2;
  switchInput:boolean=false;
  values: string[] | undefined;
}
