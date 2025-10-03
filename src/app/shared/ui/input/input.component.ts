import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <label *ngIf="label" [for]="id" class="lbl">{{ label }}</label>
    <input
      class="in"
      [id]="id"
      [name]="name || id"
      [placeholder]="placeholder"
      [type]="type"
      [ngModel]="model"
      (ngModelChange)="modelChange.emit($event)"
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
      }
      .in {
        width: 100%;
        padding: 10px 12px;
        border-radius: $radius-md;
        outline: none;
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
  @Input() autocomplete = false;

  @Input() model = '';
  @Output() modelChange = new EventEmitter<string>();
}
