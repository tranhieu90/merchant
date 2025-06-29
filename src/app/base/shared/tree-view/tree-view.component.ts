import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AreaModel } from '../../../model/AreaModel';

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss',
})
export class TreeViewComponent implements OnInit {
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
  @Input() areaActive: AreaModel = new AreaModel();
  @Output() activeArea = new EventEmitter<AreaModel>();

  ngOnInit(): void { }

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

  onActiveArea(area: AreaModel): void {
    this.activeArea.emit(area);
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
    // const isChecked = event.target.checked;

    // // Cập nhật item hiện tại
    // item.checked = isChecked;
    // item.disabled = true;

    // // Cập nhật tất cả con cháu
    // this.setChildrenCheckedAndDisabled(item, isChecked);

    // // Emit cho component cha xử lý tổ tiên
    // this.groupSelect.emit({
    //   event,
    //   item,
    //   source: 'child',
    // });

    // // Cập nhật trạng thái mở rộng
    // this.doChangeExpand.emit(this.area);
  }

  // setChildrenCheckedAndDisabled(area: any, isChecked: boolean): void {
  //   if (!area.children || area.children.length === 0) return;

  //   for (const child of area.children) {
  //     child.checked = isChecked;
  //     child.disabled = true;
  //     this.setChildrenCheckedAndDisabled(child, isChecked);
  //   }
  // }
}