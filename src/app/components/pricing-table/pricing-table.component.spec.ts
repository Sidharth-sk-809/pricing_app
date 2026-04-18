import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricingTableComponent } from './pricing-table.component';
import { PricingStore } from '../../store/pricing.store';
import { FlatPricing, SizePricing } from '../../models/pricing.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PricingTableComponent', () => {
  let component: PricingTableComponent;
  let fixture: ComponentFixture<PricingTableComponent>;
  let store: PricingStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingTableComponent],
      providers: [PricingStore]
    }).compileComponents();

    fixture = TestBed.createComponent(PricingTableComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(PricingStore);
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should not render when pricing is null', () => {
      const container = fixture.debugElement.query(By.css('.pricing-container'));
      expect(container).toBeFalsy();
    });

    it('should render table when pricing is set', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.pricing-container'));
      expect(container).toBeTruthy();
    });
  });

  describe('column rendering', () => {
    it('should render columns from item_tier', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      const headers = fixture.debugElement.queryAll(By.css('th'));
      expect(headers.length).toBe(3);
    });

    it('should show remove icon for columns', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      const removeIcons = fixture.debugElement.queryAll(By.css('.remove-icon'));
      expect(removeIcons.length).toBe(2);
    });
  });

  describe('row rendering', () => {
    it('should render single row for flat pricing', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(1);
    });

    it('should render multiple rows for size-based pricing', () => {
      const sizeData: SizePricing = {
        type: 'size',
        item_tier: [4, 24],
        discount: 5,
        size_tiers: [
          { size: 2.0, prices: [10, 8] },
          { size: 3.0, prices: [12, 10] }
        ]
      };

      store.setPricing(sizeData);
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(2);
    });

    it('should show row labels for size-based pricing', () => {
      const sizeData: SizePricing = {
        type: 'size',
        item_tier: [4, 24],
        discount: 5,
        size_tiers: [
          { size: 2.0, prices: [10, 8] },
          { size: 3.0, prices: [12, 10] }
        ]
      };

      store.setPricing(sizeData);
      fixture.detectChanges();

      const labels = fixture.debugElement.queryAll(By.css('.row-label'));
      expect(labels.length).toBe(2);
      expect(labels[0].nativeElement.textContent).toContain('2');
      expect(labels[1].nativeElement.textContent).toContain('3');
    });
  });

  describe('discount display', () => {
    it('should display discount value', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 7.5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      const discountInput = fixture.debugElement.query(By.css('.discount-input'));
      expect(discountInput.nativeElement.value).toBe('7.5');
    });
  });

  describe('user interactions', () => {
    it('should call addColumn on button click', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      spyOn(component, 'addColumn');
      const addButton = fixture.debugElement.query(By.css('.add-col-btn'));
      addButton.nativeElement.click();

      expect(component.addColumn).toHaveBeenCalled();
    });

    it('should call removeColumn on remove icon click', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      spyOn(component, 'removeColumn');
      const removeIcon = fixture.debugElement.query(By.css('.remove-icon'));
      removeIcon.nativeElement.click();

      expect(component.removeColumn).toHaveBeenCalledWith(0);
    });

    it('should call onCellUpdate on pricing-cell value change', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      spyOn(component, 'onCellUpdate');
      const cellComponent = fixture.debugElement.query(
        By.directive('app-pricing-cell')
      );
      cellComponent.componentInstance.valueChange.emit(15);

      expect(component.onCellUpdate).toHaveBeenCalledWith(0, 0, 15);
    });
  });

  describe('add/remove column operations', () => {
    it('should add new column correctly', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      component.addColumn();
      fixture.detectChanges();

      const columns = store.columns();
      expect(columns.length).toBe(3);
      expect(columns[columns.length - 1]).toBe(34); // 24 + 10 (default increment)
    });

    it('should remove column correctly', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      fixture.detectChanges();

      component.removeColumn(1);
      fixture.detectChanges();

      const columns = store.columns();
      expect(columns).toEqual([4, 49]);
    });
  });

  describe('trackBy functions', () => {
    it('should provide trackByIndex', () => {
      const result = component.trackByIndex(5, {});
      expect(result).toBe(5);
    });

    it('should provide trackByRowLabel', () => {
      const row = { label: 2.5, values: [10, 8] };
      const result = component.trackByRowLabel(0, row);
      expect(result).toBe(2.5);
    });
  });
});
