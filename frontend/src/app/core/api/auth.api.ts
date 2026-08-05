import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthSession, TokenPair, User } from '../models/api.models';

export interface SignupPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  signup(payload: SignupPayload): Observable<User> {
    return this.http.post<User>('/api/v1/auth/signup', payload);
  }

  login(identifier: string, password: string): Observable<AuthSession> {
    return this.http.post<AuthSession>('/api/v1/auth/login', { identifier, password });
  }

  refresh(refreshToken: string): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/v1/auth/refresh', { refreshToken });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>('/api/v1/auth/logout', { refreshToken });
  }
}
