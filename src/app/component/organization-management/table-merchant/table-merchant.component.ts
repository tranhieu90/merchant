import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { InputTextModule } from 'primeng/inputtext';
import { GridViewModel } from '../../../model/GridViewModel';
import { NgIf } from '@angular/common';
import _ from 'lodash';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';

@Component({
  selector: 'app-table-merchant',
  standalone: true,
  imports: [InputTextModule, GridViewComponent, NgIf, ReactiveFormsModule,ShowClearOnFocusDirective],
  templateUrl: './table-merchant.component.html',
  styleUrl: './table-merchant.component.scss'
})
export class TableMerchantComponent implements OnChanges {
  @Input() dataSource: any = [];
  @Input() isShowCheckbox: boolean = false;
  @Input() isShowMoveMerchant: boolean = false;
  @Output() doMoveMerchant = new EventEmitter<{ lstRowId: number[], isNotDelete: boolean }>();
  @Output() returnRowsChecked = new EventEmitter<any>();
  countRowChecked: number = 0;
  dataTable: any = [];
  dataSearch: any = [];
  formSearch!: FormGroup;
  isSearch: boolean = false;

  columnsSubmerchant: Array<GridViewModel> = [
    {
      name: 'merchantId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any, obj: any) => {
          return "#" + value;
        },
      }
    },
    {
      name: 'merchantBizName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'address',
      label: 'ĐỊA CHỈ',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'status',
      label: 'TRẠNG THÁI',
      options: {
        width: "15%",
        customCss: (obj: any) => {
          return ['text-center'];
        },
        customBodyRender: (value: any, obj: any) => {
          let msg;
          if (value === "active") {
            msg = "<span class='status success'> Hoạt động </span>";
          } else {
            msg = "<span class='status lock'> Đã khóa </span>";
          }
          return msg;
        },
      }
    }
  ];

  constructor(
    private fb: FormBuilder,
  ) {
    this.formSearch = this.fb.group({
      keyWord: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.countRowChecked = 0;
    this.dataTable = _.cloneDeep(this.dataSource);
    this.dataSearch = this.dataTable;
  }

  returnRowChecked(count: number) {
    this.countRowChecked = count;
    let lstRowChecked = this.dataTable.filter((item: any) => item.checked == true);
    this.returnRowsChecked.emit(lstRowChecked);
  }

  onDeselectAll() {
    this.countRowChecked = 0;
    this.dataTable = this.dataTable.map((item: any) => ({ ...item, checked: false }));
    this.dataSearch = this.dataTable;
    if (this.formSearch.get("keyWord")?.value) {
      this.formSearch.get("keyWord")?.setValue("");
    }
  }

  onMoveMerchant() {
    let lstRowChecked = this.dataTable.filter((item: any) => item.checked == true);
    if (lstRowChecked?.length > 0) {
      let lstRowId = lstRowChecked.map((item: any) => item.merchantId);
      this.doMoveMerchant.emit({
        lstRowId: lstRowId,
        isNotDelete: true
      });
    }

  }

  doSearch(event: any) {
    let keyWord = event?.target?.value?.trim();
    if (keyWord) {
      let keyWordToLowerCase = this.removeVietnamese(keyWord.toLowerCase());
      this.dataSearch = this.dataTable.filter((item: any) => this.removeVietnamese(item.merchantBizName?.toLowerCase())?.includes(keyWordToLowerCase) || this.removeVietnamese(item.address?.toLowerCase())?.includes(keyWordToLowerCase));
      this.isSearch = true;
    }
    else {
      this.dataSearch = this.dataTable;
    }
  }

  clearValue(nameInput: string) {
    this.formSearch.get(nameInput)?.setValue('');
    this.dataSearch = this.dataTable;
  }

  removeVietnamese(str: string): string {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu kết hợp
      .replace(/đ/g, 'd')               // Chuyển 'đ' thành 'd'
      .replace(/Đ/g, 'D');              // Chuyển 'Đ' thành 'D'
  }

}
