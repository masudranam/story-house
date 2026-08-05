import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, Story, StorySort } from '../models/api.models';

export interface StoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  authorId?: string;
  sort?: StorySort;
}

@Injectable({ providedIn: 'root' })
export class StoriesApi {
  private readonly http = inject(HttpClient);

  list(query: StoriesQuery): Observable<Page<Story>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Page<Story>>('/api/v1/stories', { params });
  }

  get(id: string): Observable<Story> {
    return this.http.get<Story>(`/api/v1/stories/${id}`);
  }

  create(title: string, content: string): Observable<Story> {
    return this.http.post<Story>('/api/v1/stories', { title, content });
  }

  update(id: string, changes: { title?: string; content?: string }): Observable<Story> {
    return this.http.patch<Story>(`/api/v1/stories/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/stories/${id}`);
  }

  like(storyId: string): Observable<void> {
    return this.http.put<void>(`/api/v1/stories/${storyId}/like`, {});
  }

  unlike(storyId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/stories/${storyId}/like`);
  }
}
