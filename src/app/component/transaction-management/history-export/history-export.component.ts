import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatStepperModule} from '@angular/material/stepper';
import {ActivatedRoute, Router} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {environment} from '../../../../environments/environment';
import {GridViewComponent} from '../../../base/shared/grid-view/grid-view.component';
import {FetchApiService} from '../../../common/service/api/fetch-api.service';
import {AuthenticationService} from '../../../common/service/auth/authentication.service';
import {DialogCommonService} from '../../../common/service/dialog-common/dialog-common.service';
import {ToastService} from '../../../common/service/toast/toast.service';
import {GridViewModel} from '../../../model/GridViewModel';
import {EXCEL_ENDPOINT} from '../../../common/enum/EApiUrl';
import moment from 'moment';
import {CommonUtils} from '../../../base/utils/CommonUtils';

@Component({
  selector: 'app-history-export',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InputTextModule,
    GridViewComponent,
    InputTextareaModule,
    ButtonModule,
    CheckboxModule,
    MatCheckboxModule,
    MatIconModule,
    InputNumberModule,
  ],
  templateUrl: './history-export.component.html',
  styleUrl: './history-export.component.scss',

})

export class HistoryExportComponent implements OnInit {

  assetPath = environment.assetPath;

  dataList: any = [];
  columns: Array<GridViewModel> = [
    {
      name: 'actionName',
      label: 'LOẠI GIAO DỊCH ',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return this.getLabelPaymentType(value);
        },
      }
    },
    {
      name: 'requestKey',
      label: 'MÃ YÊU CẦU XUẤT FILE',
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
      name: 'createdAt',
      label: 'NGÀY XUẤT FILE',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          return value ? moment(value).format('DD/MM/YYYY HH:mm') : '';
        },
      }
    },
    {
      name: 'status',
      label: 'TRẠNG THÁI',
      options: {
        customCss: (obj: any) => {
          return ['text-left'];
        },
        customCssHeader: () => {
          return ['text-left'];
        },
        customBodyRender: (value: any) => {
          const className = this.getClassStatus(value);
          const label = this.getLabelStatus(value);
          return `<span class='status ${className}'>${label}</span>`;
        }
      }
    },
  ];

  action: any = [
    {
      icon: 'icon-download',
      title: 'Tải xuống',
      doAction: (item: any) => {
        this.doExport(item);
      },
      display: (item: any) => {
        return item["status"] == "1";
      }
    },
  ]


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private dialogCommon: DialogCommonService
  ) {

  }

  ngOnInit(): void {
    this.getListDataHistory();
  }

  getListDataHistory() {
    this.api.get(EXCEL_ENDPOINT.HISTORY_EXPORT, null).subscribe(res => {
      this.dataList = res['data'];
    }, (error) => {
      const errorData = error?.error || {};
      this.toast.showError(errorData.soaErrorDesc);
    });
  }

  getClassStatus(status: any) {
    switch (status) {
      case "1":
        return 'success'
      case "0":
      case "3":
        return 'error'
      case "2":
        return 'warning'
      default:
        return ''
    }
  }

  getLabelStatus(status: any) {
    switch (status) {
      case "1":
        return 'THÀNH CÔNG'
      case "0":
      case "3":
        return 'THÁT BẠI'
      case "2":
        return 'ĐANG XỬ LÝ'
      default:
        return ''
    }
  }

  getLabelPaymentType(actionName: any) {
    switch (actionName) {
      case 'TXN':
        return 'Giao dịch thanh toán'
      case 'RFN':
        return 'Giao dịch hoàn trả'
      default:
        return ''
    }
  }

  doExport(item: any) {
    let param = {
      requestKey: item["requestKey"],
    };

    let buildParams = CommonUtils.buildParams(param);
    this.api.getV2(EXCEL_ENDPOINT.DOWNLOAD_EXCEL, buildParams).subscribe((res: Blob) => {
      const file = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      let fileName = `Giao dich - ${moment(new Date()).format('DDMMYYYYHHmm')}.xlsx`;
      if (item?.actionName == 'TXN') {
        fileName = `Giao dich thanh toan - ${moment(new Date()).format('DDMMYYYYHHmm')}.xlsx`;
      } else if (item?.actionName == 'RFN') {
        fileName = `Giao dich hoan tra - ${moment(new Date()).format('DDMMYYYYHHmm')}.xlsx`;
      }
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    }, (error) => {
      const errorData = error?.error || {};
      this.toast.showError(errorData.soaErrorDesc);
    });
  }

}
