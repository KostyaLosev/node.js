import { ApplicationConfig, importProvidersFrom  } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { FormsModule  } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    importProvidersFrom(
      FormsModule,
      QuillModule.forRoot()),
  ]
};
