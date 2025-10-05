import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tag {
  id: string;
  name: string;
  color_hex?: string | null;
  description?: string | null;
}

export interface TagListResponse {
  total: number;
  page: number;
  limit: number;
  data: Tag[];
}

@Injectable({ providedIn: 'root' })
export class TagsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/tags`;

  list(q = '', page = 1, limit = 100): Observable<TagListResponse> {
    return this.http.get<TagListResponse>(this.api, { params: { q, page, limit } });
  }

  create(payload: { name: string; color_hex?: string | null; description?: string | null }): Observable<Tag> {
    return this.http.post<Tag>(this.api, payload);
  }

  remove(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}/${id}`);
  }
}

