import { Component, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type ToolItem = { name: string; path: string; disabled?: boolean };
type ToolCategory = { name: string; tools: ToolItem[] };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  template: `
    <aside class="sb">
      <!-- Search -->
      <div class="sb-search">
        <div class="input-wrap">
          <span class="icon">🔎</span>
          <input
            type="text"
            placeholder="Search tools…"
            [value]="query()"
            (input)="onSearch($event)"
          />
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sb-nav">
        <div class="cat" *ngFor="let category of filtered()">
          <div class="cat-hd">{{ category.name }}</div>

          <div class="cat-tools">
            <a
              *ngFor="let t of category.tools"
              class="tool"
              [class.disabled]="t.disabled"
              [routerLink]="t.disabled ? null : t.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              [attr.aria-disabled]="t.disabled ? 'true' : null"
              (click)="$event.stopPropagation()"
            >
              <span class="dot" [class.go]="!t.disabled"></span>
              <span class="label">{{ t.name }}</span>
            </a>
          </div>
        </div>
      </nav>

      <div class="sb-ft">
        <button class="ghost" type="button" title="Settings" (click)="noop()">⚙️ Settings</button>
      </div>
    </aside>
  `,
  styles: [
    `
      .sb {
        position: sticky;
        top: 58px;
        display: flex;
        flex-direction: column;
        width: 280px;
        min-width: 240px;
        max-height: calc(100dvh - 58px);
        border-right: 1px solid #e5e7eb;
        background: #fafafa;
      }

      .sb-search {
        padding: 12px;
        border-bottom: 1px solid #e5e7eb;
      }
      .input-wrap {
        position: relative;
      }
      .input-wrap .icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.6;
      }
      .input-wrap input {
        width: 100%;
        padding: 10px 12px 10px 30px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        outline: none;
        background: #fff;
      }
      .input-wrap input:focus {
        border-color: #0f172a;
      }

      .sb-nav {
        padding: 8px 8px 12px 8px;
        overflow: auto;
      }
      .cat {
        padding: 8px;
        border-radius: 10px;
      }
      .cat + .cat {
        margin-top: 8px;
      }
      .cat-hd {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 4px;
        font-size: 12px;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .cat-tools {
        display: grid;
        gap: 4px;
        margin-left: 8px;
      }
      .tool {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 10px;
        text-decoration: none;
        color: #0f172a;
      }
      .tool:hover {
        background: #eef2ff;
      }
      .tool.active {
        background: #e0e7ff;
      }
      .tool.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #cbd5e1;
      }
      .dot.go {
        background: #94a3b8;
      }
      .label {
        font-size: 14px;
      }

      .sb-ft {
        margin-top: auto;
        padding: 12px;
        border-top: 1px solid #e5e7eb;
      }
      .ghost {
        appearance: none;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        color: #64748b;
        padding: 8px 10px;
        border-radius: 10px;
      }
      .ghost:hover {
        background: #eef2ff;
        color: #334155;
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly categories: ToolCategory[] = [
    {
      name: 'Generators',
      tools: [
        { name: 'CPF Generator', path: '/cpf-generator' },
        { name: 'QR Code Generator', path: '/qr-code' },
        { name: 'UUID Generator', path: '/uuid' },
        { name: 'Password Generator', path: '/password', disabled: true },
      ],
    },
    {
      name: 'Utilities',
      tools: [
        { name: 'URL Shortener', path: '/url-shortener' },
        { name: 'Timestamp Converter', path: '/timestamp', disabled: true },
        { name: 'Regex Tester', path: '/regex', disabled: true },
      ],
    },
    {
      name: 'Formatting',
      tools: [
        { name: 'JSON Formatter', path: '/json', disabled: true },
        { name: 'Text Diff Checker', path: '/diff', disabled: true },
      ],
    },
  ];

  query = signal<string>('');

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter((t) => t.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.tools.length > 0);
  });

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  noop() {}
}
