
/**
## 12. HTTP Interceptors

120. [HTTP Interceptor] What is an interceptor?
121. [Auth Interceptor] How would you attach the JWT?
122. [Error Interceptor] How would you handle 401 globally?
123. [Loading Interceptor] How would you implement a global loading indicator?
124. [Logging Interceptor] How would you log API requests?
125. [Token Refresh] How would you refresh an expired token?
126. [Concurrent 401s] What happens if 10 requests receive 401 simultaneously?
127. [Interceptor Ordering] How does Angular execute multiple interceptors?

 */

========================================================================================================
In Angular, an interceptor is a piece of code that sits between your app and the server, 
letting you intercept and modify HTTP requests and responses as they pass through Angular's HttpClient.

What it does

Every HTTP request your app makes (and every response it gets back) can be routed through one or more interceptors 
before it reaches its destination. This is useful for handling cross-cutting concerns 
you don't want to repeat in every single service call — things like:

  Adding auth tokens — automatically attach an Authorization header to outgoing requests
  Logging — log requests/responses for debugging
  Error handling — catch errors globally (e.g., redirect to login on a 401)
  Loading indicators — show/hide a spinner while requests are in flight
  Caching — return cached responses instead of hitting the server again
  Modifying requests/responses — transform data, add headers, set timeouts

How it works (modern, functional style — Angular 15+)

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = 'your-token-here';
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });
  return next(authReq);
};

You register it when bootstrapping the app:

typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
});


Older, class-based style (still supported)

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer token')
    });
    return next.handle(authReq);
  }
}
Key idea to remember

Interceptors form a chain — each one calls next() (functional) or next.handle() (class-based) to pass the request along to the 
next interceptor or the actual HTTP backend. This lets you compose multiple interceptors, 
each handling one concern (auth, logging, errors, etc.), instead of writing that logic into every HTTP call manually.

============================================================================================================================================

120. [HTTP Interceptor] What is an interceptor?


An HTTP Interceptor is a function (or class) that intercepts every outgoing HTTP request and incoming response passed 
through Angular's HttpClient. It lets you apply cross-cutting logic — auth headers, logging, error handling, 
loading indicators — in one central place instead of repeating it in every service call.


export const myInterceptor: HttpInterceptorFn = (req, next) => {
  // modify req before it goes out
  return next(req); // pipe/modify response on the way back
};


============================================================================================================================================
121. [Auth Interceptor] How would you attach the JWT?

Clone the request (requests are immutable) and add the Authorization header before passing it to next().


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};

Interview tip: mention that you'd exclude auth endpoints (like /login) from getting the token, usually by checking req.url.

============================================================================================================================================
122. [Error Interceptor] How would you handle 401 globally?
Use catchError in an interceptor, check error.status === 401, and redirect to login (or trigger a refresh flow — see Q125).

typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

Interview tip: Say that 401 usually means "not authenticated" (expired/invalid token) → try refresh first, 
then logout only if refresh also fails. 403 means "authenticated but not authorized" — different handling, no redirect to login needed.

============================================================================================================================================
123. [Loading Interceptor] How would you implement a global loading indicator?

Use a shared LoadingService with a counter (not just true/false — important because of concurrent requests), 
incremented in the interceptor and decremented in finalize().

typescript
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  loading$ = new BehaviorSubject<boolean>(false);

  show() {
    this.counter++;
    this.loading$.next(true);
  }

  hide() {
    this.counter--;
    if (this.counter <= 0) {
      this.counter = 0;
      this.loading$.next(false);
    }
  }
}
typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.show();

  return next(req).pipe(
    finalize(() => loading.hide())
  );
};

Interview tip: Explain why a counter is needed — if 3 requests are in-flight and one finishes, 
a simple boolean would hide the spinner even though 2 requests are still pending. 
finalize() runs on both success and error, so the spinner always closes correctly.


============================================================================================================================================
124. [Logging Interceptor] How would you log API requests?

Use tap() to log without altering the stream, and measure duration with a timestamp.

typescript
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log(`${req.method} ${req.url} - ${Date.now() - startTime}ms`);
        }
      },
      error: (err) => {
        console.error(`${req.method} ${req.url} failed`, err);
      }
    })
  );
};

Interview tip: Mention checking event.type === HttpEventType.Response if you only want to log the final response, not intermediate progress events (relevant for file uploads/downloads with reportProgress: true).

============================================================================================================================================
125. [Token Refresh] How would you refresh an expired token?
Catch the 401, call the refresh-token endpoint, retry the original request with the new token using switchMap.

typescript
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh')) {
        return authService.refreshToken().pipe(
          switchMap((newToken) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

Interview tip: Point out the !req.url.includes('/refresh') check — without it, 
a failing refresh call could trigger itself again and loop infinitely.


============================================================================================================================================
126. [Concurrent 401s] What happens if 10 requests receive 401 simultaneously?
Problem without protection: all 10 requests independently call the refresh endpoint → server issues 10 new tokens, 
possibly invalidating earlier ones, wasted network calls, race conditions.

Solution: Use a shared Subject/flag so only the first 401 triggers the actual refresh call. 
The other 9 requests wait for that same in-flight refresh to complete, then retry with the new token.

typescript
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((newToken) => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken);
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          // Wait for the ongoing refresh to finish, then retry
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token =>
              next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
            )
          );
        }
      }
      return throwError(() => error);
    })
  );
};

Interview tip: This is a common senior-level follow-up. The key insight to state out loud: 
"Only one refresh call should ever be in-flight at a time; every other failed request should queue and reuse its result." 
This demonstrates you understand race conditions, not just the happy path.



============================================================================================================================================
127. [Interceptor Ordering] How does Angular execute multiple interceptors?

Interceptors run as a chain, in the order they're provided in withInterceptors([...]).

On the request side: they execute top-to-bottom, each calling next() to pass control to the next one.
On the response side: they execute bottom-to-top (unwinding back through the same chain).
Request:  Interceptor A → Interceptor B → Interceptor C → Server
Response: Server → Interceptor C → Interceptor B → Interceptor A → App

So with withInterceptors([auth, loading, logging, error]):

Outgoing: auth adds token → loading shows spinner → logging logs request → error (does nothing outgoing) → sent to server
Incoming: error handles failure first → logging logs response → loading hides spinner → auth (does nothing incoming) → back to app

Interview tip: This ordering matters practically — e.g., if the auth interceptor needs to attach a refreshed token, 
it should generally sit before interceptors that depend on a valid token, 
and the error/refresh interceptor needs to be positioned so it can retry a request that goes back through the auth interceptor 
to get the new token attached.


====================================================================================================================
HTTP Interceptors in Angular

An HTTP Interceptor is a mechanism that lets you intercept and modify HTTP requests and responses globally, 
before they reach the server or before the response reaches your application code. 
They sit in the middle of every HTTP call made through Angular's HttpClient.

What Interceptors Do
  Modify outgoing requests — add headers (auth tokens, content-type), log requests, transform request bodies
  Modify incoming responses — transform response data, log responses
  Handle errors globally — catch 401s and redirect to login, retry failed requests, show error toasts
  Show loading indicators — start a spinner when a request begins, stop it when it completes

Key Concepts
  Immutable requests: You can't mutate req directly — you must clone() it with changes.
  Chainable: Multiple interceptors run in the order they're provided, each passing control to the next via next().
  Functional vs class-based: Since Angular 15, functional interceptors (plain functions) are preferred over the older class-based 
  HttpInterceptor approach — simpler, less boilerplate.
  
Bookstore Example

Here's a full working set of interceptors for a bookstore app, using realistic endpoints like /api/books, /api/orders, /api/cart.

------->

1. Auth Token Interceptor

Attaches the logged-in user's token to every request.

typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('bookstore_token');

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};

So when a component calls:

typescript
this.http.get('/api/books/bestsellers');

the interceptor automatically adds the Authorization header — no need to set it manually in every service call.

------>

2. Logging Interceptor

Logs every request/response — useful for debugging search or checkout flows.

typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  console.log(`📚 Request → ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: () => {
        const elapsed = Date.now() - started;
        console.log(`✅ Response ← ${req.url} (${elapsed}ms)`);
      },
      error: (err) => {
        console.error(`❌ Error on ${req.url}`, err);
      }
    })
  );
};

------->

3. Error Handling Interceptor

Catches errors from book/order APIs — e.g., redirect to login on 401, warn on book-not-found (404), or handle out-of-stock (409) errors.

typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      } else if (error.status === 404 && req.url.includes('/api/books/')) {
        console.warn('Book not found in catalog');
      } else if (error.status === 409 && req.url.includes('/api/cart')) {
        console.warn('Book is out of stock');
      }
      return throwError(() => error);
    })
  );
};

------->

4. Loading Spinner Interceptor

Shows a spinner while fetching books, hides it once the response (or error) arrives.

typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};

------->

Registering All Interceptors Together
typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loggingInterceptor } from './interceptors/logging.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        loggingInterceptor,
        errorInterceptor
      ])
    )
  ]
};

Order matters — interceptors run top to bottom on the request, and bottom to top on the response. 
So here: auth header gets added first → spinner shows → request logged → sent → response comes back → logged → error handled 
if any → spinner hides.

Using It in a Service — No Extra Code Per Call
typescript
@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(private http: HttpClient) {}

  getBestsellers() {
    return this.http.get<Book[]>('/api/books/bestsellers');
  }

  addToCart(bookId: string) {
    return this.http.post('/api/cart', { bookId });
  }

  checkout(orderId: string) {
    return this.http.post(`/api/orders/${orderId}/checkout`, {});
  }
}

Every one of these calls automatically gets the auth token, triggers the spinner, gets logged, and has errors handled — 
all without touching BookService itself.

Class-based Interceptor (older style, still supported)
typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next.handle(clonedReq);
  }
}

Registered via the HTTP_INTERCEPTORS token in module providers — this is the pattern you'll see in pre-Angular-15 
codebases or NgModule-based apps.

That's the core value of interceptors: cross-cutting concerns (auth, logging, errors, loading) handled once, applied everywhere.


==============================================================================================================================
The one that's always active: XSRF protection

This is enabled by default in provideHttpClient() — you don't need to opt in. 
It works like an interceptor internally: on every outgoing request, Angular checks for a cookie (default name XSRF-TOKEN), 
and if found, attaches its value as a header (default name X-XSRF-TOKEN). If no cookie exists, it does nothing. 
You can disable it explicitly with withNoXsrfProtection(), or rename the cookie/header via withXsrfConfiguration(). 
ninja-squad

Everything else is opt-in, not default
JSONP support — only added if you pass withJsonpSupport()
Fetch vs XHR backend — this is just a transport choice, not really an "interceptor," and depends on your Angular version's 
default (older versions default to XHR unless withFetch() is passed; some newer versions flipped the default — worth checking 
your specific version)
Your own functional or class-based interceptors — only run if you explicitly register them via withInterceptors([...]) or withInterceptorsFromDi()
So to directly answer your question

If you write zero interceptors yourself, and just use plain provideHttpClient():

✅ XSRF header attachment runs on every request (silently, if the cookie exists)
❌ No auth, logging, error handling, retry, or caching logic runs — nothing happens automatically for those
❌ No class-based interceptors run unless you specifically opted into withInterceptorsFromDi() and registered some via HTTP_INTERCEPTORS token

So in practice: your requests go out basically untouched, except for that one XSRF check happening quietly in the background.