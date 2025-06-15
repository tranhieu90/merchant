import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { InputTextModule } from 'primeng/inputtext';
import { GridViewModel } from '../../../model/GridViewModel';
import { NgIf } from '@angular/common';
import _ from 'lodash';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShowClearOnFocusDirective } from '../../../common/directives/showClearOnFocusDirective';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { GROUP_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { fomatAddress } from '../../../common/helpers/Ultils';

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
  @Input() groupId: any = [];
  @Output() doMoveMerchant = new EventEmitter<{ lstRowId: number[], isNotDelete: boolean }>();
  @Output() returnRowsChecked = new EventEmitter<any>();
  countRowChecked: number = 0;
  dataTable: any = [];
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
          return ['text-left','mw-160'];
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
          return ['text-left','mw-180'];
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

  ngOnChanges(changes: SimpleChanges): void {
    this.countRowChecked = 0;
    this.dataTable = _.cloneDeep(this.dataSource);
  }

  returnRowChecked(count: number) {
    this.countRowChecked = count;
    let lstRowChecked = this.dataTable.filter((item: any) => item.checked == true);
    this.returnRowsChecked.emit(lstRowChecked);
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
      let lstRowId = lstRowChecked.map((item: any) => item.merchantId);
      this.doMoveMerchant.emit({
        lstRowId: lstRowId,
        isNotDelete: true
      });
    }

  }

  doSearch(event: any) {
    this.isSearch = true;
    let dataReq = {
          groupIdList: [this.groupId],
          status: "",
          methodId: [],
          mappingKey: ""
        }
    
        let param = {
          page: 1,
          size: 1000,
          keySearch: event?.target?.value?.trim()
        };
        let buildParams = CommonUtils.buildParams(param);
        this.api.post(GROUP_ENDPOINT.GET_POINT_SALE, dataReq, buildParams).subscribe((res: any) => {
          if (res['data']['subInfo'] && res['data']['subInfo'].length > 0) {
            this.dataTable = res['data']['subInfo'].map((item: any) => ({
                          ...item,
                          formatAddress: fomatAddress([
                            item.address,
                            item.communeName,
                            item.districtName,
                            item.provinceName,
                          ]),
                        }));
          } else {
            this.dataTable = []
          }
        }, (error: any) => {
          this.toast.showError('Lấy danh sách điểm kinh doanh xảy ra lỗi.')
          this.dataTable = [];
        });
  }

  clearValue(nameInput: string) {
    this.formSearch.get(nameInput)?.setValue('');
  }

  removeVietnamese(str: string): string {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu kết hợp
      .replace(/đ/g, 'd')               // Chuyển 'đ' thành 'd'
      .replace(/Đ/g, 'D');              // Chuyển 'Đ' thành 'D'
  }

}
