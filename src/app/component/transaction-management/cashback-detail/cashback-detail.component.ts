import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { environment } from '../../../../environments/environment';
import { GridViewComponent } from '../../../base/shared/grid-view/grid-view.component';
import { InputCommon } from '../../../common/directives/input.directive';
import { InputSanitizeDirective } from '../../../common/directives/inputSanitize.directive';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../common/service/dialog-common/dialog-common.service';
import { ToastService } from '../../../common/service/toast/toast.service';
import { GridViewModel } from '../../../model/GridViewModel';
import {TRANSACTION_ENDPOINT} from '../../../common/enum/EApiUrl';
import moment from 'moment';

@Component({
  selector: 'app-cashback-detail',
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
    NgFor,
    NgIf,
    CheckboxModule,
    MatCheckboxModule,
    MatIconModule,
    InputNumberModule,
    InputCommon,
    InputSanitizeDirective,
    NgClass],
  templateUrl: './cashback-detail.component.html',
  styleUrl: './cashback-detail.component.scss',

})

export class CashbackDetailComponent implements OnInit {

  assetPath = environment.assetPath;

  id: any;
  transTime: any;
  merchantId: any;
  detailTrans: any = {};

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
    this.routeActive.queryParams.subscribe(params => {
      //this.roleId = params['roleId'] || null;
      if (params['id']) {
        this.id = params['id'];
      }
      if (params['transTime']) {
        this.transTime = params['transTime'];
      }
      if (params['merchantId']) {
        this.merchantId = params['merchantId'];
      }
      this.getDetailData();
    });
  }

  ngOnInit(): void {

  }

  getDetailData() {
    let param = {
      id: this.id,
      transTime: moment(this.transTime).format('DD/MM/YYYY HH:mm:ss'),
      merchantId: this.merchantId,
    }

    this.api.post(TRANSACTION_ENDPOINT.GET_DETAIL_REFUND, param).subscribe(res => {
        this.detailTrans = res['data'];
      },
      error => {
        const errorData = error?.error || {};
        this.toast.showError(errorData?.soaErrorDesc);
      });
  }

  getClassStatus(status: any) {
    switch (status) {
      case '00':
        return 'success'
      case '03':
        return 'error'
      case '20':
        return 'warning'
      default:
        return ''
    }
  }

  getLabelStatus(status: any) {
    switch (status) {
      case '00':
        return 'THÀNH CÔNG'
      case '03':
        return 'THÁT BẠI'
      case '20':
        return 'CHỜ TRA SOÁT'
      default:
        return ''
    }
  }

  formatMoney(value: any): string {
    if (value == null) return '0 đ';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫';
  }

}
