import { Component, signal, inject, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { UrlShortenerService, ShortenResult } from '@app/core/services/url-shortener.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { ToastService } from '@shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-url-shortener',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent, InputComponent],
  template: `
    <tool-card
      [title]="'URL Shortener'"
      [subtitle]="'Enter a long URL to create a shortened version.'"
      [hasActions]="true"
    >
      <div class="form-group">
        <div class="field">
          <ui-input
            id="long-url"
            label="Long URL"
            placeholder="https://example.com/very/long/url/to/shorten"
            [(model)]="longUrl"
          ></ui-input>
        </div>

        <div class="form-row">
          <div class="btn-group">
            <ui-button (click)="shortenUrl()" [disabled]="isLoading() || !longUrl()">
              {{ isLoading() ? 'Shortening…' : 'Shorten' }}
            </ui-button>
            <ui-button variant="secondary" (click)="clear()" [disabled]="isLoading()"
              >Clear</ui-button
            >
          </div>
        </div>
      </div>

      <div *ngIf="shortUrl() || error()" class="result-box">
        <ng-container *ngIf="shortUrl()">
          <div class="result-item">
            <strong>Short URL:</strong>
            <a [href]="shortUrl()" target="_blank" rel="noopener noreferrer" class="link">{{
              shortUrl()
            }}</a>
          </div>
          <ui-button variant="ghost" size="sm" (click)="copy()">Copy</ui-button>
        </ng-container>
        <div *ngIf="error()" class="err">{{ error() }}</div>
      </div>

      <div actions>
        <small class="muted">Powered by cleanuri.com API. URLs are publicly accessible.</small>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-row {
        display: flex;
      }
      .field {
        width: 100%;
      }
      .btn-group {
        display: flex;
        gap: 12px;
      }
      .result-box {
        margin-top: 20px;
        padding: 12px 16px;
        border: 1px solid var(--glass);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .result-item {
        display: flex;
        align-items: center;
        gap: 8px;
        word-break: break-all;
      }
      .link {
        color: var(--accent);
        text-decoration: underline;
      }
      .muted {
        color: var(--muted);
      }
      .err {
        color: #ffb3b3;
      }
    `,
  ],
})
export class UrlShortenerComponent {
  private urlShortenerService = inject(UrlShortenerService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  longUrl = signal<string>('');
  shortUrl = signal<string | null>(null);
  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      this.cdr.detectChanges();
    });
  }

  shortenUrl() {
    this.isLoading.set(true);
    this.error.set(null);
    this.shortUrl.set(null);

    this.urlShortenerService
      .shorten(this.longUrl())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((result: ShortenResult) => {
        if (result.shortUrl) {
          this.shortUrl.set(result.shortUrl);
          this.toast.success('URL shortened successfully!');
        } else {
          this.error.set(result.error);
          this.toast.error(result.error ?? 'An unknown error occurred.');
        }
      });
  }

  async copy() {
    const url = this.shortUrl();
    if (!url) return;
    const ok = await copyToClipboard(url);
    ok ? this.toast.success('Copied to clipboard') : this.toast.error('Failed to copy');
  }

  clear() {
    this.longUrl.set('');
    this.shortUrl.set(null);
    this.error.set(null);
  }
}
