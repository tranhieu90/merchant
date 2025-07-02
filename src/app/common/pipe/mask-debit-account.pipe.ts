import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskDebitAccount',
  standalone: true
})
export class MaskDebitAccountPipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value.length < 10) {
      return value;
    }

    const start = value.substring(0, 3);
    const end = value.substring(value.length - 3);
    const masked = '*'.repeat(value.length - 6);

    return `${start}${masked}${end}`;
  }

}
