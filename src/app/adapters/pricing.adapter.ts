import { 
  PricingTable, 
  FlatPricing, 
  SizePricing, 
  AdditionalChargeItem 
} from '../models/pricing.model';

export function toPricingTable(data: any): PricingTable {
  const isSizeBased = Array.isArray(data.size_tier);
  const rawTiers: number[] = Array.isArray(data.item_tier) ? [...data.item_tier] : [];
  const discount = data.discount || 0;
  
  if (isSizeBased) {
    const sizeTiers = data.size_tier.map((row: any) => {
      let prices = Array.isArray(row.price) ? [...row.price] : [];
      // Validation: Enforce column consistency (tiers.length === row.values.length)
      if (prices.length !== rawTiers.length) {
        console.warn(`Mismatch in size row ${row.size}. Expected ${rawTiers.length} items.`);
        prices = Array.from({ length: rawTiers.length }, (_, i) => prices[i] !== undefined ? prices[i] : 0);
      }
      return {
        size: row.size,
        prices: prices
      };
    });
    return { type: 'size', item_tier: rawTiers, discount, size_tiers: sizeTiers } as SizePricing;
  } else {
    let prices = Array.isArray(data.price) ? [...data.price] : [];
    // Validation: Auto-Pads to enforce length strict invariants safely
    if (prices.length !== rawTiers.length) {
      console.warn(`Mismatch in flat pricing. Expected ${rawTiers.length} items.`);
      prices = Array.from({ length: rawTiers.length }, (_, i) => prices[i] !== undefined ? prices[i] : 0);
    }
    return { type: 'flat', item_tier: rawTiers, discount, prices } as FlatPricing;
  }
}

export function toAdditionalCharges(data: any): AdditionalChargeItem[] {
  if (!data || typeof data !== 'object') return [];
  const charges: AdditionalChargeItem[] = [];
  
  for (const [key, value] of Object.entries<any>(data)) {
    if (value.size_tier) {
      charges.push({
        type: 'tiered-size',
        name: key.replace(/_/g, ' '),
        size_tier: value.size_tier,
        price: value.price,
        percentage: value.percentage
      });
    } else if (value.over !== undefined) {
      charges.push({
        type: 'overcharge',
        name: key.replace(/_/g, ' '),
        over: value.over,
        every: value.every,
        price: value.price
      });
    } else if (value.percentage !== undefined) {
      charges.push({
        type: 'percentage',
        name: key.replace(/_/g, ' '),
        percentage: value.percentage
      });
    } else if (value.price !== undefined && !Array.isArray(value.price)) {
      charges.push({
        type: 'fixed',
        name: key.replace(/_/g, ' '),
        price: value.price
      });
    }
  }
  return charges;
}
