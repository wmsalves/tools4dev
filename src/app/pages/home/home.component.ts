import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Welcome 👋</h1>
    <p>Pick a tool to get started:</p>

    <section class="grid">
      <a routerLink="/cpf-generator" class="card">
        <h2>CPF Generator</h2>
        <p>Create valid Brazilian CPF numbers for testing.</p>
      </a>

      <a routerLink="/qr-code" class="card disabled">
        <h2>QR Code <small>(soon)</small></h2>
        <p>Generate QR codes from any text or URL.</p>
      </a>

      <a routerLink="/url-shortener" class="card disabled">
        <h2>URL Shortener <small>(soon)</small></h2>
        <p>Shorten long URLs for sharing.</p>
      </a>
    </section>
  `,
  styles: [
    `
      h1 {
        margin-bottom: 8px;
      }
      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        margin-top: 16px;
      }
      .card {
        display: block;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: transform 0.08s ease, box-shadow 0.08s ease;
        background: #fff;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
      }
      .card.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      small {
        font-weight: normal;
        color: #6b7280;
      }
    `,
  ],
})
export class HomeComponent {}
