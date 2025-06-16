import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AreaModel } from '../../../model/AreaModel';

@Component({
  selector: 'app-area-view',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './area-view.component.html',
  styleUrl: './area-view.component.scss',
})
export class AreaViewComponent implements OnInit {
  @Input() area: any;
  @Input() subtractLevel: number = 0;
  @Input() areaIdMove: number = 0;
  @Input() isSelectArea?: boolean = false;
  @Input() isShowChildren?: boolean = false;
  @Input() isLeaf: boolean = false;
  @Input() isSearching: boolean = false;
  @Input() isShowCountGroup: boolean = true;
  @Input() isShowCheckbox: boolean = false;
  @Output() doChangeAreaIdMove = new EventEmitter<AreaModel>();
  @Output() groupSelect = new EventEmitter<any>();
  @Output() doChangeExpand = new EventEmitter<any>();
  ngOnInit(): void {}

  onOpenChildren(event: any) {
    event.expanded = !event.expanded;
    this.doChangeExpand.emit(event);
    // this.isShowChildren = !this.isShowChildren;
  }

  doActiveArea(areaMoveTo: AreaModel): void {
    if (!areaMoveTo) return;

    if (this.isSearching) {
      if (areaMoveTo.isLeaf) {
        this.doChangeAreaIdMove.emit(areaMoveTo);
      }
    } else {
      if (!areaMoveTo.children || areaMoveTo.children.length === 0) {
        this.doChangeAreaIdMove.emit(areaMoveTo);
      }
    }
  }

  isLeafNode(): boolean {
    // Xác định leaf node tùy theo trạng thái search hay không
    if (this.isSearching) {
      return this.isLeaf;
    } else {
      return !this.area.children || this.area.children.length === 0;
    }
  }

  onCheckboxChange(event: any, item?: any) {
    item.checked = event.target.checked;
    this.area.expanded = item.checked;
    console.log(item);
    this.doChangeExpand.emit(this.area);
    this.groupSelect.emit({
      ...item,
      event,
    });
  }
}
