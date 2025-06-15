import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FetchApiService } from '../../../../common/service/api/fetch-api.service';
import { BUSINESS_ENDPOINT, LOCATION_ENDPOINT } from '../../../../common/enum/EApiUrl';
import { ToastService } from '../../../../common/service/toast/toast.service';
import { CommonUtils } from '../../../../base/utils/CommonUtils';
import { DialogConfirmModel } from '../../../../model/DialogConfirmModel';
import { AuthenticationService } from '../../../../common/service/auth/authentication.service';
import { DialogCommonService } from '../../../../common/service/dialog-common/dialog-common.service';
import { Router } from '@angular/router';
import {InputCommon} from '../../../../common/directives/input.directive';
@Component({
  selector: 'app-business-dialog',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule, DropdownModule, InputCommon],
  templateUrl: './business-dialog.component.html',
  styleUrl: './business-dialog.component.scss'
})
export class BusinessDialogComponent implements OnInit {
  countries: any = [
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Albania', code: 'AL' },
    { name: 'Algeria', code: 'DZ' },
    { name: 'American Samoa', code: 'AS' },
    { name: 'Andorra', code: 'AD' },
    { name: 'Angola', code: 'AO' },
    { name: 'Anguilla', code: 'AI' },
    { name: 'Antarctica', code: 'AQ' },
    { name: 'Antigua and Barbuda', code: 'AG' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Armenia', code: 'AM' },
    { name: 'Aruba', code: 'AW' },
    { name: 'Australia', code: 'AU' },
    { name: 'Austria', code: 'AT' },
    { name: 'Azerbaijan', code: 'AZ' },
    { name: 'Bahamas', code: 'BS' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Barbados', code: 'BB' },
    { name: 'Belarus', code: 'BY' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Belize', code: 'BZ' },
    { name: 'Benin', code: 'BJ' },
    { name: 'Bermuda', code: 'BM' },
    { name: 'Bhutan', code: 'BT' },
    { name: 'Bolivia', code: 'BO' },
    { name: 'Bosnia and Herzegovina', code: 'BA' },
    { name: 'Botswana', code: 'BW' },
    { name: 'Bouvet Island', code: 'BV' },
    { name: 'Brazil', code: 'BR' },
    { name: 'British Indian Ocean Territory', code: 'IO' },
    { name: 'Brunei Darussalam', code: 'BN' },
    { name: 'Bulgaria', code: 'BG' },
    { name: 'Burkina Faso', code: 'BF' },
    { name: 'Burundi', code: 'BI' },
    { name: 'Cambodia', code: 'KH' },
    { name: 'Cameroon', code: 'CM' },
    { name: 'Canada', code: 'CA' },
    { name: 'Cape Verde', code: 'CV' },
    { name: 'Cayman Islands', code: 'KY' },
    { name: 'Central African Republic', code: 'CF' },
    { name: 'Chad', code: 'TD' },
    { name: 'Chile', code: 'CL' },
    { name: 'China', code: 'CN' },
    { name: 'Christmas Island', code: 'CX' },
    { name: 'Cocos (Keeling) Islands', code: 'CC' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Comoros', code: 'KM' },
    { name: 'Congo', code: 'CG' },
    { name: 'Congo, The Democratic Republic of the', code: 'CD' },
    { name: 'Cook Islands', code: 'CK' },
    { name: 'Costa Rica', code: 'CR' },
    { name: 'Cote D"Ivoire', code: 'CI' },
    { name: 'Croatia', code: 'HR' },
    { name: 'Cuba', code: 'CU' },
    { name: 'Cyprus', code: 'CY' },
    { name: 'Czech Republic', code: 'CZ' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Djibouti', code: 'DJ' },
    { name: 'Dominica', code: 'DM' },
    { name: 'Dominican Republic', code: 'DO' },
    { name: 'Ecuador', code: 'EC' },
    { name: 'Egypt', code: 'EG' },
    { name: 'El Salvador', code: 'SV' },
    { name: 'Equatorial Guinea', code: 'GQ' },
    { name: 'Eritrea', code: 'ER' },
    { name: 'Estonia', code: 'EE' },
    { name: 'Ethiopia', code: 'ET' },
    { name: 'Falkland Islands (Malvinas)', code: 'FK' },
    { name: 'Faroe Islands', code: 'FO' },
    { name: 'Fiji', code: 'FJ' },
    { name: 'Finland', code: 'FI' },
  ];

  selectedCountry: any;

  filteredCountries: any = [];
  formBusiness!: FormGroup;
  lstProvince: any = [];
  lstDistrict: any = [];
  lstCommune: any = [];
  constructor(
    private fb: FormBuilder,
    private api: FetchApiService,
    private toast: ToastService,
    public dialogRef: MatDialogRef<BusinessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataInput: any,
    private auth: AuthenticationService,
    private dialogCommon: DialogCommonService,
    private router: Router
  ) {

  }
  ngOnInit(): void {
    this.buildForm();
    this.setDataDefault(this.dataInput);
    this.doGetProvince();
    this.doGetDistrict(this.dataInput.provinceId, 0);
    this.doGetCommune(this.dataInput.provinceId, this.dataInput.districtId, 0);
  }

  buildForm() {
    this.formBusiness = this.fb.group({
      merchantId: ['', [Validators.required]],
      subId: ['', [Validators.required]],
      actionType: [''],
      merchantName: ['', [Validators.required, Validators.maxLength(128)]],
      merchantBizName: ['', [Validators.required, Validators.maxLength(32)]],
      address: ['', [Validators.required, Validators.maxLength(256)]],
      provinceId: ['', [Validators.required]],
      districtId: ['', [Validators.required]],
      communeId: ['', [Validators.required]],
    })
  }

  setDataDefault(dataDetail: any) {
    if (dataDetail) {
      this.formBusiness.setValue({
        merchantId: dataDetail.merchantId,
        subId: dataDetail.subId,
        merchantName: dataDetail.merchantName,
        merchantBizName: dataDetail.merchantBizName,
        address: dataDetail.address,
        provinceId: dataDetail.provinceId,
        districtId: dataDetail.districtId,
        communeId: dataDetail.communeId,
        actionType: "BASIC-INFO"
      });
    }
  }

  doGetProvince() {
    this.api.get(LOCATION_ENDPOINT.GET_PROVINCE).subscribe(res => {
      if (res) {
        this.lstProvince = res['data'];
      }
    }, (error) => {
      this.toast.showError('lấy danh sách tỉnh, thành phố xảy ra lỗi.');
    });
  }

  doGetDistrict(provinceId: number, type: number) {
    if (provinceId) {
      let param = {
        provinceId: provinceId
      }
      let buildParams = CommonUtils.buildParams(param);
      this.api.get(LOCATION_ENDPOINT.GET_DISTRIC, buildParams).subscribe(res => {
        if (res) {
          this.lstDistrict = res['data'];
          if (type == 1) {
            this.lstCommune = [];
            this.formBusiness.get('districtId')?.setValue(null);
            // this.formBusiness.get('districtId')?.markAsDirty();
            this.formBusiness.get('communeId')?.setValue(null);
            // this.formBusiness.get('communeId')?.markAsDirty();
          }
        }
      }, (error) => {
        this.toast.showError('lấy danh sách quận,huyện xảy ra lỗi.');
      });
    }
  }

  doGetCommune(provinceId: number, districtId: number, type: number) {
    if (type == 1) {
      provinceId = this.formBusiness.get('provinceId')?.value;
    }
    if (provinceId && districtId) {
      let param = {
        provinceId: provinceId,
        districtId: districtId
      }
      let buildParams = CommonUtils.buildParams(param);
      this.api.get(LOCATION_ENDPOINT.GET_COMMUNE, buildParams).subscribe(res => {
        if (res) {
          this.lstCommune = res['data'];
          if (type == 1) {
            this.formBusiness.get('communeId')?.setValue(null);
            // this.formBusiness.get('communeId')?.markAsDirty();
          }
        }
      }, (error) => {
        this.toast.showError('lấy danh sách xã ,phường xảy ra lỗi.');
      });
    }
  }

  doUpdate() {
    if (this.formBusiness.invalid) {
      this.formBusiness.markAllAsTouched();
      return;
    }
    let dataSave = this.formBusiness.value;
    this.api.post(BUSINESS_ENDPOINT.UPDATE_SUB_MERCHANT, dataSave).subscribe(res => {
      if (res) {
        if (res['status'] == 200) {
          this.toast.showSuccess('Cập nhật thông tin thành công');
          this.dialogRef.close(true);
        } else if (res['status'] == 400) {
          switch (res.soaErrorCode) {
            case '213':
              this.formBusiness.get('merchantBizName')!.setErrors({ nameExit: true });
          }
        }
      }
    }, (error) => {
      const errorData = error?.error || {};
      switch (errorData.soaErrorCode) {
        case '203':
          this.toast.showError(errorData.soaErrorDesc);
          break;
        default:
          this.toast.showError('Đã xảy ra lỗi, vui lòng thử lại');
          break;
      }
    });
  }

  doAction() {
    let dataDialog: DialogConfirmModel = new DialogConfirmModel();
    dataDialog.title = 'Hủy cập nhật điểm kinh doanh';
    dataDialog.message = 'Các thông tin đã nhập sẽ không được lưu lại. Bạn có chắc chắn muốn huỷ cập nhật điểm kinh doanh không?';
    dataDialog.buttonLabel = 'Xác nhận';
    dataDialog.buttonColor = 'error';
    dataDialog.icon = 'icon-error';
    dataDialog.viewCancel = true;
    dataDialog.iconColor = 'icon error';
    dataDialog.width = "30%";

    this.dialogCommon.openDialogInfo(dataDialog).subscribe(result => {
      if (result) {
        this.dialogRef.close();
      }
    })
  }

  onclose() {
    this.dialogRef.close();
  }

}
