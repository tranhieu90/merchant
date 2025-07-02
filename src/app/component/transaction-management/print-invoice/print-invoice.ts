import {Component, Input} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-print-invoice',
  standalone: true,
  imports: [],
  templateUrl: './print-invoice.html',
  styleUrl: './print-invoice.scss',

})

export class PrintInvoice {

  @Input() data!: any;
  assetPath = environment.assetPath;

}
