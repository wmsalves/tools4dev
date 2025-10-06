import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DiffCheckerService,
  DiffSegment,
  DIFF_INSERT,
  DIFF_DELETE,
  DIFF_EQUAL,
} from '@app/core/services/diff-checker.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ToastService } from '@app/shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-diff-checker',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent],
  template: `
    <tool-card
      [title]="'Text Diff Checker'"
      [subtitle]="'Paste two blocks of text to see the differences between them.'"
      [hasActions]="true"
    >
      <div class="diff-layout">
        <!-- Coluna de Entrada 1 -->
        <div class="editor-pane">
          <label for="text1">Original Text</label>
          <textarea
            id="text1"
            class="editor"
            placeholder="Paste the first text here..."
            [(ngModel)]="text1"
            rows="10"
          ></textarea>
        </div>

        <!-- Coluna de Entrada 2 -->
        <div class="editor-pane">
          <label for="text2">Modified Text</label>
          <textarea
            id="text2"
            class="editor"
            placeholder="Paste the second text here..."
            [(ngModel)]="text2"
            rows="10"
          ></textarea>
        </div>
      </div>

      <!-- Área de Resultado -->
      <div *ngIf="text1() || text2()">
        <h3>Result</h3>
        <div class="result-box">
          <ng-container *ngFor="let segment of diffResult()">
            <del *ngIf="segment[0] === DIFF_DELETE">{{ segment[1] }}</del>
            <ins *ngIf="segment[0] === DIFF_INSERT">{{ segment[1] }}</ins>
            <span *ngIf="segment[0] === DIFF_EQUAL">{{ segment[1] }}</span>
          </ng-container>
        </div>
      </div>

      <div actions>
        <div class="btn-group">
          <ui-button (click)="clear()" variant="secondary">Clear</ui-button>
        </div>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .diff-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }
      @media (min-width: 768px) {
        .diff-layout {
          grid-template-columns: 1fr 1fr;
        }
      }
      .editor-pane {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
      }
      .editor {
        width: 100%;
        height: 100%;
        min-height: 200px;
        resize: vertical;
        font-family: var(--font-mono);
        font-size: 0.9rem;
      }
      h3 {
        margin-bottom: 8px;
        color: var(--muted);
      }
      .result-box {
        background: var(--panel);
        border: 1px solid var(--glass);
        padding: 16px;
        border-radius: 8px;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        line-height: 1.7;
      }
      .result-box del {
        background-color: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
        text-decoration: none;
      }
      .result-box ins {
        background-color: rgba(34, 197, 94, 0.15);
        color: #86efac;
        text-decoration: none;
      }
      .btn-group {
        display: flex;
        gap: 12px;
      }
    `,
  ],
})
export class DiffCheckerComponent {
  private diffService = inject(DiffCheckerService);
  private toast = inject(ToastService);

  DIFF_DELETE = DIFF_DELETE;
  DIFF_INSERT = DIFF_INSERT;
  DIFF_EQUAL = DIFF_EQUAL;

  text1 = signal<string>('');
  text2 = signal<string>('');

  diffResult = computed(() => {
    return this.diffService.compare(this.text1(), this.text2());
  });

  clear() {
    this.text1.set('');
    this.text2.set('');
    this.toast.info('Cleared');
  }
}
