import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business } from '../interfaces/business';
import { AuthService } from './auth';

export interface SearchParams {
  q?: string;
  tags?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  businesses: Business[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  apiUrl = 'http://localhost:3000/search';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  searchBusinesses(params: SearchParams): Observable<SearchResult> {
    let httpParams = new HttpParams();
    
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.tags) httpParams = httpParams.set('tags', params.tags);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.offset) httpParams = httpParams.set('offset', params.offset.toString());

    return this.http.get<SearchResult>(`${this.apiUrl}/businesses`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getBusinessesForMap(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/businesses/map`, { headers: this.getHeaders() });
  }
}
