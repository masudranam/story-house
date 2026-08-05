import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, PublicUser, Role, Stats, User } from '../models/api.models';

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);

  me(): Observable<User> {
    return this.http.get<User>('/api/v1/users/me');
  }

  updateMe(changes: { name?: string; username?: string }): Observable<User> {
    return this.http.patch<User>('/api/v1/users/me', changes);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>('/api/v1/users/me/password', { currentPassword, newPassword });
  }

  deleteMe(): Observable<void> {
    return this.http.delete<void>('/api/v1/users/me');
  }

  publicProfile(id: string): Observable<PublicUser> {
    return this.http.get<PublicUser>(`/api/v1/users/${id}`);
  }

  list(query: UsersQuery): Observable<Page<User>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Page<User>>('/api/v1/users', { params });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${id}`);
  }

  stats(): Observable<Stats> {
    return this.http.get<Stats>('/api/v1/users/stats');
  }
}
