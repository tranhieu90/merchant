import { NgClass, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class DialogRoleModel {
  title!: string;
  message!: string;
  icon!: string;
  iconColor!: string;
  buttonLeftLabel!: string;
  buttonRightLabel!: string;
  buttonRightColor!: string;
  hiddenButtonLeft!: boolean;
  hiddenButtonRight!: boolean;
}

@Component({
  selector: 'app-dialog-role',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './dialog-role.component.html',
  styleUrl: './dialog-role.component.scss'
})


export class DialogRoleComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: DialogRoleModel,
  ) {
  }

  ngOnInit() {
  }


  doAction(actionType: boolean) {
    if (actionType === false && this.dataDialog.hiddenButtonLeft === false) {
      this.dialogRef.close();
    } else {
      this.dialogRef.close(actionType);
    }

  }

  onclose() {
    this.dialogRef.close();
  }
}
