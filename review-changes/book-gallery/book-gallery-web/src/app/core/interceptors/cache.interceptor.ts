import {
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';

import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiry: number;
}

const CACHE_DURATION = 60 * 1000; // 60 seconds

const cache = new Map<string, CacheEntry>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.method !== 'GET') {
    cache.clear();
    return next(req);
  }

  const requestPath = req.url.replace(/\/+$/, '');
  if (!requestPath.endsWith('/books') || req.headers.has('Authorization')) {
    return next(req);
  }

  const cacheKey = req.urlWithParams;
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry) {
    if (Date.now() < cachedEntry.expiry) {
      return of(cachedEntry.response.clone());
    }

    cache.delete(cacheKey);
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200 && event.body !== null) {
          cache.set(cacheKey, {
            response: event.clone(),
            expiry: Date.now() + CACHE_DURATION
          });
      }
    })
  );
};
