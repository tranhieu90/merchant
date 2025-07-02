import moment from 'moment'
import * as _ from 'lodash'
import Utils from './utils'
import { environment } from '../../../environments/environment'

/**
 * Lấy dữ liệu từ local Store
 * @param key
 * @returns
 */
export function getDataLocalStorageByKey(key: string): any {
  const item = localStorage.getItem(key)
  if (item && item !== 'null') {
    return JSON.parse(item)
  } else {
    return []
  }
}

export function getDataSessionStorageByKey(key: string): any {
  const item = sessionStorage.getItem(key)
  if (item && item !== 'null') {
    return JSON.parse(item)
  } else {
    return []
  }
}

/**
 * chuyển kiểu
 * @param sText
 * @param pattern
 * @returns
 */
export function turnAlphanumberic(sText: string, pattern?: RegExp): string {
  let sNewText = sText
  sNewText = Utils.removeVNAccent(sNewText)
  if (pattern) {
    sNewText = Utils.removeSpecialChar(sNewText, pattern)
  } else {
    sNewText = Utils.removeSpecialChar(sNewText)
  }
  return sNewText
}

/**
 * chuyển đổi Chữ có dẫu => CHU_CO_DAU
 * @param sText
 */
export function textToCode(sText: string): string {
  let sNewText = sText
  sNewText = Utils.removeVNAccent(sNewText)
  sNewText = sNewText.replace(/\s/g, '_')
  return sNewText.toUpperCase()
}

/**
 * hàm convertdate chuyển đổi từ dạng ngày có định dạng là dateFrom(VD: YYYY-MM-DD) thành dạng dateTo(VD: DD/MM/YYYY)
 * @param value
 * @param dateFrom
 * @param dateTo
 * @returns
 */
export function converDateToDate(value: any, dateFrom: string, dateTo: string): any {
  if (value) {
    return moment(value, dateFrom).format(dateTo)
  }
  return null
}

/**
 * Hàm convert date lấy về từ server
 * Dạng date lấy về là dạng yyymmdd(dạng ngày không có phân cách)
 * @param date
 * @returns
 */
export function convertDateFromServer(date: string): any {
  if (date) {
    return date.slice(0, 4) + '/' + date.slice(4, 6) + '/' + date.slice(6)
  }
  return null
}

/**
 * Lấy thông tin người dùng đăng nhập
 * @returns
 */
export function getUserInfo() {
  return getDataLocalStorageByKey('UI')
}

/**
 * checkToken
 * @param flagToken
 * @returns
 */
export function tokenValid(): boolean {
  const STORAGE: string[] = ['JWT', 'RJWT', 'UI', 'TE']
  // Kiểm tra các biến môi trường token, refreshtoken, user_info
  for (const x of STORAGE) {
    if (!(localStorage.getItem(x) != null)) {
      return false
    }
  }
  return true
}


/**
 * thanhnx
 * convert array data sang selectbox
 * @param array
 * @param key
 * @param values array or string key string|string[]|"["field","field2"]"
 * @param firstSelected auto checked first option => for case edit or any..
 */
export function getSelectOptions(array: any[], key: string, values: any, firstSelected = false) {
  if(Array.isArray(array))
  {
    return (array || []).map((i, index) => {
      let value = ''
      if (isJsonString(values))
      {
        // case là string json => from builder
        values  = JSON.parse(values)
      } else {
        values  = Array.isArray(values) ? values : [values]
      }
      values.forEach((key: any, index: any) => {
        const item = _.get(i, key);
        const suffix = (index === values.length - 1 ? '' : ' - ')
        value += item ? item + suffix : ''
      })
      return {
        ...i,
        key: String(_.get(i, key)),
        value: value,
        checked: firstSelected && index === 0
      }
    })
  } else {
    return array;
  }
}

export function isJsonString(str: any) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

/**
 * Sử dụng hàm với mảng và tên tham số mong muốn
 const numbers = [1, 2, 3, 4, 5];
 const parameterName = 'numbers';
 const queryString = arrayToQueryString(parameterName, numbers);
 console.log(queryString);
 * @param parameterName
 * @param numbersArray
 */
export function arrayToQueryString(parameterName: any, numbersArray: any) {
  // Kiểm tra xem mảng có phần tử hay không
  if (numbersArray.length === 0) {
    return '';
  }

  // Sử dụng map để chuyển đổi mỗi số thành một cặp key=value
  const queryParams = numbersArray.map((number: any) => `${parameterName}=${number}`);

  // Sử dụng join để nối các cặp key=value bằng dấu &
  const queryString = queryParams.join('&');
  return `?${queryString}`;
}
