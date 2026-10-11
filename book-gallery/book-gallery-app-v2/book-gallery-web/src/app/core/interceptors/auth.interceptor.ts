import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuthRequest = /\/auth\/(login|refresh|logout)$/.test(req.url);
  const token = localStorage.getItem('JWT_TOKEN') ?? sessionStorage.getItem('JWT_TOKEN');

  if (!token || isAuthRequest) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authenticatedRequest).pipe(
    catchError(error => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap(tokens => next(req.clone({
          setHeaders: { Authorization: `${tokens.tokenType} ${tokens.accessToken}` }
        }))),
        catchError(refreshError => {
          authService.clearSession();
          if (router.url !== '/login') {
            void router.navigateByUrl('/login');
          }
          return throwError(() => refreshError);
        })
      );
    })
  );
};
