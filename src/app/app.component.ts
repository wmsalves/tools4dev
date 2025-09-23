import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/ui/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent],
  template: `
    <header class="topbar">
      <div class="brand">🛠️ Tools4Dev</div>
      <nav class="nav">
        <a routerLink="" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/cpf-generator" routerLinkActive="active">CPF Generator</a>
        <a routerLink="/qr-code" routerLinkActive="active">QR Code</a>
        <a routerLink="/url-shortener" routerLinkActive="active">URL Shortener</a>
      </nav>
    </header>

    <div class="layout">
      <app-sidebar></app-sidebar>

      <main class="content container">
        <router-outlet />
      </main>
    </div>

    <footer class="footer">
      <small>© {{ year }} Tools4Dev</small>
    </footer>
  `,
  styles: [`
    .topbar {
      position: sticky; top: 0; z-index: 10;
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: #111827; color: #fff; border-bottom: 1px solid #2d3340;
    }
    .brand { font-weight: 700; letter-spacing: .3px; }
    .nav a { color: #cbd5e1; margin-left: 16px; text-decoration: none; font-weight: 500; }
    .nav a.active { color: #ffffff; text-decoration: underline; }

    .layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 0;
      min-height: calc(100dvh - 58px - 64px);
    }

    .container {
      max-width: 960px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .content { padding-top: 16px; padding-bottom: 16px; }

    .footer { text-align: center; padding: 24px 0; color: #6b7280; }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
    }
  `],
})
export class AppComponent {
  year = new Date().getFullYear();
}
