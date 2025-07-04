import { Component, EventEmitter, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { InputTextModule } from 'primeng/inputtext';
import { GridViewModel } from '../../../model/GridViewModel';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { GROUP_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { fomatAddress } from '../../../common/helpers/Ultils';
import _ from 'lodash';

@Component({
  selector: 'app-table-merchant-create',
  standalone: true,
  imports: [InputTextModule, GridViewComponent, NgIf, ReactiveFormsModule, ShowClearOnFocusDirective],
  templateUrl: './table-merchant-create.component.html',
  styleUrl: './table-merchant-create.component.scss'
})
export class TableMerchantCreateComponent {
  private _dataSource: any[] = [];
  @Input() isShowCheckbox: boolean = false;
  @Input() isShowMoveMerchant: boolean = false;
  @Input() groupId: any = [];
  @Output() doMoveMerchant = new EventEmitter<{ lstRowId: any, isNotDelete: boolean, actionType: string | undefined }>();
  @Output() returnRowsChecked = new EventEmitter<any>();
  @Input() hasDataPopup: boolean = false;

  @Input() set dataSource(value: any[]) {
    console.log(value)
    if (value !== this._dataSource) {
      this._dataSource = value;
      this.loadData();
    }
  }
  get dataSource() {
    return this._dataSource;
  }

  countRowChecked: number = 0;
  formSearch!: FormGroup;

  pageIndex: number = 0;
  pageSize: number = 200;
  end: number = this.pageIndex + this.pageSize;
  isLoadMoreAvailable: boolean = true;
  isSearch: boolean = false;

  fullData: any[] = [];
  dataTable: any[] = [];
  isLoading = true;
  isLoadSubResult = true;
  actionType?: string;
  pointSalesSelected: Set<any> = new Set();
  totalPointSalesSelected: number = 0;
  pointSales: any = [];
  countSelectedPoint: number = 0;
  totalItem: number = 0;
  isSelectAll: boolean = false;

  columnsSubmerchant: Array<GridViewModel> = [
    {
      name: 'merchantId',
      label: 'ID',
      options: {
        customCss: (obj: any) => {
          return ['text-left', 'mw-100'];
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
          return ['text-left', 'mw-160'];
        },
        customCssHeader: () => {
          return ['text-left'];
        }
      }
    },
    {
      name: 'formatAddress',
      label: 'ĐỊA CHỈ',
      options: {
        customCss: (obj: any) => {
          return ['text-left', 'mw-180'];
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
    private api: FetchApiService,
    private toast: ToastService,
  ) {
    this.formSearch = this.fb.group({
      keyWord: [''],
    });
  }

  ngOnInit(): void {
    // this.countRowChecked = 0;
    // if (this.hasDataPopup) {
    // this.dataTable = _.cloneDeep(this.dataSource);
    // this.pageSize = 200;
    // this.pageIndex = 1;

    // } else {
    //   this.loadDefaultData();
    // }
    // this.loadData();
  }

  loadData() {
    this.pageIndex = 0;
    this.pageSize = 200;
    console.log(this.dataSource.length);
    this.totalItem = this._dataSource.length;
    this.dataTable = this.getTableData(this.pageIndex, this.end);
    this.updateIndex();
  }

  returnRowChecked(count: number) {
    this.countRowChecked = count;
    let lstRowChecked = this.dataTable.filter((item: any) => item.checked == true);
    this.returnRowsChecked.emit(lstRowChecked);
  }

  onSelectAll() {
    this.fullData = this.dataTable.map(item => ({ ...item, checked: true }));
    // this.dataTable = [...this.fullData.slice(0, this.pageIndex * this.pageSize)];
    this.returnRowsChecked.emit(this.fullData.filter(item => item.checked));
  }

  onDeselectAll() {
    this.countRowChecked = 0;
    this.dataTable = this.dataTable.map((item: any) => ({ ...item, checked: false }));
    if (this.formSearch.get("keyWord")?.value) {
      this.formSearch.get("keyWord")?.setValue("");
    }
  }

  onMoveMerchant() {
    let lstRowChecked = this.dataTable.filter((item: any) => item.checked == true);
    if (lstRowChecked?.length > 0) {
    
      this.doMoveMerchant.emit({
        lstRowId: lstRowChecked,
        isNotDelete: true,
        actionType: this.actionType
      });
    }

  }
  clearAndSearch() {
    this.formSearch.get('keyWord')?.setValue('');
    this.dataTable = this.dataSource;
    // this.loadDefaultData();
  }

  // loadDefaultData() {
  //   this.pageIndex = 1;
  //   this.fullData = [];
  //   this.dataTable = [];
  //   this.isLoadMoreAvailable = true;
  //   this.isSearch = false;

  //   const dataReq = {
  //     groupIdList: Array.isArray(this.groupId) ? this.groupId : [this.groupId],
  //     status: '',
  //     methodId: [],
  //     mappingKey: ''
  //   };

  //   const buildParams = CommonUtils.buildParams({
  //     keySearch: '',
  //     page: 1,
  //     size: 10
  //   });

  //   this.api.post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams).subscribe({
  //     next: (res: any) => {
  //       let allData = res?.data?.subInfo ?? [];
  //       const existingIds = new Set(this.dataSource.map((m: any) => +m.merchantId));
  //       allData = allData?.filter((item: any) => !existingIds.has(item.merchantId))
  //       this.fullData = allData.map((item: any) => ({
  //         ...item,
  //         formatAddress: fomatAddress([
  //           item.address,
  //           item.communeName,
  //           item.districtName,
  //           item.provinceName,
  //         ])
  //       }));
  //       this.dataTable = this.fullData.slice(0, this.pageSize);
  //       this.totalItem = res['data']['totalSub'] - this.dataSource.length;
  //       this.isLoadMoreAvailable = this.dataTable.length < this.fullData.length;
  //     },
  //     error: () => {
  //       this.toast.showError('Lỗi khi lấy danh sách điểm kinh doanh.');
  //     }
  //   });
  // }

  doSearch(event: any) {
    this.isLoading = true;
    this.pageIndex = 0;
    const lowerKeyword = this.formSearch.get('keyWord')?.value.toLowerCase();
    this.dataTable = this.dataSource.filter(user =>
      this.removeVietnamese(user.merchantBizName.toLowerCase()).includes(lowerKeyword) ||
      this.removeVietnamese(user.address.toLowerCase()).includes(lowerKeyword) ||
      this.removeVietnamese(user.communeName.toLowerCase()).includes(lowerKeyword) ||
      this.removeVietnamese(user.districtName.toLowerCase()).includes(lowerKeyword) ||
      this.removeVietnamese(user.provinceName.toLowerCase()).includes(lowerKeyword)
    );
    // this.lazyLoadData(event);
  }

  setActionType(data: boolean) {
    if (data) {
      this.actionType = "ALL"
    } else {
      this.actionType = undefined
    }
  }

  lazyLoadData(e: any) {
    const tableViewHeight = e.target.offsetHeight
    const tableScrollHeight = e.target.scrollHeight
    const scrollLocation = e.target.scrollTop;

    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit) {
      // this.isLoading = false;
      // this.pageIndex++;
      let data = this.getTableData(this.pageIndex, this.end);;
      this.dataTable = this.dataTable.concat(data);
      this.updateIndex();

    }
  }

  getTableData(start: number, end: number) {
    return this.dataSource.filter((value, index) => index >= start && index < end);
  }

  updateIndex() {
    this.pageIndex = this.end;
    this.end = this.pageSize + this.pageIndex;
  }


  clearValue(nameInput: string) {
    this.formSearch.get(nameInput)?.setValue('');
  }

  removeVietnamese(str: string): string {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
}
