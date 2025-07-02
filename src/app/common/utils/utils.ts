import moment from 'moment'
import { environment } from '../../../environments/environment'
export default class Utils {

  /**
   * Xử lý parse dữ liệu kiểu json
   * @param value
   * @returns
   */
  public static JSonTryParse(value: string | null): any {
    try {
      if (value) {
        return JSON.parse(value)
      }
      return value
    } catch (e) {
      if (value === 'undefined') {
        return void 0
      }
      return value
    }
  }

  /**
   * Decode URL
   * @param str
   * @returns
   */
  public static urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/')
    switch (output.length % 4) {
      case 0: {
        break
      }
      case 2: {
        output += '=='
        break
      }
      case 3: {
        output += '='
        break
      }
      default: {
        throw new Error('Illegal base64url string!')
      }
    }
    return this.b64DecodeUnicode(output)
  }

  /**
   * Unicode URL
   * @param str
   * @returns
   */
  private static b64DecodeUnicode(str: any): string {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c: any) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
  }

  /**
   * Xử lý decode Token
   * @param token
   * @returns
   */
  public static decodeToken(token: string): any {
    const parts = token.split('.')

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts')
    }

    const decoded = this.urlBase64Decode(parts[1])
    if (!decoded) {
      throw new Error('Cannot decode the token')
    }

    return JSON.parse(decoded)
  }

  /**
   * Format datetime
   * @author phuongpv
   * @param date;
   * @param format;
   */
  public static createIsoDateByFormat(date: any, format: any): string {
    if (date) {
      return moment(date).format(format)
    }
    return ''
  }


  /**
   * Regex 1 chuỗi kí tự
   * @param sInput
   * @param sReg
   * @param sNew
   * @returns
   */
  public static regReplace(sInput: string, sReg: string, sNew: string): string {
    const reg = new RegExp(sReg, 'g')
    return sInput.replace(reg, sNew)
  }

  /**
   * xóa kí tự tiếng việt
   * @param sText
   * @returns
   */
  public static removeVNAccent(sText: string): string {
    let sNewText = sText
    sNewText = this.regReplace(sNewText, 'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ', 'a')
    sNewText = this.regReplace(sNewText, 'À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ', 'A')
    sNewText = this.regReplace(sNewText, 'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ', 'e')
    sNewText = this.regReplace(sNewText, 'È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ', 'E')
    sNewText = this.regReplace(sNewText, 'ì|í|ị|ỉ|ĩ', 'i')
    sNewText = this.regReplace(sNewText, 'Ì|Í|Ị|Ỉ|Ĩ', 'I')
    sNewText = this.regReplace(sNewText, 'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ', 'o')
    sNewText = this.regReplace(sNewText, 'Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ', 'O')
    sNewText = this.regReplace(sNewText, 'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ', 'u')
    sNewText = this.regReplace(sNewText, 'Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ', 'U')
    sNewText = this.regReplace(sNewText, 'ỳ|ý|ỵ|ỷ|ỹ', 'y')
    sNewText = this.regReplace(sNewText, 'Ỳ|Ý|Ỵ|Ỷ|Ỹ', 'Y')
    sNewText = this.regReplace(sNewText, 'Đ', 'D')
    sNewText = this.regReplace(sNewText, 'đ', 'd')
    return sNewText
  }

  /**
   * Xóa các kí tự đặc biệt
   * @param sText
   * @param pattern
   * @returns
   */
  public static removeSpecialChar(sText: string, pattern: RegExp = /[\_\!\#\$\%\&\'\+\:\;\"\<\=\>\?\@\\\`\^\~\{\|\}\(\)\-\[\]\.\,\/\*\s]/g): string {
    let sNewText = sText
    sNewText = sNewText.replace(pattern, '')
    return sNewText
  }


  /**
   * Check dữ liệu có chứa VN
   * @param val
   * @returns
   */
  public static checkNationalNotInVIE(val: any): boolean {
    if (!val.includes('VN')) {
      return true
    }
    return false
  }

  public static uniqueArrayString(arr: string[]) {
    return [...new Set(arr)]
  }

  /**
   * thanhnx color logger
   * @param data
   * @param text
   */
//   public static logger(data: any, text: string = 'data'){
//     environment.logger && console.log(
//       "%c Logger : " + this.constructor.name + ' - ' + text,
//       "background-color: #e2e2e2 ; color: #333 ; font-weight: bold ; padding: 4px ;",
//       data
//     );
//   }

// public static erro(data: any, text: string = 'data'){
//     environment.logger && console.error(
//       "%c Logger : " + this.constructor.name + ' - ' + text,
//       "background-color: red ; color: white ; font-weight: bold ; padding: 4px ;",
//       data
//     );
//   }

  // public static randomText(){
  //   const quotes = ["1, Mất niềm tin vào bản thân, cũng như bạn đánh mất thành công đang đợi mình","2, Người lạc quan luôn nhìn thấy thành công trong mỗi khó khăn, còn người bi quan luôn thấy rủi ro trong mỗi cơ hội","3, Con đường thành công, không có dấu chân của những kẻ lười biếng","4, Tự tin là điều kiện cốt lõi để đưa bạn đến thành công.","5, Tranh luận với một kẻ thiếu kiến thức là bạn đang tự làm khó mình","6, Đừng khóc khi mọi chuyện đã kết thúc mà hãy mỉm cười vì nó đã xảy ra","7, Trong cuộc sống ai cũng là con ếch. Chỉ khác nhau cái giếng mà thôi.","8, Thành công lớn nhất là biết cách đứng dậy sau những lần vấp ngã.","9, Con người ta phải đến khi mất đi mới hiểu được mình đã bỏ quên thứ gì.","10, Hạnh phúc của bạn, bạn phải tự nắm bắt. Bởi vì không ai thay thế bạn làm điều đó cả.","11, Điều khác biệt giữa một người thành công với một kẻ thất bại không phải là họ có điều kiện mà họ có ý chí.","12, Điều quan trọng để đạt được vị trí, là bạn phải chọn được cho mình hướng đi.","13, Ai cũng nói tương lai chúng ta luôn rộng mở, nhưng nếu không nắm bắt được hiện tại thì tương lai sẽ chẳng có gì.","14, Khó khăn rồi cũng sẽ qua, giống như cơn giông dồn dập đến mấy rồi trời cũng quang, mây cũng tạnh.","15, Cuộc sống dầy ắp những việc không như ý muốn, muốn tránh cũng không được. Giải pháp tốt nhất là suy nghĩ tích cực về nó.","16, Có những chuyện trong đời chỉ có một lần, nếu bạn bỏ lỡ thì sẽ không có lần nào nữa để làm lại đâu.","17, Thời đại bây giờ không còn khái niệm cá lớn nuốt cá bé nữa mà cá nhanh nuốt cá chậm.","18, Đau đớn khó khăn không đáng sợ, đáng sợ nhất là khi khó khăn bên bạn không còn ai cả.","19, Cái gì không thuộc về mình thì đừng theo đuổi nó một cách mù quáng. Mà hãy cố gắng để nó phải bám đuổi lấy mình.","20, Khi con người ta bị lòng tham làm mù mắt. Thì họ sẽ không phân biệt được đâu là phải trái."];
  //   environment?.logger && this.logger(quotes[Math.floor(Math.random()*quotes.length)] , '(^_^) UAT ONLY: ')
  // }
}
