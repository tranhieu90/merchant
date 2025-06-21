import { Injectable, Inject } from '@angular/core';
import { DefaultLocaleConfig, LOCALE_CONFIG, LocaleConfig } from 'ngx-daterangepicker-material';


@Injectable()
export class LocaleService {
  constructor(@Inject(LOCALE_CONFIG) private configHolder: LocaleConfig) {}

  get config() {
    if (!this.configHolder) {
      return DefaultLocaleConfig;
    }
    return { ...DefaultLocaleConfig, ...this.configHolder };
  }

  configWithLocale(locale:any) {
    if (!this.configHolder && !locale) {
      return DefaultLocaleConfig;
    }
    return {
      ...DefaultLocaleConfig,
      ...{ daysOfWeek: locale.weekdaysMin, monthNames: locale.monthsShort, firstDay: locale.weekStart },
      ...this.configHolder
    };
  }
}