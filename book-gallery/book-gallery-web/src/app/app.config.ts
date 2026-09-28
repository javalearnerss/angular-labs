import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BookMockService } from './shared/services/book-mock.service';
import { BOOK_DATA, BOOK_MOCK_DATA, BOOK_SERVICE } from './shared/services/book-mock-data';
import { BookApiService } from './shared/services/book-api.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(withInterceptors([
    // authInterceptor,
    // errorInterceptor,
    // loadingInterceptor,
    // loggingInterceptor,
    cacheInterceptor
  ])),
  {
    provide: BOOK_DATA,
    useValue: BOOK_MOCK_DATA
  },
  {
    provide: BOOK_SERVICE,
    useClass: BookApiService
  }

  ]
};
