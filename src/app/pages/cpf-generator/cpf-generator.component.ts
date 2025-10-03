import { Component, inject, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpfService } from '@app/core/services/cpf.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { ToastService } from '@app/shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-cpf-generator',
  imports: [CommonModule, ToolCardComponent, ButtonComponent, InputComponent, BadgeComponent],
  template: `
    <tool-card
      title="CPF Generator"
      subtitle="Generate valid CPFs for tests, format or validate an input."
      [hasActions]="true"
    >
      <!-- Seção de Geração -->
      <div class="btn-group">
        <ui-button (click)="gen(true)">Generate (formatted)</ui-button>
        <ui-button (click)="gen(false)" variant="outline">Generate (digits only)</ui-button>
        <ui-button variant="secondary" [disabled]="!result()" (click)="copy()">Copy</ui-button>
      </div>

      <div class="result" *ngIf="result(); else nores">
        <code>{{ result() }}</code>
        <ui-badge variant="success" *ngIf="copied()">Copied!</ui-badge>
      </div>
      <ng-template #nores>
        <div class="result muted">No CPF generated yet.</div>
      </ng-template>

      <div class="hr"></div>

      <!-- Seção de Validação/Formatação -->
      <div class="form-group">
        <div class="field">
          <ui-input
            id="cpf"
            label="Validate / Format"
            placeholder="type/paste here…"
            [(model)]="input"
          ></ui-input>
        </div>
        <div class="form-row">
          <div class="btn-group">
            <ui-button (click)="format()" [disabled]="!input()">Format</ui-button>
            <ui-button (click)="unformat()" variant="ghost" [disabled]="!input()"
              >Unformat</ui-button
            >
            <ui-button (click)="clear()" variant="ghost" [disabled]="!input()">Clear</ui-button>
          </div>
          <ui-badge *ngIf="input()" [variant]="valid() ? 'success' : 'danger'">
            {{ valid() ? 'Valid' : 'Invalid' }}
          </ui-badge>
        </div>
      </div>

      <div actions>
        <small class="muted">Tip: generated CPFs are for testing purposes only.</small>
      </div>
    </tool-card>
  `,
  styles: [
    `
      /* --- Estrutura de Layout do Formulário --- */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 16px; /* Espaçamento vertical entre as linhas */
      }
      .form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center; /* Alinha botões e badge verticalmente */
        gap: 16px; /* Espaçamento horizontal entre os campos */
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Espaço entre label e input */
      }
      .btn-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      .result {
        margin-top: 16px;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      code {
        background: var(--panel);
        color: var(--accent-2);
        padding: 8px 12px;
        border-radius: 8px;
        letter-spacing: 0.5px;
        border: 1px solid var(--glass);
      }
      .muted {
        color: var(--muted);
      }
      .hr {
        height: 1px;
        background: var(--glass);
        margin: 24px 0;
        border: none;
      }
    `,
  ],
})
export class CpfGeneratorComponent {
  private cpf = inject(CpfService);
  private toast = inject(ToastService);

  result: WritableSignal<string> = signal('');
  copied = signal(false);
  input = signal('');
  valid = computed(() => this.cpf.isValid(this.input()));

  gen(formatted: boolean) {
    this.result.set(this.cpf.generate({ formatted }));
    this.copied.set(false);
    this.toast.info('CPF generated');
  }

  async copy() {
    const text = this.result();
    if (!text) return;
    const ok = await copyToClipboard(text);
    this.copied.set(ok);
    ok ? this.toast.success('Copied to clipboard') : this.toast.error('Failed to copy');
  }

  format() {
    this.input.set(this.cpf.format(this.input()));
    this.toast.info('Formatted');
  }

  unformat() {
    this.input.set(this.cpf.unformat(this.input()));
    this.toast.info('Unformatted');
  }

  clear() {
    this.input.set('');
    this.copied.set(false);
    this.toast.info('Cleared');
  }
}
