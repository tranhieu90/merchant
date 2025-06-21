import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { AreaModel } from '../../../model/AreaModel';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';
import { ShowIfTruncatedDirective } from '../../../common/directives/showIfTruncatedDirective';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-area-item',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, InputSanitizeDirective, ShowIfTruncatedDirective, MatTooltip],
  templateUrl: './area-item.component.html',
  styleUrl: './area-item.component.scss'
})
export class AreaItemComponent implements OnChanges {

  @Input() area: any;
  @Input() lstAreas: AreaModel[] = [];
  @Input() areaActive: AreaModel = new AreaModel();
  @Input() isShowButton: boolean = false;

  @Output() activeArea = new EventEmitter<AreaModel>();
  @Output() deleteArea = new EventEmitter<number>();
  @Output() addArea = new EventEmitter<{ level: number, parentId: number, areaActive: any}>();
  @Output() blurAreaName = new EventEmitter<{ event: any, areaId: number, isFormCreateInvalid: boolean }>();
  @Output() doChangeExpand = new EventEmitter<any>();

  formCreateArea!: FormGroup;
  @ViewChild('areaNameInput') areaNameInput!: ElementRef;

  activeItem?: any;
  isActionDelte?: boolean;
  isActionAdd?: boolean;

  constructor(
    private fb: FormBuilder,
  ) {
    console.log(this.areaActive)
    this.formCreateArea = this.fb.group({
      areaName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let areaNew = this.lstAreas.find((item: any) => item.groupName == "");
    if (areaNew) {
      setTimeout(() => {
        this.areaNameInput.nativeElement.focus();
      });
    }

    if (changes['areaActive'] && this.areaActive && this.areaActive.id) {
      this.expandParents(this.lstAreas, this.areaActive.id);
    }
  }

  onActiveArea(area: AreaModel): void {
    if (this.isActionDelte || this.isActionAdd) {
      return;
    }
    this.activeItem = area;
    this.activeArea.emit(area);
  }

  onDeleteArea(data: any): void {
    this.isActionDelte = true;
    this.deleteArea.emit(data);
  }

  onAddArea(level: number, parentId: number, areaActive: any): void {
    this.isActionAdd = true;
    this.addArea.emit({ level, parentId, areaActive });
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
    else {
      isFormCreateInvalid = areaExits ? true : false;
    }

    this.blurAreaName.emit({ event, areaId, isFormCreateInvalid });
  }

  onOpenChildren(item: any) {
    if (this.isActionDelte || this.isActionAdd) {
      return;
    }
    item.expanded = !item.expanded;
    this.activeItem = item;
    this.doChangeExpand.emit(item);
  }

  getItem(): any {
    return this.activeItem;
  }

  /**
   * Đệ quy tìm nhóm có id targetId trong lstAreas,
   * và mở rộng các nhóm cha trên đường đi (set expanded = true)
   * Trả về true nếu tìm thấy nhóm
   */
  private expandParents(lstAreas: AreaModel[], targetId: number): boolean {
    for (let area of lstAreas) {
      if (area.id === targetId) {
        return true; 
      }
      if (area.children && area.children.length > 0) {
        const foundInChild = this.expandParents(area.children, targetId);
        if (foundInChild) {
          area.expanded = true;
          return true;
        }
      }
    }
    return false;
  }
}
