import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import _ from "lodash";
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { ShowIfTruncatedDirective } from '../../../common/directives/showIfTruncatedDirective';
import { GridViewModel } from '../../../model/GridViewModel';
import { PaginatorComponent } from '../../layout/paginator/paginator.component';


@Component({
  selector: '[grid-view, appShowIfTruncated]',
  standalone: true,
  imports: [TableModule, CommonModule, MatTableModule, MatCheckboxModule, MatPaginatorModule, TooltipModule, PaginatorModule, PaginatorComponent, RadioButtonModule, MatTooltip, ShowIfTruncatedDirective],
  templateUrl: './grid-view.component.html',
  styleUrl: './grid-view.component.scss'
})
export class GridViewComponent implements OnInit {
  assetPath = environment.assetPath;
  @Input() columns: Array<GridViewModel> = [];
  @Input() action?: any;
  @Input() total: number = 0;
  @Input() dataSource: any = [];
  @Input() showCheckbox?: boolean = false;
  @Input() search?: boolean = false;
  @Input() isDisabled: boolean = false;
  @Output() doChangePage: EventEmitter<any> = new EventEmitter();
  @Output() isChecked: EventEmitter<any> = new EventEmitter();
  @Input() pageInfo: any = {
    pageSize: 10,
    page: 0,
  };
  @Input() isShowPage?: boolean = true;
  @Input() isOrder?: boolean = false;
  @Input() showRadio?: boolean = false;
  @Input() selectedItems?: boolean = false;
  @Output() selectedItemChange: EventEmitter<any> = new EventEmitter();
  @Output() dataChoice: EventEmitter<any> = new EventEmitter();
  columnsView: any = [];
  checkAll: boolean = false;
  displayedColumns: string[] = [];
  @Input() selectedItem: any;

  // get selectedItemCount(): number {
  //   var count= this.dataSource.filter((item: any) => item.checked).length;
  //   this.isChecked.emit(count);
  // }

  ngOnInit(): void {
  }
  doCheckAllPointSales(){
     this.dataSource.forEach((obj: any) => {
        obj["checked"] = true;
      });
      this.checkAll = true;
  }
  ngOnChanges() {
    if (this.showCheckbox) {
      this.doCheckAll();
    }
    if (this.columns) {
      this.displayedColumns = [];
      this.columnsView = [];
      this.doCheckAll();
      this.initTable();
    }
  }

  initTable(): void {
    let cols: any = [];
    this.columns.forEach((obj: any) => {
      if (!obj.options || obj.options.display !== true) {
        this.columnsView = [...this.columnsView, obj];
        obj["view"] = true;
      }
      cols = [...cols, obj];
    });

    this.columns = _.cloneDeep(cols);

    let actionData: any = [];
    if (this.showCheckbox && this.showCheckbox === true) {
      actionData.push("checkbox");
    }
    if (this.isOrder) {
      actionData.push("no");
    }
    if (this.showRadio) {
      actionData.push("radio");
    }

    actionData = _.concat(
      actionData,
      this.columnsView.map((col: any) => col.name)
    );

    if (this.action && this.action.length > 0) {
      actionData.push("func");
    }
    this.displayedColumns = actionData;
  }

  renderValue(obj: any, column: any, index: number): any {
    if (column && column.options) {
      let options = _.cloneDeep(column.options);
      if (options.customBodyRender) {
        let str = options.customBodyRender(
          obj[column.name],
          obj,
          index
        );
        return str;
      }
    }
    return obj[column.name];
  }

  getClassTable(obj: any, column: any) {
    if (column && column.options) {
      let options = _.cloneDeep(column.options);
      if (options.customCss) {
        let str = options.customCss(obj);
        return str;
      }
    }
  }


  onChangePage(event: any) {
    this.checkAll = false;
    this.pageInfo["pageSize"] = event.pageSize;
    this.pageInfo["page"] = event.pageIndex;
    this.doChangePage.emit(this.pageInfo);
  }

  checkDisplay(action: any, item: any) {
    if (action.display) {
      return action.display(item);
    } else {
      return true;
    }
  }

  doClickAction(action: any, obj: any) {
    if (action.doAction) {
      action.doAction(obj);
    }
  }

  viewIcon(action: any, item: any) {
    if (action.customIcon) {
      return action.customIcon(item);
    } else {
      return action["icon"];
    }
  }

  viewIconTooltip(action: any, item: any) {
    if (action.customIcon) {
      return action.customIcon(item);
    } else {
      return action["title"];
    }
  }

  getHeaderClass(column: any): string[] {
    if (column?.options?.customCssHeader) {
      return column.options.customCssHeader();
    }
    return ['text-center'];
  }


  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.dataSource.forEach((obj: any) => {
        obj["checked"] = true;
      });
    } else {
      this.checkAll = false;
      this.dataSource.forEach((obj: any) => {
        obj["checked"] = false;
      });
    }
    let countChecked = ob.checked === true ? this.dataSource.length : 0;
    this.isChecked.emit(countChecked);

    this.dataChoice.emit(this.dataSource);
  }

  onCheckItem(ob: MatCheckboxChange, item: any) {
    let itemCheck = _.filter(this.dataSource, (obj: any) => {
      return obj["checked"] === true;
    });
    if (itemCheck && itemCheck.length === this.dataSource.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
    this.isChecked.emit(itemCheck.length);
    this.dataChoice.emit(item);
  }

  onRadioChange(item: any) {
    this.selectedItem = item;
    this.selectedItemChange.emit(item);
  }

  doCheckAll() {
    let itemCheck = _.filter(this.dataSource, (obj: any) => {
      return obj["checked"] === true;
    });
    if (itemCheck && itemCheck.length === this.dataSource.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }
}
