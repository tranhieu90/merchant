import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';
import {JSEncrypt} from 'jsencrypt';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class FetchApiService {

  constructor(
    private http: HttpClient,
  ) { }
  get(strUrl: string, param?: any): Observable<any> {
    return this.http.get(strUrl, {
      params: param,
      responseType: "json",
    });
  }

  getV2(url: string, params?: any): Observable<any> {
    return this.http.get(url, {
      params: params,
      responseType: 'blob' as 'json'
    });
  }

  post(strUrl: string, paramBody?: any, param?: any): Observable<any> {
    return this.http.post(strUrl, paramBody, {
      params: param,
      responseType: "json",
    });
  }

  put(strUrl: string, paramBody?: any, param?: any): Observable<any> {
    return this.http.put(strUrl, paramBody, {
      params: param,
      responseType: "json",
    });
  }

  delete(strUrl: string, param?: any): Observable<any> {
    return this.http.delete(strUrl, {
      params: param,
      responseType: "json",
    });
  }

  encryptPayload(payload: any): any {
    // Step 1: Generate AES Key (128-bit)
    const aesKey = CryptoJS.lib.WordArray.random(16); // 128-bit AES key
    const iv = CryptoJS.lib.WordArray.random(16);  // AES Initialization Vector

    // Step 2: Encrypt the body
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(payload), aesKey, { iv }).toString();

    // Step 3: Encrypt AES key with RSA (using public key)
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(environment.publicKey);
    const encryptedKey = encrypt.encrypt(aesKey.toString());

    // Step 4: Send encrypted data and AES key to backend
    return {
      payload: encryptedKey + iv.toString(CryptoJS.enc.Hex) + encryptedData
    };
  }

  postEncrypted(strUrl: string, paramBody?: any, param?: any): Observable<any> {
    const encryptedPayload = this.encryptPayload(paramBody);
    return this.http.post(strUrl, encryptedPayload, {
      params: param,
      responseType: "json",
    });
  }

  putEncrypted(strUrl: string, paramBody?: any, param?: any): Observable<any> {
    const encryptedPayload = this.encryptPayload(paramBody);

    return this.http.put(strUrl, encryptedPayload, {
      params: param,
      responseType: "json",
    });
  }
}
