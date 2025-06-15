import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'm-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './m-tree.component.html',
  styleUrl: './m-tree.component.scss'
})
export class MTreeComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() dataDetail: any[] = [];
  @Input() level = 0;
  @Input() activeItemId: number | null = null;
  @Input() checkDisable: boolean = false;
  @Input() isCheckAll: boolean = false;
  @Output() groupChoice = new EventEmitter<any>();
  @Output() activeItemIdChange = new EventEmitter<number>();
  @Output() groupCheck = new EventEmitter<number[]>();
  @Output() groupSelect= new EventEmitter<any>();
  isUpdateTree: boolean = true;
  ngOnChanges(changes: SimpleChanges): void {
    this.expandCheckedNodes(this.data);
     if (this.isUpdateTree) {
      this.expandCheckedNodes(this.data);
    }
  }
  ngOnInit(): void {
    console.log('m-tree data', this.data);
  }
  checkAllItems(isChecked: boolean) {
    this.data.forEach((item) => {
      item.checked = isChecked;
      this.toggleChildren(item, isChecked);
    });
    this.groupCheck.emit(this.getCheckedIds(this.data));
  }
  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }
  
  onCheckboxChange(event: any, item?: any) {
    item.checked = event.target.checked;
    this.toggleChildren(item, item.checked);
    this.groupSelect.emit({ ...item, children: item.children ? [...item.children] : [] });
  }

  toggleChildren(item: any, isChecked: boolean) {
    if (item.children) {
      item.children.forEach((child: any) => {
        child.checked = isChecked;
        this.toggleChildren(child, isChecked);
      });
    }
  }

  getGroupLabel(item: any): string {
    const count = item.children?.length || 0;
    return count > 0 ? `${count} Nhóm` : '';
  }

  doChangeGroup(item: any) {
    this.activeItemId = item.id;
    this.isUpdateTree = false;
    this.activeItemIdChange.emit(item.id);
    this.groupChoice.emit(item);
  }
  emitGroupChoice(event: any) {
    this.isUpdateTree = false;
    this.groupChoice.emit(event);
  }
  expandCheckedNodes(items: any[]): boolean {
    let shouldExpand = false;
    items.forEach((item) => {
      let childExpanded = false;
      if (item.children && item.children.length > 0) {
        childExpanded = this.expandCheckedNodes(item.children);
      }
      // Node này sẽ được mở nếu nó checked hoặc có con được mở
       item.expanded = item.checked === true || item.checked === 'partial' || childExpanded;
      if (item.expanded) {
        shouldExpand = true;
      }
    });
    return shouldExpand;
  }

  getCheckedIds(items: any[]): number[] {
    let checkedIds: number[] = [];
      items.forEach((item) => {
      if (item.checked) checkedIds.push(item.id);
      if (item.children?.length) {
        checkedIds = checkedIds.concat(this.getCheckedIds(item.children));
      }
    });
    return checkedIds;
  }
}
