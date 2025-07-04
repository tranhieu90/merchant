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

@Component({
  selector: 'app-table-merchant',
  standalone: true,
  imports: [InputTextModule, GridViewComponent, NgIf, ReactiveFormsModule, ShowClearOnFocusDirective],
  templateUrl: './table-merchant.component.html',
  styleUrl: './table-merchant.component.scss'
})
export class TableMerchantComponent implements OnChanges {
  @Input() dataSource: any = [];
  @Input() isShowCheckbox: boolean = false;
  @Input() isShowMoveMerchant: boolean = false;
  @Input() groupId: any = [];
  @Output() doMoveMerchant = new EventEmitter<{ lstRowId: number[], isNotDelete: boolean, actionType: 'ALL' | null }>();
  @Output() returnRowsChecked = new EventEmitter<any>();

  countRowChecked: number = 0;
  formSearch!: FormGroup;

  pageIndex: number = 1;
  pageSize: number = 50;
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
        customCss: () => ['text-left','mw-100'],
        customCssHeader: () => ['text-left'],
        customBodyRender: (value: any) => "#" + value,
      }
    },
    {
      name: 'merchantBizName',
      label: 'TÊN ĐIỂM KINH DOANH',
      options: {
        customCss: () => ['text-left', 'mw-160'],
        customCssHeader: () => ['text-left']
      }
    },
    {
      name: 'formatAddress',
      label: 'ĐỊA CHỈ',
      options: {
        customCss: () => ['text-left', 'mw-180'],
        customCssHeader: () => ['text-left']
      }
    },
    {
      name: 'status',
      label: 'TRẠNG THÁI',
      options: {
        width: '15%',
        customCss: () => ['text-center'],
        customBodyRender: (value: any) => {
          return value === 'active'
            ? "<span class='status success'> Hoạt động </span>"
            : "<span class='status lock'> Đã khóa </span>";
        }
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.loadDefaultData();
    }
  }

  returnRowChecked(count: number) {
    this.updateCountRowChecked();
  }
  updateCountRowChecked() {
    this.countRowChecked = this.dataTable.filter(item => item.checked).length;
  }

  onSelectAll() {
    this.fullData = this.fullData.map(item => ({ ...item, checked: true }));
    this.dataTable = [...this.fullData.slice(0, this.pageIndex * this.pageSize)];
    this.updateCountRowChecked();
    this.returnRowsChecked.emit(this.fullData.filter(item => item.checked));
  }

  onDeselectAll() {
    this.actionType = '';
    this.fullData = this.fullData.map(item => ({ ...item, checked: false }));
    this.dataTable = [...this.fullData.slice(0, this.pageIndex * this.pageSize)];
    this.updateCountRowChecked();
    this.returnRowsChecked.emit([]);
  }


  onMoveMerchant() {
    const lstRowChecked = this.fullData.filter(item => item.checked === true);
    if (lstRowChecked.length > 0) {
      const lstRowId = lstRowChecked.map(item => item.merchantId);
      const isSelectAll = this.countRowChecked === this.fullData.length;

      this.doMoveMerchant.emit({
        lstRowId,
        isNotDelete: true,
        actionType: isSelectAll ? 'ALL' : null
      });
    }
  }


  clearAndSearch() {
    this.formSearch.get('keyWord')?.setValue('');
    this.loadDefaultData();
  }

  loadDefaultData() {
    this.pageIndex = 1;
    this.fullData = [];
    this.dataTable = [];
    this.isLoadMoreAvailable = true;
    this.isSearch = false;

    const dataReq = {
      groupIdList: Array.isArray(this.groupId) ? this.groupId : [this.groupId],
      status: '',
      methodId: [],
      mappingKey: ''
    };

    const buildParams = CommonUtils.buildParams({
      keySearch: '',
      page: 1,
      size: 10
    });

    this.api.post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams).subscribe({
      next: (res: any) => {
        const allData = res?.data?.subInfo ?? [];
        this.fullData = allData.map((item: any) => ({
          ...item,
          formatAddress: fomatAddress([
            item.address,
            item.communeName,
            item.districtName,
            item.provinceName,
          ])
        }));
        this.dataTable = this.fullData.slice(0, this.pageSize);
        this.totalItem = res['data']['totalSub'];
        this.isLoadMoreAvailable = this.dataTable.length < this.fullData.length;
      },
      error: () => {
        this.toast.showError('Lỗi khi lấy danh sách điểm kinh doanh.');
      }
    });
  }

  doSearch(event: any) {
    this.isLoading = true;
    this.pageIndex = 0;
    this.lazyLoadData(event);
  }

  setActionType(data: boolean) {
    if (data) {
      this.actionType = "ALL"
    } else {
      this.actionType = ""
    }
  }

  lazyLoadData(e: any) {
    const tableViewHeight = e.target.offsetHeight
    const tableScrollHeight = e.target.scrollHeight
    const scrollLocation = e.target.scrollTop;

    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit && this.isLoading) {
      this.isLoading = false;
      this.pageIndex++;
      let dataReq = {
        groupIdList: Array.isArray(this.groupId) ? this.groupId : [this.groupId],
        status: '',
        methodId: [],
        mappingKey: '',
      };
      let param = {
        page: this.pageIndex,
        size: 10,
        keySearch: this.formSearch.get('keyWord')?.value ?this.formSearch.get('keyWord')?.value : null,
      };
      let buildParams = CommonUtils.buildParams(param);
      this.api
        .post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams)
        .subscribe(
          (res: any) => {
            if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
              let dataGroup = res['data']['subInfo'].map((item: any) => ({
                ...item,
                formatAddress: fomatAddress([
                  item.address,
                  item.communeName,
                  item.districtName,
                  item.provinceName,
                ]),
              }));

              if (this.actionType == "ALL") {
                dataGroup.forEach((item: any) => {
                  item.checked = true;
                  this.pointSalesSelected.add(item?.merchantId);
                });
              } else {
                if (this.pointSalesSelected.size > 0) {
                  dataGroup.forEach((item: any) => {
                    item.checked = this.pointSalesSelected.has(item.merchantId);
                  });
                  this.countSelectedPoint = this.dataTable.filter(
                    (x: any) => x.checked
                  ).length;
                }
              }
              if(this.pageIndex === 1) {
                this.dataTable = dataGroup
              } else {
                this.dataTable = this.dataTable.concat(dataGroup);
              }
              this.totalItem = res['data']['totalSub'];
              this.isLoading = true;

            } else {
              if(this.pageIndex === 1) {
                this.dataTable = [];
                this.totalItem = 0
              }
              this.isLoading = false;
            }
          }
        );
    }
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
