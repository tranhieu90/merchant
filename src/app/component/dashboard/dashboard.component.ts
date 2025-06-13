import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../common/service/auth/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../common/service/toast/toast.service';
import { Router } from '@angular/router';
import { FetchApiService } from '../../common/service/api/fetch-api.service';
import { DialogCommonService } from '../../common/service/dialog-common/dialog-common.service';
import { DialogConfirmModel } from '../../model/DialogConfirmModel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  constructor(
    private api: FetchApiService,
    private router: Router,
    private toast: ToastService,
    private auth: AuthenticationService,
    private dialog: MatDialog,
    private dialogCommon: DialogCommonService,
  ) {
  }
  ngOnInit(): void {
    
  }

}
