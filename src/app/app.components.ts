import { Component, inject, OnInit } from '@angular/core';
import { PricingStore } from './store/pricing.store';
import { toPricingTable, toAdditionalCharges } from './adapters/pricing.adapter';
import RAW_DATA from './pricing.json';
import { PricingTableComponent } from './components/pricing-table/pricing-table.component';
import { AdditionalChargesComponent } from './components/additional-charges/additional-charges.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PricingTableComponent, AdditionalChargesComponent],
  template: `
    <div class="app-container">
      
      <!-- DEFAULT PANEL -->
      <div class="accordion-panel" [class.open]="openPanels.default">
        <div class="accordion-header" (click)="togglePanel('default')">
          <span>DEFAULT</span>
          <span class="icon">{{ openPanels.default ? '-' : '+' }}</span>
        </div>
        @if (openPanels.default) {
          <div class="accordion-body">
            @if (currentTab === 'default') {
              <app-pricing-table></app-pricing-table>
            }
          </div>
        }
      </div>

      <!-- INSERTS PANEL -->
      <div class="accordion-panel" [class.open]="openPanels.inserts">
        <div class="accordion-header" (click)="togglePanel('inserts')">
          <span>INSERTS</span>
          <span class="icon">{{ openPanels.inserts ? '-' : '+' }}</span>
        </div>
        @if (openPanels.inserts) {
          <div class="accordion-body">
            @if (currentTab === 'inserts') {
              <app-pricing-table></app-pricing-table>
            }
          </div>
        }
      </div>

      <!-- FR PANEL -->
      <div class="accordion-panel" [class.open]="openPanels.fr">
        <div class="accordion-header" (click)="togglePanel('fr')">
          <span>FR</span>
          <span class="icon">{{ openPanels.fr ? '-' : '+' }}</span>
        </div>
        @if (openPanels.fr) {
          <div class="accordion-body">
            @if (currentTab === 'fr') {
              <app-pricing-table></app-pricing-table>
            }
          </div>
        }
      </div>

      <!-- ADDITIONAL CHARGE PANEL -->
      <div class="accordion-panel" [class.open]="openPanels.additional">
        <div class="accordion-header" (click)="togglePanel('additional')">
          <span>ADDITIONAL CHARGE</span>
          <span class="icon">{{ openPanels.additional ? '-' : '+' }}</span>
        </div>
        @if (openPanels.additional) {
          <div class="accordion-body">
            @if (currentTab === 'additional') {
              <app-additional-charges [charges]="store.charges()"></app-additional-charges>
            }
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .app-container {
      margin: 20px auto;
      max-width: 1000px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .accordion-panel {
      margin-bottom: 8px;
    }
    .accordion-header {
      background-color: #2c3e63;
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      letter-spacing: 0.5px;
      font-size: 15px;
    }
    .accordion-header:hover {
      background-color: #1e2a4a;
    }
    .icon {
      font-weight: bold;
      font-size: 18px;
      line-height: 1;
    }
    .accordion-body {
      background-color: #fff;
      padding: 20px;
    }
  `]
})
export class AppComponent implements OnInit {
  store = inject(PricingStore);
  rawData: any = RAW_DATA;

  openPanels: { default: boolean; inserts: boolean; fr: boolean; additional: boolean; [key: string]: boolean } = {
    default: true,
    inserts: false,
    fr: false,
    additional: false
  };

  currentTab = 'default';

  ngOnInit() {
    this.openTab('default');
  }

  togglePanel(panel: string) {
    this.openPanels[panel] = !this.openPanels[panel];
    if (this.openPanels[panel]) {
      this.openTab(panel);
    }
  }

  openTab(panel: string) {
     this.currentTab = panel;
     if (panel === 'default') {
        const data = this.rawData.data.embroidered_specials.rui.default;
        this.store.setPricing(toPricingTable(data));
      } else if (panel === 'inserts') {
        const data = this.rawData.data.embroidered_specials.rui.inserts;
        this.store.setPricing(toPricingTable(data));
      } else if (panel === 'fr') {
        const data = this.rawData.data.embroidered_specials.rui.fr;
        this.store.setPricing(toPricingTable(data));
      } else if (panel === 'additional') {
        const data = this.rawData.data.embroidered_specials.rui.fr;
        const charges = toAdditionalCharges(data.additional_charge);
        this.store.setCharges(charges);
      }
  }
}
