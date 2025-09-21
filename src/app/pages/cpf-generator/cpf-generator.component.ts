import { Component, inject, signal, computed, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CpfService } from '../../core/services/cpf.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-cpf-generator',
  imports: [CommonModule, FormsModule],
  providers: [CpfService],
  template: `
    <h1>CPF Generator</h1>
    <p class="muted">
      Generate valid CPFs for tests, format or validate an input, and copy to clipboard.
    </p>

    <section class="panel">
      <div class="row">
        <button type="button" (click)="gen(true)">Generate (formatted)</button>
        <button type="button" (click)="gen(false)">Generate (digits only)</button>
        <button type="button" [disabled]="!result()" (click)="copy()">Copy</button>
      </div>

      <div class="result" *ngIf="result(); else nores">
        <code>{{ result() }}</code>
        <span class="ok" *ngIf="copied()">Copied!</span>
      </div>
      <ng-template #nores>
        <div class="result muted">No CPF generated yet.</div>
      </ng-template>
    </section>

    <section class="panel">
      <h2>Validate / Format</h2>
      <div class="field">
        <label for="cpf">CPF</label>
        <input
          id="cpf"
          name="cpf"
          [ngModel]="input()"
          (ngModelChange)="input.set($event)"
          placeholder="type/paste here…"
        />
      </div>
      <div class="row">
        <button type="button" (click)="format()">Format</button>
        <button type="button" (click)="unformat()">Unformat</button>
        <button type="button" (click)="clear()">Clear</button>
        <span class="badge" [class.bad]="!valid()" [class.good]="valid()">
          {{ valid() ? 'Valid' : 'Invalid' }}
        </span>
      </div>
    </section>
  `,
  styles: [
    `
      .muted {
        color: #6b7280;
      }
      .panel {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      button {
        appearance: none;
        border: 1px solid #111827;
        background: #111827;
        color: #fff;
        padding: 8px 12px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .result {
        margin-top: 12px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      code {
        background: #0b1220;
        color: #e5e7eb;
        padding: 6px 10px;
        border-radius: 8px;
      }
      .ok {
        color: #16a34a;
        font-weight: 600;
      }
      .field {
        display: grid;
        gap: 6px;
        margin: 12px 0;
      }
      input {
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #d1d5db;
        outline: none;
      }
      input:focus {
        border-color: #111827;
      }
      .badge {
        display: inline-block;
        border-radius: 999px;
        padding: 6px 10px;
        font-weight: 700;
        font-size: 12px;
        border: 1px solid #e5e7eb;
        background: #f3f4f6;
        color: #111827;
      }
      .badge.good {
        border-color: #16a34a;
        background: #ecfdf5;
        color: #166534;
      }
      .badge.bad {
        border-color: #dc2626;
        background: #fef2f2;
        color: #7f1d1d;
      }
    `,
  ],
})
export class CpfGeneratorComponent {
  private cpf = inject(CpfService);

  result: WritableSignal<string> = signal('');
  copied = signal(false);

  input = signal('');

  valid = computed(() => this.cpf.isValid(this.input()));

  gen(formatted: boolean) {
    this.result.set(this.cpf.generate({ formatted }));
    this.copied.set(false);
  }

  copy() {
    const text = this.result();
    if (!text) return;
    navigator.clipboard
      ?.writeText(text)
      .then(() => this.copied.set(true))
      .catch(() => this.copied.set(false));
  }

  format() {
    this.input.set(this.cpf.format(this.input()));
  }

  unformat() {
    this.input.set(this.cpf.unformat(this.input()));
  }

  clear() {
    this.input.set('');
  }
}
