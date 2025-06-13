import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { AreaModel } from '../../../model/AreaModel';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';

@Component({
  selector: 'app-area-item',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, InputSanitizeDirective],
  templateUrl: './area-item.component.html',
  styleUrl: './area-item.component.scss'
})
export class AreaItemComponent implements OnChanges{

  @Input() area: any;
  @Input() lstAreas: AreaModel[] = [];
  @Input() areaActive: AreaModel = new AreaModel();
  @Input() isShowButton: boolean = false;
 //@Input() isShowChild: boolean = false;

  @Output() activeArea = new EventEmitter<AreaModel>();
  @Output() deleteArea = new EventEmitter<number>();
  @Output() addArea = new EventEmitter<{ level: number, parentId: number }>();
  @Output() blurAreaName = new EventEmitter<{ event: any, areaId: number, isFormCreateInvalid: boolean }>();
  formCreateArea!: FormGroup;
  isShowChildren: boolean = true;
  @ViewChild('areaNameInput') areaNameInput!: ElementRef;
  
  constructor(
    private fb: FormBuilder,
  ) {
    this.formCreateArea = this.fb.group({
      areaName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      //this.isShowChildren = this.isShowChild;
      let areaNew =this.lstAreas.find((item : any) =>  item.groupName == "");
      if(areaNew)
      {
        setTimeout(() => {
          this.areaNameInput.nativeElement.focus();
        });
      }
  }

  onActiveArea(area: AreaModel): void {
    this.activeArea.emit(area);
  }

  onDeleteArea(id: number): void {
    this.deleteArea.emit(id);
  }

  onAddArea(level: number, parentId: number): void {
    this.addArea.emit({ level, parentId });
    this.isShowChildren = true;
  }

  onBlurAreaName(event: any, areaId: number): void {
    let areaName = event?.target?.value?.trim();

    if (!areaName) {
      this.onDeleteArea(areaId);
      return;
    }

    if (areaName.length > 50) return;

    let areaExits = this.lstAreas?.find(item => item.groupName?.toLowerCase() === areaName.toLowerCase() && item.id != areaId);

    if (areaExits) {
      this.formCreateArea.get('areaName')!.setErrors({ areaExists: true });
      this.formCreateArea.get('areaName')?.markAsTouched();
      this.formCreateArea.updateValueAndValidity();
    }

    let isFormCreateInvalid: boolean = false;

    if (this.formCreateArea.controls['areaName'].value === areaName) {
      isFormCreateInvalid = this.formCreateArea.invalid;
    }
    else{
        isFormCreateInvalid = areaExits ? true : false;
    }

    this.blurAreaName.emit({ event, areaId, isFormCreateInvalid });
  }

  onOpenChildren() {
    this.isShowChildren = !this.isShowChildren;
  }

}
