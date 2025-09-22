import { Component, inject, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpfService } from '@app/core/services/cpf.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';

@Component({
  standalone: true,
  selector: 'app-cpf-generator',
  imports: [CommonModule, ToolCardComponent, ButtonComponent, InputComponent, BadgeComponent],
  providers: [CpfService],
  template: `
    <tool-card
      title="CPF Generator"
      subtitle="Generate valid CPFs for tests, format or validate an input."
      [hasActions]="true"
    >
      <div class="row">
        <ui-button (click)="gen(true)">Generate (formatted)</ui-button>
        <ui-button (click)="gen(false)" variant="outline">Generate (digits only)</ui-button>
        <ui-button [disabled]="!result()" (click)="copy()">Copy</ui-button>
      </div>

      <div class="result" *ngIf="result(); else nores">
        <code>{{ result() }}</code>
        <ui-badge variant="success" *ngIf="copied()">Copied!</ui-badge>
      </div>
      <ng-template #nores>
        <div class="result muted">No CPF generated yet.</div>
      </ng-template>

      <div class="hr"></div>

      <div>
        <ui-input
          id="cpf"
          label="Validate / Format"
          placeholder="type/paste here…"
          [model]="input()"
          [modelChange]="onInputChange"
        ></ui-input>
      </div>

      <div class="row">
        <ui-button (click)="format()">Format</ui-button>
        <ui-button (click)="unformat()" variant="ghost">Unformat</ui-button>
        <ui-button (click)="clear()" variant="ghost">Clear</ui-button>
        <ui-badge [variant]="valid() ? 'success' : 'danger'">
          {{ valid() ? 'Valid' : 'Invalid' }}
        </ui-badge>
      </div>

      <div actions>
        <small class="muted">Tip: generated CPFs are for testing purposes only.</small>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .muted {
        color: #6b7280;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .result {
        margin-top: 4px;
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
      .hr {
        height: 1px;
        background: #e5e7eb;
        margin: 8px 0;
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

  onInputChange = (v: string) => this.input.set(v);

  gen(formatted: boolean) {
    this.result.set(this.cpf.generate({ formatted }));
    this.copied.set(false);
  }

  async copy() {
    const text = this.result();
    if (!text) return;
    const ok = await copyToClipboard(text);
    this.copied.set(ok);
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
