import { Component, computed, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type ToolItem = { name: string; path: string; disabled?: boolean };
type ToolCategory = { name: string; tools: ToolItem[] };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive],
  template: `
    <aside class="sb">
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
            >
              <span class="dot" [class.go]="!t.disabled"></span>
              <span class="label">{{ t.name }}</span>
            </a>
          </div>
        </div>
      </nav>

      <div class="sb-ft">
        <a
          href="https://github.com/wmsalves/tools4dev"
          class="ghost"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.07 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
            />
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sb {
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        width: 280px;
        min-width: 240px;
        max-height: 100dvh;
        background: var(--panel);
        border-right: 1px solid var(--glass);
      }
      .sb-search {
        padding: 12px;
        border-bottom: 1px solid var(--glass);
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
        pointer-events: none;
      }
      .input-wrap input {
        width: 100%;
        padding: 10px 12px 10px 34px;
        border: 1px solid var(--glass);
        border-radius: 12px;
        outline: none;
        background: rgba(0, 0, 0, 0.25);
        color: var(--text);
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      .input-wrap input::placeholder {
        color: var(--muted);
      }
      .input-wrap input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(46, 242, 123, 0.1);
      }
      .sb-nav {
        padding: 8px;
        overflow-y: auto;
        flex-grow: 1;
      }
      .cat {
        padding: 8px 0;
      }
      .cat + .cat {
        border-top: 1px solid var(--glass);
        margin-top: 8px;
      }
      .cat-hd {
        margin: 8px 12px;
        font-size: 12px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }
      .cat-tools {
        display: grid;
        gap: 4px;
      }
      .tool {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 10px;
        text-decoration: none;
        color: var(--muted);
        border-left: 3px solid transparent;
        transition: all 0.15s ease;
      }
      .tool:hover {
        background: rgba(126, 231, 255, 0.06);
        color: var(--accent-2);
      }
      .tool.active {
        color: var(--accent);
        background: rgba(46, 242, 123, 0.08);
        border-left-color: var(--accent);
      }
      .tool.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.15);
      }
      .dot.go {
        background: rgba(126, 231, 255, 0.4);
      }
      .tool.active .dot.go {
        background: var(--accent);
      }
      .label {
        font-size: 14px;
        font-weight: 500;
      }
      .sb-ft {
        margin-top: auto;
        padding: 12px;
        border-top: 1px solid var(--glass);
        background: rgba(0, 0, 0, 0.15);
      }
      .ghost {
        appearance: none;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        color: var(--muted);
        padding: 8px 10px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        width: 100%;
        transition: color 0.15s ease, background 0.15s ease;
      }
      .ghost:hover {
        color: var(--text);
        background: rgba(255, 255, 255, 0.04);
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
        { name: 'Password Generator', path: '/password' },
      ],
    },
    {
      name: 'Utilities',
      tools: [
        { name: 'URL Shortener', path: '/url-shortener' },
        { name: 'Timestamp Converter', path: '/timestamp' },
        { name: 'Regex Tester', path: '/regex', disabled: true },
      ],
    },
    {
      name: 'Formatting',
      tools: [
        { name: 'JSON Formatter', path: '/json-formatter' },
        { name: 'Text Diff Checker', path: '/diff', disabled: true },
      ],
    },
  ];

  query = signal<string>('');

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories
      .map((cat) => ({ ...cat, tools: cat.tools.filter((t) => t.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.tools.length > 0);
  });

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }
}
