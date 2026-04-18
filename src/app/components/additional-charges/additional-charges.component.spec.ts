import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalChargesComponent } from './additional-charges.component';
import { PricingStore } from '../../store/pricing.store';
import { AdditionalChargeFixed, AdditionalChargePercentage } from '../../models/pricing.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AdditionalChargesComponent', () => {
  let component: AdditionalChargesComponent;
  let fixture: ComponentFixture<AdditionalChargesComponent>;
  let store: PricingStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalChargesComponent],
      providers: [PricingStore]
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalChargesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(PricingStore);
  });

  describe('initialization', () => {
    it('should initialize with empty charges', () => {
      fixture.detectChanges();
      expect(component.charges.length).toBe(0);
    });

    it('should set charges from input', () => {
      const charges: AdditionalChargeFixed[] = [
        { type: 'fixed', name: 'setup', price: 50 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      expect(store.charges()).toEqual(charges);
    });
  });

  describe('charge rendering', () => {
    it('should render all charges', () => {
      const charges: AdditionalChargeFixed[] = [
        { type: 'fixed', name: 'setup', price: 50 },
        { type: 'fixed', name: 'rush', price: 25 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const chargeItems = fixture.debugElement.queryAll(By.css('.charge-item'));
      expect(chargeItems.length).toBe(2);
    });

    it('should display charge titles', () => {
      const charges: AdditionalChargeFixed[] = [
        { type: 'fixed', name: 'setup_fee', price: 50 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.charge-title'));
      expect(title.nativeElement.textContent).toContain('Setup Fee');
    });
  });

  describe('fixed charge type', () => {
    it('should render price input for fixed charges', () => {
      const charges: AdditionalChargeFixed[] = [
        { type: 'fixed', name: 'setup', price: 50 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('50');
    });

    it('should update fixed charge on input', () => {
      const charges: AdditionalChargeFixed[] = [
        { type: 'fixed', name: 'setup', price: 50 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = '75';
      input.nativeElement.dispatchEvent(new Event('input'));

      expect(store.charges()[0].price).toBe(75);
    });
  });

  describe('percentage charge type', () => {
    it('should render percentage input for percentage charges', () => {
      const charges: AdditionalChargePercentage[] = [
        { type: 'percentage', name: 'tax', percentage: 10 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('10');
    });

    it('should handle "quote" percentage value', () => {
      const charges: AdditionalChargePercentage[] = [
        { type: 'percentage', name: 'custom', percentage: 'quote' }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'quote';
      input.nativeElement.dispatchEvent(new Event('input'));

      expect(store.charges()[0].percentage).toBe('quote');
    });
  });

  describe('tiered size charge type', () => {
    it('should render size tier inputs', () => {
      const charges = [
        {
          type: 'tiered-size' as const,
          name: 'extra_length',
          size_tier: [2.0, 3.0, 4.0],
          price: [5, 6, 7]
        }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const inputs = fixture.debugElement.queryAll(By.css('input'));
      expect(inputs.length).toBe(3);
      expect(inputs[0].nativeElement.value).toBe('5');
      expect(inputs[1].nativeElement.value).toBe('6');
      expect(inputs[2].nativeElement.value).toBe('7');
    });

    it('should display size tier headers', () => {
      const charges = [
        {
          type: 'tiered-size' as const,
          name: 'extra_length',
          size_tier: [2.0, 3.0],
          price: [5, 6]
        }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const headers = fixture.debugElement.queryAll(By.css('.col-head'));
      expect(headers.length).toBe(2);
      expect(headers[0].nativeElement.textContent).toContain('2');
      expect(headers[1].nativeElement.textContent).toContain('3');
    });

    it('should update tiered value on input', () => {
      const charges = [
        {
          type: 'tiered-size' as const,
          name: 'extra_length',
          size_tier: [2.0, 3.0],
          price: [5, 6]
        }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const inputs = fixture.debugElement.queryAll(By.css('input'));
      inputs[0].nativeElement.value = '10';
      inputs[0].nativeElement.dispatchEvent(new Event('input'));

      expect(store.charges()[0].price![0]).toBe(10);
    });
  });

  describe('utility methods', () => {
    it('should identify string values correctly', () => {
      expect(component.isStringValue('quote')).toBe(true);
      expect(component.isStringValue('')).toBe(false);
      expect(component.isStringValue(10)).toBe(false);
    });

    it('should get tier value from charge', () => {
      const charge = {
        type: 'tiered-size' as const,
        name: 'test',
        size_tier: [2.0],
        price: [15]
      };

      expect(component.getTierValue(charge, 0)).toBe(15);
    });

    it('should get tier value from percentage', () => {
      const charge = {
        type: 'tiered-size' as const,
        name: 'test',
        size_tier: [2.0],
        percentage: [20]
      };

      expect(component.getTierValue(charge, 0)).toBe(20);
    });
  });

  describe('trackBy functions', () => {
    it('should provide trackByName', () => {
      const charge = { name: 'setup', type: 'fixed' as const, price: 50 };
      const result = component.trackByName(0, charge);
      expect(result).toBe('setup');
    });

    it('should provide trackByIndex', () => {
      const result = component.trackByIndex(5, {});
      expect(result).toBe(5);
    });
  });

  describe('no border for last item', () => {
    it('should apply no-border class to last charge item', () => {
      const charges: AdditionalChargeFixed[] = [
        { type: 'fixed', name: 'setup', price: 50 },
        { type: 'fixed', name: 'rush', price: 25 }
      ];

      component.charges = charges;
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.charge-item'));
      expect(items[items.length - 1].nativeElement.classList.contains('no-border')).toBe(true);
    });
  });
});
