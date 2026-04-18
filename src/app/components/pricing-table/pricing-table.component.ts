import { Component, inject } from '@angular/core';
import { PricingStore } from '../../store/pricing.store';
import { PricingCellComponent } from '../pricing-cell/pricing-cell.component';
import { PriceValue } from '../../models/pricing.model';

@Component({
  selector: 'app-pricing-table',
  standalone: true,
  imports: [PricingCellComponent],
  template: `
    @if (store.pricing()) {
      <div class="pricing-container">
        
        <div class="toolbar">
          <button class="add-col-btn" (click)="addColumn()">+ Add Column</button>
        </div>

        <div class="table-scroll">
          <table class="grid-table">
            <thead>
              <tr>
                @if (store.rows().length > 1) {
                  <th></th>
                }
                @for (col of store.columns(); let c = $index; track c) {
                  <th>
                    <div class="col-header-box">
                      <span class="remove-icon" (click)="removeColumn(c)">✖</span>
                      <input type="number" class="mock-input-header" [value]="col" readonly>
                    </div>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of store.rows(); let r = $index; track r) {
                <tr>
                  @if (store.rows().length > 1) {
                    <td class="row-label">{{ row.label }}</td>
                  }
                  @for (val of row.values; let c = $index; track c) {
                    <td>
                      <div class="cell-wrapper">
                        <div class="cell-label">Price</div>
                        <app-pricing-cell 
                          [value]="val" 
                          (valueChange)="onCellUpdate(r, c, $event)">
                        </app-pricing-cell>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="discount-container">
          <label class="discount-label">Discount <span class="text-danger">*</span></label>
          <input type="number" class="discount-input" [value]="store.pricing()!.discount" readonly>
        </div>

      </div>
    }
  `,
  styles: [`
    .pricing-container { font-family: 'Segoe UI', sans-serif; }
    .toolbar { margin-bottom: 20px; }
    .add-col-btn { background-color: #6bc3de; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; }
    .add-col-btn:hover { background-color: #5ab2cd; }
    .table-scroll { overflow-x: auto; background: #f4f6fa; padding: 20px; border-radius: 4px; margin-bottom: 25px; }
    .grid-table { border-collapse: separate; border-spacing: 15px 0; }
    .grid-table th { font-weight: normal; padding-bottom: 5px; }
    .col-header-box { display: flex; flex-direction: column; align-items: center; }
    .remove-icon { font-size: 12px; color: #333; cursor: pointer; margin-bottom: 6px; font-weight: bold; }
    .mock-input-header { width: 65px; padding: 6px 10px; border: 1px solid #e8eaed; border-radius: 4px; background: #fafafa; text-align: left; color: #555; font-size: 13px; pointer-events: none; }
    .grid-table td { vertical-align: top; padding-bottom: 15px; }
    .row-label { font-size: 13px; font-weight: bold; color: #333; padding-top: 28px; text-transform: uppercase; padding-right: 20px; }
    .cell-wrapper { display: flex; flex-direction: column; }
    .cell-label { font-size: 12px; color: #333; margin-bottom: 6px; }
    .discount-container { max-width: 250px; }
    .discount-label { display: block; font-size: 13px; color: #333; margin-bottom: 8px; }
    .text-danger { color: #d32f2f; }
    .discount-input { width: 100%; padding: 8px 10px; border: 1px solid #e8eaed; border-radius: 4px; background: #fafafa; color: #333; font-size: 13px; }
  `]
})
export class PricingTableComponent {
  store = inject(PricingStore);

  trackByIndex(index: number, item: any): number {
    return index;
  }
  
  trackByRowLabel(index: number, item: any): string {
    return item.label;
  }

  onCellUpdate(rowIndex: number, colIndex: number, newValue: PriceValue) {
    this.store.updateCell(rowIndex, colIndex, newValue);
  }

  addColumn() {
    const cols = this.store.columns();
    const newTier = cols.length > 0 ? cols[cols.length-1] + 10 : 1;
    this.store.addColumn(newTier, 0); 
  }

  removeColumn(colIndex: number) {
    this.store.removeColumn(colIndex);
  }
}
