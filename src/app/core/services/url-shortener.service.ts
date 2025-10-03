import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface CleanUriResponse {
  result_url: string;
}

export interface ShortenResult {
  shortUrl: string | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UrlShortenerService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://cleanuri.com/api/v1/shorten';

  shorten(longUrl: string): Observable<ShortenResult> {
    const body = new URLSearchParams({ url: longUrl });
    return this.http.post<CleanUriResponse>(this.apiUrl, body).pipe(
      map((response) => ({
        shortUrl: response.result_url,
        error: null,
      })),
      catchError((err) => {
        const errorMessage = err.error?.error || 'Failed to shorten URL. Please try again.';
        return of({ shortUrl: null, error: errorMessage });
      })
    );
  }
}
