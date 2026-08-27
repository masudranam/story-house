import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment, Page } from '../models/api.models';

export interface CommentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  storyId?: string;
}

@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private readonly http = inject(HttpClient);

  listForStory(storyId: string, page = 1, limit = 10): Observable<Page<Comment>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<Page<Comment>>(`/api/v1/stories/${storyId}/comments`, { params });
  }

  createForStory(storyId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`/api/v1/stories/${storyId}/comments`, { content });
  }

  update(id: string, content: string): Observable<Comment> {
    return this.http.patch<Comment>(`/api/v1/comments/${id}`, { content });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/comments/${id}`);
  }

  /** Admin moderation list. */
  list(query: CommentsQuery): Observable<Page<Comment>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Page<Comment>>('/api/v1/comments', { params });
  }
}
