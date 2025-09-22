import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label *ngIf="label" [for]="id" class="lbl">{{ label }}</label>
    <input
      class="in"
      [id]="id"
      [name]="name || id"
      [placeholder]="placeholder"
      [type]="type"
      [(ngModel)]="model"
      (ngModelChange)="modelChange?.($event)"
      [attr.autocomplete]="autocomplete ? 'on' : 'off'"
    />
  `,
  styles: [
    `
      @use '../../styles/tokens' as *;

      .lbl {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        color: $color-muted;
      }
      .in {
        width: 100%;
        padding: 10px 12px;
        border-radius: $radius-md;
        border: 1px solid $color-border;
        outline: none;
        background: $color-surface;
        color: $color-text;
      }
      .in:focus {
        border-color: $color-text;
      }
    `,
  ],
})
export class InputComponent {
  @Input() id = '';
  @Input() name?: string;
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: string = 'text';
  @Input() model = '';
  @Input() autocomplete = false;

  // two-way-ish (template friendly)
  @Input() modelChange?: (value: string) => void;
}
