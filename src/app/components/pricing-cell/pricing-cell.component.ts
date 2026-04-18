import { Component, Input, Output, EventEmitter, OnInit, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { PriceValue } from '../../models/pricing.model';

@Component({
  selector: 'app-pricing-cell',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="cell-container">
      <input 
        [type]="isTextEnabled() ? 'text' : 'number'"
        [formControl]="control"
        [disabled]="isDisabled()"
        class="cell-input"
        [class.special]="isDisabled()"
        [class.error]="control.invalid && control.touched"
      />
      @if (control.invalid && control.touched) {
        <span class="error-msg">Invalid value</span>
      }
    </div>
  `,
  styles: [`
    .cell-container {
      position: relative;
    }
    .cell-input {
      width: 100%;
      min-width: 60px;
      padding: 6px 10px;
      border: 1px solid #e8eaed;
      border-radius: 4px;
      background-color: #fafafa;
      box-sizing: border-box;
      color: #333;
      font-size: 13px;
    }
    .cell-input:focus {
      outline: none;
      background-color: #fff;
      border-color: #ccc;
    }
    .special {
      background-color: #edf2f7;
      color: #a0aec0;
      cursor: not-allowed;
    }
    .error {
      border-color: #d32f2f;
    }
    .error-msg {
      display: block;
      font-size: 11px;
      color: #d32f2f;
      margin-top: 2px;
    }
  `]
})
export class PricingCellComponent implements OnInit {
  @Input() value!: PriceValue;
  @Output() valueChange = new EventEmitter<PriceValue>();

  control = new FormControl<string | number>(0, { 
    validators: (control: AbstractControl): ValidationErrors | null => this.priceValidator(control),
    nonNullable: true 
  });

  ngOnInit() {
    this.control.setValue(this.value as string | number);
    
    // Emit value changes using effect
    effect(() => {
      const val = this.control.value;
      if (this.control.valid && val !== null) {
        this.emitValue(val);
      }
    });
  }

  isDisabled(): boolean {
    return this.value === 'dropout' || this.value === 'n/a';
  }

  isTextEnabled(): boolean {
    return this.value === 'quote' || typeof this.value === 'string';
  }

  private emitValue(val: string | number) {
    if (this.value === 'quote') {
      this.valueChange.emit((val || 'quote') as PriceValue);
      return;
    }

    if (typeof val === 'string' && val === '') {
      this.valueChange.emit(0);
      return;
    }

    const parsed = typeof val === 'string' ? parseFloat(val) : val;
    if (!isNaN(parsed)) {
      this.valueChange.emit(parsed);
    }
  }

  private priceValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (val === null || val === '') return null;
    
    if (typeof val === 'string') {
      if (val === 'quote') return null;
      const num = parseFloat(val);
      return isNaN(num) ? { invalidPrice: true } : null;
    }
    
    return typeof val === 'number' ? null : { invalidPrice: true };
  }
}
