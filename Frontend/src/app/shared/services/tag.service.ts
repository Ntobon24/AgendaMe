import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../interfaces/tag';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  apiUrl = 'http://localhost:3000/tag';

  private getHeaders(includeAuth = true): HttpHeaders {
    const base = { 'Content-Type': 'application/json' } as Record<string, string>;
    if (includeAuth) {
      const token = this.authService.getToken();
      if (token) base['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(base);
  }

  getAllTags(): Observable<Tag[]> {
    const hasToken = !!this.authService.getToken();
    return this.http.get<Tag[]>(this.apiUrl, { headers: this.getHeaders(hasToken) });
  }

  getTagById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTag(tagData: { name: string; description?: string }): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tagData, { headers: this.getHeaders() });
  }

  updateTag(id: string, tagData: Partial<Tag>): Observable<Tag> {
    return this.http.patch<Tag>(`${this.apiUrl}/${id}`, tagData, { headers: this.getHeaders() });
  }

  deleteTag(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
