import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { AppHttpInterceptor } from './common/helpers/http.interceptor';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlCro } from './base/utils/MatPaginatorIntlCro';
import { NgxSpinnerModule } from 'ngx-spinner';
// import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';

// export function httpLoaderFactory(http: HttpClient) {
//     const assetsUrl = environment.base_url + '/assets/i18n/'
//   return new TranslateHttpLoader(http, assetsUrl, '.json?nocache=' + new Date().getTime())
// }

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';

registerLocaleData(localeVi);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'vi' },
    provideNzI18n(vi_VN),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(ToastModule),
    importProvidersFrom(NgxSpinnerModule),
    MessageService,
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    // importProvidersFrom(
    //   TranslateModule.forRoot({
    //     defaultLanguage: 'vi-VN',
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: httpLoaderFactory,
    //       deps: [HttpClient],
    //     },
    //   })
    // ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true,
    },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro },
  ],
};
