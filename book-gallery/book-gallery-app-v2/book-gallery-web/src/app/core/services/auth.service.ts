import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { HttpBackend } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments.developement';

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly rawHttp = new HttpClient(inject(HttpBackend));
  private readonly apiUrl = environment.apiUrl;
  private refreshRequest: Observable<AuthTokenResponse> | null = null;

  login(username: string, password: string, rememberMe: boolean): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap(response => this.storeTokens(response, rememberMe))
    );
  }

  hasValidAccessToken(): boolean {
    const token = localStorage.getItem('JWT_TOKEN') ?? sessionStorage.getItem('JWT_TOKEN');
    if (!token) {
      return false;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return false;
      }

      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '='));
      const claims = JSON.parse(decodedPayload) as { exp?: unknown };
      return typeof claims.exp === 'number' && Number.isFinite(claims.exp) &&
        claims.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  refreshAccessToken(): Observable<AuthTokenResponse> {
    if (this.refreshRequest) {
      return this.refreshRequest;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Cannot refresh the session because no refresh token is available.'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    this.refreshRequest = this.rawHttp
      .post<AuthTokenResponse>(`${this.apiUrl}/auth/refresh`, request)
      .pipe(
        tap(response => this.storeTokens(response, this.hasPersistentSession())),
        finalize(() => {
          this.refreshRequest = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.refreshRequest;
  }

  clearSession(): void {
    localStorage.removeItem('JWT_TOKEN');
    localStorage.removeItem('REFRESH_TOKEN');
    sessionStorage.removeItem('JWT_TOKEN');
    sessionStorage.removeItem('REFRESH_TOKEN');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('REFRESH_TOKEN') ?? sessionStorage.getItem('REFRESH_TOKEN');
  }

  private hasPersistentSession(): boolean {
    return localStorage.getItem('REFRESH_TOKEN') !== null;
  }

  private storeTokens(response: AuthTokenResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem('JWT_TOKEN', response.accessToken);
    storage.setItem('REFRESH_TOKEN', response.refreshToken);
    otherStorage.removeItem('JWT_TOKEN');
    otherStorage.removeItem('REFRESH_TOKEN');
  }
}
