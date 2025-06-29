import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MatCard } from '@angular/material/card';
import { PaginatorModule } from 'primeng/paginator';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MaterialModule } from '../material.module';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {AutoCompleteModule } from 'primeng/autocomplete';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [
    MaterialModule, ButtonModule, InputTextModule, FormsModule, InputNumberModule, InputGroupModule, InputGroupAddonModule, IconFieldModule,
    InputIconModule, InputTextareaModule, TooltipModule, AutoCompleteModule,ShowClearOnFocusDirective
  ],
  templateUrl: './input-demo.component.html',
  styleUrl: './input-demo.component.scss'
})
export class InputDemoComponent {
  formInput!: FormGroup;
  textArea: string = "Text...";
  maxLength: number = 1000;

  items: any[] =[];
  suggestions: any[] =[];

  constructor(
    private fb: FormBuilder,
  ) {
    this.formInput = this.fb.group({
      valueInput: [''],
      valueInputError: ['', [Validators.required]],
      valueInputShowIconLeft: [''],
      valueInputShowIconLeftError: ['', [Validators.required]],
      valueInputShowIconRight: [''],
      valueInputShowIconRightError: ['', [Validators.required]],
      valueInputShowIconLeftRight: [''],
      valueInputShowIconLeftRightError: ['', [Validators.required]],
      valueInputSearch_Input: [''],
      valueTextArea: [''],
      valueTextAreaError: ['', [Validators.required]],
      valueInputSearch: [],
      valueInputSearchError: [, [Validators.required]],
      valueInputSearchShowIconRight: [],
      valueInputSearchShowIconRightError: [, [Validators.required]],
    });
  }

  submit() {
    if (this.formInput.invalid) {
      touchAndDirtyForm(this.formInput);
      this.formInput.markAllAsTouched();
      return;
    }
  }

  clearValue(nameInput: string) {
    this.formInput.get(nameInput)?.setValue('');
  }

  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = [...Array(10).keys()].map(item => event.query + '-' + item);
  }

  checkValue(){
    console.log(this.formInput.get('valueInputSearch')?.value);
  }

}
export const touchAndDirtyForm = (form: FormGroup) => {
  Object.keys(form.controls).forEach(field => {
    const control = form.get(field);
    control?.markAsTouched({ onlySelf: true });
    control?.markAsDirty({ onlySelf: true });
  });
}



