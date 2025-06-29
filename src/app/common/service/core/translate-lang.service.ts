// import { Injectable, Injector } from '@angular/core'
// import { LOCATION_INITIALIZED } from '@angular/common'
// import { TranslateService } from '@ngx-translate/core'

// /**
//  * Service for managing language translations.
//  */
// @Injectable({
//   providedIn: 'root'
// })
// export class TranslateLangService {
//   /**
//    * Creates an instance of TranslateLangService.
//    * @param injector - The dependency injector.
//    * @param translate - The translation service.
//    */
//   constructor(private injector: Injector, private translate: TranslateService) {}

//   /**
//    * Initializes the language translation service.
//    * @returns A promise that resolves when the service is initialized.
//    */
//   load(): Promise<void> {
//     return new Promise((resolve) => {
//       const locationInitialized = this.injector.get(LOCATION_INITIALIZED, Promise.resolve(null))
//       locationInitialized.then(() => {
//         const defaultLang = 'vi-VN'
//         this.translate.setDefaultLang(defaultLang)
//         this.translate.use(defaultLang).subscribe(
//           () => {
//             console.log(`Successfully initialized '${defaultLang}' language.'`)
//           },
//           () => {
//             console.error(`Problem with '${defaultLang}' language initialization.'`)
//           },
//           () => {
//             resolve()
//           }
//         )
//       })
//     })
//   }
// }
