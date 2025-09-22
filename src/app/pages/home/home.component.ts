import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, ToolCardComponent],
  template: `
    <h1>Welcome 👋</h1>
    <p>Pick a tool to get started:</p>

    <section class="grid">
      <a routerLink="/cpf-generator" class="card-link">
        <tool-card
          title="CPF Generator"
          subtitle="Create valid Brazilian CPF numbers for testing."
        ></tool-card>
      </a>

      <a routerLink="/qr-code" class="card-link disabled">
        <tool-card title="QR Code" subtitle="Generate QR codes from any text or URL."></tool-card>
      </a>

      <a routerLink="/url-shortener" class="card-link disabled">
        <tool-card title="URL Shortener" subtitle="Shorten long URLs for sharing."></tool-card>
      </a>
    </section>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        margin-top: 16px;
      }
      .card-link {
        text-decoration: none;
        color: inherit;
      }
      .card-link.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    `,
  ],
})
export class HomeComponent {}
