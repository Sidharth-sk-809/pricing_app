import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdditionalChargeItem } from '../../models/pricing.model';
import { PricingStore } from '../../store/pricing.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-additional-charges',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="charges-list">
      @for (charge of charges; let chargeIndex = $index; let last = $last; track chargeIndex) {
        <div class="charge-item" [class.no-border]="last">
          <div class="charge-title">{{ charge.name | titlecase }}</div>
          
          <div class="charge-fields">
            @switch (charge.type) {
              
              @case ('fixed') {
                <div class="field-group">
                  <label>Price <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="custom-input" 
                    [value]="charge.price" 
                    (input)="onFixedPriceChange(chargeIndex, $event)">
                </div>
              }
              
              @case ('percentage') {
                <div class="field-group">
                  <label>Percentage <span class="text-danger">*</span></label>
                  <input 
                    [type]="typeof charge.percentage === 'number' ? 'number' : 'text'"
                    class="custom-input" 
                    [value]="charge.percentage" 
                    (input)="onPercentageChange(chargeIndex, $event)">
                </div>
              }
              
              @case ('tiered-size') {
                <div class="field-group">
                  <label>Sizes <span class="text-danger">*</span></label>
                  <div class="table-scroll">
                    <table>
                      <tr>
                        @for (p of charge.size_tier; let i = $index; track i) {
                          <td>
                            <div class="col-head">{{ p }}</div>
                            <input 
                              [type]="isStringValue(getTierValue(charge, i)) ? 'text' : 'number'"
                              class="custom-input compact" 
                              [value]="getTierValue(charge, i)" 
                              (input)="onTierValueChange(chargeIndex, i, $event)">
                          </td>
                        }
                      </tr>
                    </table>
                  </div>
                </div>
              }
              
              @case ('overcharge') {
                <div class="field-group">
                  <label>Price (Over {{charge.over}}) <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="custom-input" 
                    [value]="charge.price" 
                    (input)="onOverchargeChange(chargeIndex, $event)">
                </div>
              }

            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .charges-list { font-family: 'Segoe UI', sans-serif; }
    .charge-item { padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
    .no-border { border-bottom: none; }
    .charge-title { font-weight: bold; color: #333; margin-bottom: 15px; font-size: 14px; }
    .field-group { max-width: 250px; margin-bottom: 10px; }
    .field-group label { display: block; font-size: 13px; color: #333; margin-bottom: 8px; }
    .custom-input { width: 100%; padding: 8px 10px; border: 1px solid #e8eaed; border-radius: 4px; background: #fafafa; color: #333; font-size: 13px; }
    .text-danger { color: #d32f2f; }
    .table-scroll { overflow-x: auto; max-width: 600px; }
    table { border-spacing: 15px 0; border-collapse: separate; margin-left: -15px;}
    .col-head { font-size: 12px; color: #333; margin-bottom: 6px; }
    .compact { width: 65px; text-align: left; }
  `]
})
export class AdditionalChargesComponent implements OnInit {
  @Input() charges: AdditionalChargeItem[] = [];

  private store = inject(PricingStore);

  ngOnInit() {
    this.store.setCharges(this.charges);
  }

  trackByName(index: number, item: any): string {
    return item.name;
  }
  
  trackByIndex(index: number, item: any): number {
    return index;
  }

  getTierValue(charge: any, index: number): string | number {
    if (charge.price && Array.isArray(charge.price)) return charge.price[index];
    if (charge.percentage && Array.isArray(charge.percentage)) return charge.percentage[index];
    return '';
  }

  isStringValue(value: any): boolean {
    return typeof value === 'string' && value !== '';
  }

  onFixedPriceChange(chargeIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.store.updateCharge(chargeIndex, { price: value } as any);
  }

  onPercentageChange(chargeIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const numValue = value === 'quote' ? 'quote' : parseFloat(value);
    this.store.updateCharge(chargeIndex, { percentage: numValue } as any);
  }

  onTierValueChange(chargeIndex: number, tierIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const numValue = value === 'quote' ? 'quote' : parseFloat(value) || 0;
    this.store.updateChargeValue(chargeIndex, tierIndex, numValue as any);
  }

  onOverchargeChange(chargeIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.store.updateCharge(chargeIndex, { price: value } as any);
  }
}
