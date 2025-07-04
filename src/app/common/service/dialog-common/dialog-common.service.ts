import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogConfirmComponent } from '../../../base/shared/dialog-confirm/dialog-confirm.component';
import { DialogConfirmModel } from '../../../model/DialogConfirmModel';

@Injectable({
  providedIn: 'root'
})
export class DialogCommonService {

  constructor(private dialog: MatDialog) { }

  openDialogInfo(dataModel: DialogConfirmModel): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: dataModel,
      disableClose: true,
    });

    return dialogRef.afterClosed();
  }
}
