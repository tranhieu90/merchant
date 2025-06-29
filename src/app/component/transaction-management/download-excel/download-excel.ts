import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonUtils } from '../../../base/utils/CommonUtils';
import { EXCEL_ENDPOINT } from '../../../common/enum/EApiUrl';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../common/service/toast/toast.service';

@Component({
  selector: 'app-download-excel',
  standalone: true,
  imports: [],
  templateUrl: './download-excel.html',
  styleUrl: './download-excel.scss',

})

export class DownloadExcel implements OnInit {

  constructor(

    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: FetchApiService,
    private toast: ToastService,
    private auth: AuthenticationService,
    private routeActive: ActivatedRoute,
    private dialogCommon: DialogCommonService,
  ) {
    
  }

  ngOnInit(): void {
    const requestKey = this.routeActive.snapshot.paramMap.get('requestKey');
    const fileName = this.routeActive.snapshot.paramMap.get('fileName');
    if (fileName && requestKey) {
      this.doExport(requestKey, fileName);
    } else {
      this.router.navigate(['/dashboard']);
      this.toast.showError('Đường dẫn không hợp lệ');
    }
  }

  doExport(requestKey: string, fileName: string) {
    let param = {
      requestKey: requestKey,
    };

    let buildParams = CommonUtils.buildParams(param);
    this.api.getV2(EXCEL_ENDPOINT.DOWNLOAD_EXCEL, buildParams).subscribe((res: Blob) => {
      const file = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      this.router.navigate(['/dashboard']);
    }, (error) => {
      const errorData = error?.error || {};
      this.toast.showError('Đã có lỗi xảy ra, vui lòng thử lại');
      this.router.navigate(['/dashboard']);
    });
  }
}
