import { HttpParameterCodec, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class CommonUtils {
    public static buildParams(obj: any): HttpParams {
        return Object.entries(obj || {})
            .reduce((params, [key, value]) => {
                if (value === null) {
                    return params.set(key, String(''));
                } else if (value == '') {
                    return params;
                } else if (typeof value === typeof {}) {
                    return params.set(key, JSON.stringify(value));
                } else {
                    return params.set(key, String(value));
                }
            }, new HttpParams({ encoder: new CustomEncoder() }));
    }

    public static buildParamsPassNull(obj: any): Object {
        return Object.keys(obj)
            .reduce((acc, key) => {
                if (obj[key] !== null && obj[key] !== undefined) {
                    acc[key] = obj[key];
                }
                return acc;
            }, {} as any)
    }

    public static convertEmail(email: string): string {
        if (email) {
            const [username, domain] = email.split('@');
            let maskedUsername = '';
            if (username.length >= 4) {
                maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
            } else {
                maskedUsername = username[0] + '*'.repeat(username.length - 1);
            }
            const domainParts = domain.split('.');
            const mainDomain = domainParts[0];
            const maskedMainDomain = mainDomain[0] + '*'.repeat(mainDomain.length - 1);
            const topLevelDomain = domainParts.slice(1).join('.');
            const maskedDomain = `${maskedMainDomain}.${topLevelDomain}`;
            return `${maskedUsername}@${maskedDomain}`;
        }
        return '';
    }
}


class CustomEncoder implements HttpParameterCodec {
    encodeKey(key: string): string {
        return encodeURIComponent(key);
    }

    encodeValue(value: string): string {
        return encodeURIComponent(value);
    }

    decodeKey(key: string): string {
        return decodeURIComponent(key);
    }

    decodeValue(value: string): string {
        return decodeURIComponent(value);
    }
}

export function disableItemsNotAtLevel(list: any[], level: number): any[] {
    return list.map(item => ({
        ...item,
        disabled: item.level !== level
    }));
}

export function setDisableForItemsNotAtLevel(list: any[], level: number, disable: boolean): any {
    return list.forEach(item => {
        if (item.level !== level) {
            item.disabled = disable;
        }
    });
}