import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, ToolCardComponent],
  template: `
    <h1>Welcome 👋</h1>
    <p>A collection of simple, open-source tools for developers.</p>

    <section class="grid">
      <a routerLink="/cpf-generator" class="card-link">
        <tool-card
          [title]="'CPF Generator'"
          [subtitle]="'Create valid Brazilian CPF numbers for testing.'"
        ></tool-card>
      </a>

      <a routerLink="/qr-code" class="card-link">
        <tool-card
          [title]="'QR Code Generator'"
          [subtitle]="'Generate QR codes from any text or URL.'"
        ></tool-card>
      </a>

      <a routerLink="/uuid" class="card-link">
        <tool-card
          [title]="'UUID Generator'"
          [subtitle]="'Generate RFC 4122 v4 UUIDs.'"
        ></tool-card>
      </a>

      <a routerLink="/password" class="card-link">
        <tool-card
          [title]="'Password Generator'"
          [subtitle]="'Create secure, custom passwords.'"
        ></tool-card>
      </a>

      <a routerLink="/timestamp" class="card-link">
        <tool-card
          [title]="'Timestamp Converter'"
          [subtitle]="'Convert between Unix and local time.'"
        ></tool-card>
      </a>

      <a routerLink="/url-shortener" class="card-link">
        <tool-card
          [title]="'URL Shortener'"
          [subtitle]="'Shorten long URLs for sharing.'"
        ></tool-card>
      </a>

      <a routerLink="/json-formatter" class="card-link">
        <tool-card
          [title]="'JSON Formatter'"
          [subtitle]="'Format, validate, and minify JSON data.'"
        ></tool-card>
      </a>

      <a routerLink="/jwt-decoder" class="card-link">
        <tool-card
          [title]="'JWT Decoder'"
          [subtitle]="'Decode and inspect JSON Web Tokens.'"
        ></tool-card>
      </a>

      <a routerLink="/diff-checker" class="card-link">
        <tool-card
          [title]="'Text Diff Checker'"
          [subtitle]="'Compare two blocks of text to see the differences.'"
        ></tool-card>
      </a>

      <a routerLink="/regex-tester" class="card-link">
        <tool-card
          [title]="'Regex Tester'"
          [subtitle]="'Test and debug regular expressions in real-time.'"
        ></tool-card>
      </a>
    </section>
  `,
  styles: [
    `
      h1 {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--text);
      }
      p {
        font-size: 1.125rem;
        color: var(--muted);
        margin-top: 8px;
        max-width: 60ch;
      }
      .grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        margin-top: 32px;
      }
      .card-link {
        text-decoration: none;
        color: inherit;
        display: block;
        outline: none;
        border-radius: var(--radius-md);

        --card-border-color: rgba(255, 255, 255, 0.05);
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
      }
      .card-link:focus-visible {
        box-shadow: 0 0 0 2px var(--bg-900), 0 0 0 4px var(--accent-2);
      }
      .card-link:hover:not(.disabled) {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(46, 242, 123, 0.1);

        --card-border-color: rgba(46, 242, 123, 0.3);
      }
      .card-link.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    `,
  ],
})
export class HomeComponent {}
