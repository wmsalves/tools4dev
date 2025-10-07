import { Component, signal, computed, inject, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegexTesterService, RegexTestResult } from '@app/core/services/regex-tester.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ToastService } from '@app/shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-regex-tester',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent],
  template: `
    <tool-card
      [title]="'Regex Tester'"
      [subtitle]="'Test and debug your regular expressions in real-time.'"
      [hasActions]="true"
    >
      <div class="regex-layout">
        <!-- Controles da Regex -->
        <div class="regex-controls">
          <div class="field pattern-field">
            <label for="pattern">Regular Expression</label>
            <div class="regex-input-wrapper">
              <span class="delim">/</span>
              <input
                id="pattern"
                type="text"
                class="pattern-input"
                placeholder="your-pattern-here"
                [(ngModel)]="pattern"
              />
              <span class="delim">/</span>
              <div class="flags">
                <label><input type="checkbox" [(ngModel)]="flagG" /> g</label>
                <label><input type="checkbox" [(ngModel)]="flagI" /> i</label>
                <label><input type="checkbox" [(ngModel)]="flagM" /> m</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Texto de Teste -->
        <div class="field">
          <label for="testString">Test String</label>
          <div class="highlight-wrapper">
            <textarea
              id="testString"
              class="editor"
              placeholder="Your text to test against..."
              [(ngModel)]="testString"
              rows="10"
            ></textarea>
            <div class="highlight-overlay" aria-hidden="true" [innerHTML]="highlightedText()"></div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="results-section">
          <div *ngIf="testResult().error" class="err-box">
            Invalid Regex: {{ testResult().error }}
          </div>
          <div *ngIf="!testResult().error">
            <div class="matches-header">
              <h4>
                {{ testResult().matches.length }} Match{{
                  testResult().matches.length === 1 ? '' : 'es'
                }}
              </h4>
            </div>
            <div *ngIf="testResult().matches.length > 0; else noMatches" class="matches-list">
              <div *ngFor="let match of testResult().matches; let i = index" class="match-item">
                <div class="match-header">
                  <strong>Match {{ i + 1 }}</strong> at index {{ match.index }}
                </div>
                <div class="match-content">
                  <pre class="code-box full-match">{{ match.match }}</pre>
                  <div *ngIf="match.groups.length > 0" class="groups-list">
                    <div *ngFor="let group of match.groups; let g = index" class="group-item">
                      <span class="group-index">{{ g + 1 }}:</span>
                      <pre class="code-box group-match">{{ group || 'undefined' }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noMatches>
              <div class="muted" *ngIf="pattern()">No matches found.</div>
            </ng-template>
          </div>
        </div>
      </div>

      <div actions>
        <ui-button (click)="clear()" variant="secondary">Clear</ui-button>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .regex-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .regex-controls {
        background: var(--panel);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--glass);
      }
      .regex-input-wrapper {
        display: flex;
        align-items: center;
        background: #000;
        border-radius: 6px;
        padding: 4px 8px;
        font-family: var(--font-mono);
      }
      .pattern-input {
        flex-grow: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-size: 1rem;
        padding: 8px;
      }
      .delim {
        color: var(--muted);
        font-size: 1.2rem;
      }
      .flags {
        display: flex;
        gap: 16px;
        padding-left: 16px;
        color: var(--muted);
      }
      .flags label {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .highlight-wrapper {
        position: relative;
      }
      .editor,
      .highlight-overlay {
        min-height: 200px;
        resize: vertical;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        line-height: 1.7;
        padding: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .editor {
        position: relative;
        z-index: 1;
        color: transparent;
        background: transparent;
        caret-color: var(--text);
      }
      .highlight-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        background: var(--panel);
        border: 1px solid var(--glass);
        border-radius: 12px;
        color: var(--text);
      }
      .highlight-overlay mark {
        background-color: rgba(46, 242, 123, 0.2);
        color: inherit;
        border-radius: 3px;
      }
      .err-box {
        color: #ffb3b3;
        background: rgba(255, 107, 107, 0.08);
        border: 1px solid rgba(255, 107, 107, 0.24);
        padding: 12px;
        border-radius: 8px;
        font-family: var(--font-mono);
      }
      .matches-header {
        border-bottom: 1px solid var(--glass);
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .matches-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .match-header {
        font-size: 0.9rem;
        color: var(--muted);
        margin-bottom: 8px;
      }
      .match-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .code-box {
        padding: 8px 12px;
        border-radius: 6px;
        white-space: pre-wrap;
        word-break: break-all;
        font-size: 0.85rem;
      }
      .full-match {
        background-color: rgba(46, 242, 123, 0.1);
        color: #a7f3d0;
      }
      .groups-list {
        padding-left: 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .group-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .group-index {
        color: var(--muted);
        font-size: 0.8rem;
      }
      .group-match {
        background-color: rgba(126, 231, 255, 0.1);
        color: #bae6fd;
      }
      .muted {
        color: var(--muted);
      }
    `,
  ],
})
export class RegexTesterComponent {
  private regexService = inject(RegexTesterService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);

  pattern = signal<string>('');
  flagG = signal<boolean>(true);
  flagI = signal<boolean>(false);
  flagM = signal<boolean>(false);
  testString = signal<string>('');

  flags = computed(() => {
    return (this.flagG() ? 'g' : '') + (this.flagI() ? 'i' : '') + (this.flagM() ? 'm' : '');
  });

  testResult = computed(() => {
    return this.regexService.test(this.pattern(), this.flags(), this.testString());
  });

  highlightedText = computed((): SafeHtml => {
    const { matches, error } = this.testResult();
    const text = this.testString();

    if (error || !matches.length) {
      return this.sanitizer.sanitize(SecurityContext.HTML, text) || '';
    }

    let lastIndex = 0;
    let highlighted = '';

    matches.forEach((match) => {
      const sanitizedSegment = this.sanitizer.sanitize(
        SecurityContext.HTML,
        text.substring(lastIndex, match.index)
      );
      const sanitizedMatch = this.sanitizer.sanitize(SecurityContext.HTML, match.match);
      highlighted += `${sanitizedSegment}<mark>${sanitizedMatch}</mark>`;
      lastIndex = match.index + match.match.length;
    });

    const sanitizedTail = this.sanitizer.sanitize(SecurityContext.HTML, text.substring(lastIndex));
    highlighted += sanitizedTail;

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  });

  clear() {
    this.pattern.set('');
    this.testString.set('');
    this.toast.info('Cleared');
  }
}
