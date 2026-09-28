import {
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';

import { Observable, of, tap } from 'rxjs';

import { PageResponse } from '../../features/books/models/page-response.model';

interface CacheEntry {
  data: PageResponse;
  expiry: number;
}

const CACHE_DURATION = 60 * 1000; // 60 seconds

const cache = new Map<string, CacheEntry>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {

  // Cache only GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Create unique key including query parameters
  const cacheKey = req.urlWithParams;

  // Check cache
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry) {

    // Check whether cache is still valid
    if (Date.now() < cachedEntry.expiry) {

      console.log('Cache HIT:', cacheKey);

      return of(
        new HttpResponse<PageResponse>({
          body: cachedEntry.data,
          status: 200
        })
      );
    }

    // Cache expired
    console.log('Cache EXPIRED:', cacheKey);

    cache.delete(cacheKey);
  }

  console.log('Cache MISS:', cacheKey);

  // Make actual HTTP request
  return next(req).pipe(

    tap(event => {

      if (event instanceof HttpResponse) {

        const responseBody = event.body as PageResponse;

        if (responseBody) {

          cache.set(cacheKey, {
            data: responseBody,
            expiry: Date.now() + CACHE_DURATION
          });

          console.log('Response cached:', cacheKey);
        }
      }
    })
  );
};