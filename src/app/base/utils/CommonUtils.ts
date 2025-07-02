import { HttpParameterCodec, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserVerifyStatus } from "../../common/constants/CUser";
import { DialogRoleComponent, DialogRoleModel } from "../../component/role-management/dialog-role/dialog-role.component";
import { MatDialog } from "@angular/material/dialog";
import { Router } from '@angular/router';
import { AuthenticationService } from "../../common/service/auth/authentication.service";
import { FetchApiService } from "../../common/service/api/fetch-api.service";
import { DialogConfirmModel } from "../../model/DialogConfirmModel";
import { USER_ENDPOINT } from "../../common/enum/EApiUrl";
import { DialogCommonService } from "../../common/service/dialog-common/dialog-common.service";
import { UpdateUserComponent } from "../../component/user-profile/update-user/update-user.component";

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

    public static checkVerifyAccount(
        dialog: MatDialog,
        router: Router,
        auth: AuthenticationService,
        api: FetchApiService,
        dialogCommon: DialogCommonService
    ): boolean | undefined {
        const verifyUser = auth.checkVerifyUserInfo();
        switch (verifyUser) {
            case UserVerifyStatus.VERIFIED:
                return true;
            case UserVerifyStatus.UN_VERIFIED_WITH_EMAIL:
                this.openDialogUnverifiedAccountAndEmail(dialog, router, auth, api, dialogCommon);
                return false;
            case UserVerifyStatus.UN_VERIFIED_WITHOUT_EMAIL:
                this.openDialogUnverifiedAccountAndNoEmail(dialog, router);
                return false;
            default:
                console.warn('Trạng thái xác minh không hợp lệ:', verifyUser);
                return false;
        }
    }

    private static openDialogUnverifiedAccountAndEmail(
        dialog: MatDialog,
        router: Router,
        auth: AuthenticationService,
        api: FetchApiService,
        dialogCommon: DialogCommonService) {
        let dataDialog: DialogRoleModel = new DialogRoleModel();
        dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
        dataDialog.message = `Hệ thống sẽ gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(auth?.getUserInfo()?.emailChange)}</b>.`;
        dataDialog.icon = 'icon-warning';
        dataDialog.iconColor = 'warning';
        dataDialog.buttonLeftLabel = 'Thay đổi email';
        dataDialog.buttonRightLabel = 'Xác thực email';

        const dialogRef = dialog.open(DialogRoleComponent, {
            width: '500px',
            data: dataDialog,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result != undefined) {
                if (result === true) {
                    this.verifyEmail(router, auth, api, dialogCommon);
                } else {
                    this.updateEmail(dialog, router);
                }
            }
        })
    }

    private static openDialogUnverifiedAccountAndNoEmail(
        dialog: MatDialog,
        router: Router,
    ) {
        let dataDialog: DialogRoleModel = new DialogRoleModel();
        dataDialog.title = 'Tính năng bị hạn chế do chưa xác thực tài khoản';
        dataDialog.message =
            'Vui lòng bổ sung email để hệ thống gửi liên kết xác thực.';
        dataDialog.icon = 'icon-warning';
        dataDialog.hiddenButtonLeft = true;
        dataDialog.iconColor = 'warning';
        dataDialog.buttonRightLabel = 'Bổ sung email';

        const dialogRef = dialog.open(DialogRoleComponent, {
            width: '500px',
            data: dataDialog,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                router.navigate(['/profile']);
            } else {
            }
        });
    }

    private static verifyEmail(
        router: Router,
        auth: AuthenticationService,
        api: FetchApiService,
        dialogCommon: DialogCommonService) {
        api.post(USER_ENDPOINT.SEND_VERIFY_MAIL).subscribe(res => {
            let content = `Chúng tôi vừa gửi liên kết xác thực tới <b>${CommonUtils.convertEmail(auth?.getUserInfo()?.emailChange)}</b>, vui lòng kiểm tra email và làm theo hướng dẫn để hoàn tất xác thực tài khoản.`
            let dataDialog: DialogConfirmModel = new DialogConfirmModel();
            dataDialog.title = 'Hệ thống đã gửi liên kết xác thực';
            dataDialog.message = content;
            dataDialog.buttonLabel = 'Tôi đã hiểu';
            dataDialog.icon = 'icon-mail';
            dataDialog.iconColor = 'icon info';
            dataDialog.viewCancel = false;
            const dialogRef = dialogCommon.openDialogInfo(dataDialog);
            dialogRef.subscribe(res => {
                router.navigate(['/profile']);
            })
        }, (error) => {
            const errorData = error?.error || {};
        })
    }

    private static updateEmail(
        dialog: MatDialog,
        router: Router) {
        const dialogRef = dialog.open(UpdateUserComponent, {
            width: '600px',
            data: {
                title: 'Cập nhật email',
                type: 'email',
                isEmailInfo: true,
            },
            disableClose: true
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                router.navigate(['/profile']);
            }
        })
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