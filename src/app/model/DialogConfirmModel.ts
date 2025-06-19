export class DialogConfirmModel {
  title!: string;
  message!: string;
  icon!: string;
  iconColor!: string;
  buttonLabel!: string;
  buttonColor!: string;
  viewCancel?: boolean = true;
  cancelTitle?: string;
  width?: string;
  iconClosePopup?: boolean = true;
}
