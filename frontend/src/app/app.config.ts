import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AuthStore } from './core/auth/auth-store';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorToastInterceptor } from './core/interceptors/error-toast.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Order matters: auth (outermost) → refresh → error toast (sees raw errors first).
    provideHttpClient(
      withInterceptors([authInterceptor, refreshInterceptor, errorToastInterceptor]),
    ),
    // Start the session restore but DON'T block first render on it (a blank
    // page for two round-trips). Guards await store.sessionReady instead.
    provideAppInitializer(() => {
      void inject(AuthStore).init();
    }),
  ],
};
