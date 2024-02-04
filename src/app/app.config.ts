import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { RouterModule } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HttpClientModule),

    // provideFileRouter(),
    // provideHttpClient(),
    // provideClientHydration(),
    // // provideContent(withMarkdownRenderer()),
    // importProvidersFrom(
    //   RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
    // ),
  ],
};
