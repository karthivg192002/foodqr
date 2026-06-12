import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const options = params ? { params: this.buildParams(params) } : {};
    return this.http.get<any>(`${this.baseUrl}/${endpoint}`, options).pipe(
      map((res) => res.data ?? res)
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<any>(`${this.baseUrl}/${endpoint}`, body).pipe(
      map((res) => res.data ?? res)
    );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<any>(`${this.baseUrl}/${endpoint}`, body).pipe(
      map((res) => res.data ?? res)
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<any>(`${this.baseUrl}/${endpoint}`, body).pipe(
      map((res) => res.data ?? res)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<any>(`${this.baseUrl}/${endpoint}`).pipe(
      map((res) => res.data ?? res)
    );
  }

  upload(endpoint: string, file: File, fieldName = 'file'): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http.post<any>(`${this.baseUrl}/${endpoint}`, formData).pipe(
      map((res) => res.data ?? res)
    );
  }
}
