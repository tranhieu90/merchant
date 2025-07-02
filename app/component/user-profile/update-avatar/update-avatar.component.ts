import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ToastService } from '../../../common/service/toast/toast.service';
import { FetchApiService } from '../../../common/service/api/fetch-api.service';
import { USER_ENDPOINT } from '../../../common/enum/EApiUrl';
import { AuthenticationService } from '../../../common/service/auth/authentication.service';

@Component({
  selector: 'app-update-avatar',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    NgIf
  ],
  templateUrl: './update-avatar.component.html',
  styleUrl: './update-avatar.component.scss'
})
export class UpdateAvatarComponent implements OnInit {
  file: File | null = null;
  avatarUrl: string = 'assets/images/avatar_trang.jfif';
  isOver: boolean = false;
  hasAvatar: boolean = false;
  userInfo: any;
  isShow: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<UpdateAvatarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastService,
    private api: FetchApiService,
    private auth: AuthenticationService,
  ) {
  }

  ngOnInit() {
    this.userInfo = this.auth.getUserInfo();
    if (this.data) {
      this.isShow = false;
    }
  }

  zoomLevel: number = 1;

  zoomAvatar(value: number) {
    this.zoomLevel = Math.max(1, Math.min(2, this.zoomLevel + value));
  }

  applyZoom() {
    this.zoomLevel = Math.max(0.5, Math.min(2, Number(this.zoomLevel)));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileFormat = /\.(jpg|jpeg|png|webp)$/i;
      if (!fileFormat.test(file.name)) {
        this.toast.showError("Vui lòng chọn file đúng định dạng: .jpg, .png, .jpeg");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        if (this.hasAvatar) {
          this.isOver = true;
        } else {
          this.onclose();
          this.toast.showError("Dung lượng file quá 2MB cho phép");
        }
        return;
      }

      this.file = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
        this.hasAvatar = true;
        this.isShow = true;
      };

      reader.readAsDataURL(file);
    }
  }

  onclose() {
    this.dialogRef.close(false);
  }

  updateAvatar() {
    if (!this.file) {
      this.toast.showError("Vui lòng chọn ảnh để cập nhật");
      return;
    }

    const formData = new FormData();
    formData.append('userId', this.userInfo['id']);
    formData.append('file', this.file as Blob);

    this.api.post(USER_ENDPOINT.UPDATE_AVATAR, formData).subscribe(res => {
      this.toast.showSuccess("Cập nhật ảnh đại diện thành công")
      this.dialogRef.close(true);
    }, () => {
      this.toast.showError("Cập nhật ảnh đại diện thất bại")
    })
  }
}
