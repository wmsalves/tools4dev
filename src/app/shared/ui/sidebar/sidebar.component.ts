import { Component, computed, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type ToolItem = { name: string; path: string; disabled?: boolean };
type ToolCategory = { name: string; tools: ToolItem[] };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive],
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
      :host {
        display: block;
      }

      .sb {
        position: sticky;
        top: 58px;
        display: flex;
        flex-direction: column;
        width: 280px;
        min-width: 240px;
        max-height: calc(100dvh - 58px);
        background: var(--panel);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 30px rgba(2, 6, 23, 0.4);
      }

      /* search */
      .sb-search {
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        outline: none;
        background: rgba(0, 0, 0, 0.25);
        color: var(--text);
      }
      .input-wrap input::placeholder {
        color: var(--muted);
      }
      .input-wrap input:focus {
        border-color: rgba(46, 242, 123, 0.25);
        box-shadow: 0 0 0 3px rgba(46, 242, 123, 0.08);
      }

      /* nav */
      .sb-nav {
        padding: 8px 8px 12px 8px;
        overflow: auto;
      }
      .sb-nav::-webkit-scrollbar {
        width: 10px;
      }
      .sb-nav::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.06);
        border-radius: 8px;
      }
      .sb-nav::-webkit-scrollbar-track {
        background: transparent;
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
        color: var(--muted);
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
        color: var(--text);
        border: 1px solid transparent;
        background: transparent;
        transition: background 0.12s ease, border-color 0.12s ease, transform 0.06s ease;
      }
      .tool:hover {
        background: rgba(46, 242, 123, 0.06);
        border-color: rgba(46, 242, 123, 0.12);
        transform: translateX(2px);
      }
      .tool.active {
        background: rgba(46, 242, 123, 0.12);
        border-color: rgba(46, 242, 123, 0.24);
      }
      .tool.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.15);
      }
      .dot.go {
        background: rgba(46, 242, 123, 0.6);
      }
      .label {
        font-size: 14px;
      }

      .sb-ft {
        margin-top: auto;
        padding: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.15);
      }
      .ghost {
        appearance: none;
        border: 1px dashed rgba(255, 255, 255, 0.06);
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        color: var(--muted);
        padding: 8px 10px;
        border-radius: 10px;
      }
      .ghost:hover {
        color: var(--text);
        border-color: rgba(46, 242, 123, 0.25);
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
      .map((cat) => ({ ...cat, tools: cat.tools.filter((t) => t.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.tools.length > 0);
  });

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  noop() {}
}
