import { TestBed } from '@angular/core/testing';
import { PricingStore } from './pricing.store';
import { FlatPricing, SizePricing } from '../models/pricing.model';

describe('PricingStore', () => {
  let store: PricingStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PricingStore]
    });
    store = TestBed.inject(PricingStore);
  });

  describe('pricing state management', () => {
    it('should initialize with null pricing', () => {
      expect(store.pricing()).toBeNull();
    });

    it('should set pricing data', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      expect(store.pricing()).toEqual(flatData);
    });

    it('should reject invalid pricing data', () => {
      store.setPricing(null as any);
      expect(store.pricing()).toBeNull();
    });
  });

  describe('columns computed signal', () => {
    it('should extract item_tier as columns', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      expect(store.columns()).toEqual([4, 24, 49]);
    });

    it('should return empty array when pricing is null', () => {
      expect(store.columns()).toEqual([]);
    });
  });

  describe('rows computed signal', () => {
    it('should return single row for flat pricing', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      const rows = store.rows();

      expect(rows.length).toBe(1);
      expect(rows[0].label).toBeNull();
      expect(rows[0].values).toEqual([10, 8, 6]);
    });

    it('should return multiple rows for size-based pricing', () => {
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
      const rows = store.rows();

      expect(rows.length).toBe(2);
      expect(rows[0].label).toBe(2.0);
      expect(rows[1].label).toBe(3.0);
    });
  });

  describe('updateCell', () => {
    it('should update cell in flat pricing', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      store.updateCell(0, 1, 9);

      expect(store.rows()[0].values[1]).toBe(9);
    });

    it('should update cell in size-based pricing', () => {
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
      store.updateCell(1, 0, 15);

      expect(store.rows()[1].values[0]).toBe(15);
    });

    it('should handle invalid cell indices gracefully', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      store.updateCell(-1, 0, 99);
      store.updateCell(0, 99, 99);

      expect(store.rows()[0].values).toEqual([10, 8]);
    });
  });

  describe('addColumn', () => {
    it('should add column to flat pricing', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      store.addColumn(49, 5);

      expect(store.columns()).toEqual([4, 24, 49]);
      expect(store.rows()[0].values).toEqual([10, 8, 5]);
    });

    it('should add column to size-based pricing', () => {
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
      store.addColumn(49, 6);

      expect(store.columns()).toEqual([4, 24, 49]);
      expect(store.rows()[0].values).toEqual([10, 8, 6]);
      expect(store.rows()[1].values).toEqual([12, 10, 6]);
    });

    it('should not add duplicate columns', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24],
        discount: 5,
        prices: [10, 8]
      };

      store.setPricing(flatData);
      store.addColumn(4, 5);

      expect(store.columns().length).toBe(2);
    });

    it('should sort columns after adding', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 49],
        discount: 5,
        prices: [10, 6]
      };

      store.setPricing(flatData);
      store.addColumn(24, 8);

      expect(store.columns()).toEqual([4, 24, 49]);
    });
  });

  describe('removeColumn', () => {
    it('should remove column from flat pricing', () => {
      const flatData: FlatPricing = {
        type: 'flat',
        item_tier: [4, 24, 49],
        discount: 5,
        prices: [10, 8, 6]
      };

      store.setPricing(flatData);
      store.removeColumn(1);

      expect(store.columns()).toEqual([4, 49]);
      expect(store.rows()[0].values).toEqual([10, 6]);
    });

    it('should remove column from size-based pricing', () => {
      const sizeData: SizePricing = {
        type: 'size',
        item_tier: [4, 24, 49],
        discount: 5,
        size_tiers: [
          { size: 2.0, prices: [10, 8, 6] },
          { size: 3.0, prices: [12, 10, 8] }
        ]
      };

      store.setPricing(sizeData);
      store.removeColumn(1);

      expect(store.columns()).toEqual([4, 49]);
      expect(store.rows()[0].values).toEqual([10, 6]);
      expect(store.rows()[1].values).toEqual([12, 8]);
    });
  });

  describe('charges management', () => {
    it('should initialize with empty charges', () => {
      expect(store.charges()).toEqual([]);
    });

    it('should set charges', () => {
      const charges = [
        { type: 'fixed' as const, name: 'setup', price: 50 }
      ];

      store.setCharges(charges as any);
      expect(store.charges().length).toBe(1);
    });

    it('should update charge property', () => {
      const charges = [
        { type: 'fixed' as const, name: 'setup', price: 50 }
      ];

      store.setCharges(charges as any);
      store.updateCharge(0, { price: 75 });

      expect(store.charges()[0].price).toBe(75);
    });
  });
});
