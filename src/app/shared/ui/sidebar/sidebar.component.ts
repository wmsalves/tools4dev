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
            >
              <span class="label">{{ t.name }}</span>
            </a>
          </div>
        </div>
      </nav>

      <div class="sb-ft">
        <a
          href="https://github.com/wmsalves/tools4dev"
          target="_blank"
          class="ghost"
          title="View on GitHub"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            ></path>
          </svg>
          <span>View on GitHub</span>
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

      /* --- Search --- */
      .sb-search {
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .input-wrap {
        position: relative;
      }
      .input-wrap .icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.6;
        pointer-events: none;
      }
      .input-wrap input {
        width: 100%;
        padding: 10px 12px 10px 36px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        outline: none;
        background: rgba(0, 0, 0, 0.25);
        color: var(--text);
        font-size: 14px;
      }
      .input-wrap input::placeholder {
        color: var(--muted);
      }
      .input-wrap input:focus {
        border-color: rgba(126, 231, 255, 0.4);
        box-shadow: 0 0 0 3px rgba(126, 231, 255, 0.1);
      }

      /* --- Navigation --- */
      .sb-nav {
        padding: 8px;
        overflow-y: auto;
        flex-grow: 1;
      }
      /* Custom Scrollbar */
      .sb-nav::-webkit-scrollbar {
        width: 10px;
      }
      .sb-nav::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 8px;
      }

      .cat-hd {
        padding: 12px 8px 4px;
        font-size: 12px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .tool {
        position: relative; /* For the active indicator */
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border-radius: 10px;
        text-decoration: none;
        color: var(--muted);
        font-weight: 500;
        font-size: 14px;
        transition: all 0.15s ease-out;
      }
      .tool:hover:not(.disabled) {
        color: var(--text);
        background: rgba(126, 231, 255, 0.06); /* Accent-2 subtle hover */
        transform: translateX(3px);
      }
      .tool.active {
        color: var(--accent);
        font-weight: 700;
        background: rgba(46, 242, 123, 0.08); /* Accent-1 active background */
      }
      /* --- Active Link Indicator --- */
      .tool.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 60%;
        width: 4px;
        background: var(--accent);
        border-radius: 0 4px 4px 0;
      }
      .tool.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* --- Footer --- */
      .sb-ft {
        margin-top: auto;
        padding: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.15);
      }
      .ghost {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        border: 1px dashed rgba(255, 255, 255, 0.08);
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        color: var(--muted);
        padding: 8px 10px;
        border-radius: 10px;
        text-decoration: none;
        transition: all 0.15s ease-out;
      }
      .ghost:hover {
        color: var(--text);
        border-color: var(--accent-2);
        background: rgba(126, 231, 255, 0.05);
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
}
