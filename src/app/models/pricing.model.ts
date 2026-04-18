export type PriceValue = number | 'dropout' | 'n/a' | 'quote';

export interface BasePricing {
    item_tier: number[];
    discount: number;
}

export interface FlatPricing extends BasePricing {
    type: 'flat';
    prices: PriceValue[];
}

export interface SizeRow {
    size: number;
    prices: PriceValue[];
}

export interface SizePricing extends BasePricing {
    type: 'size';
    size_tiers: SizeRow[];
}

export type PricingTable = FlatPricing | SizePricing;

export interface AdditionalChargeFixed {
    type: 'fixed';
    name: string;
    price: number;
}

export interface AdditionalChargePercentage {
    type: 'percentage';
    name: string;
    percentage: number | 'quote';
}

export interface AdditionalChargeTieredSize {
    type: 'tiered-size';
    name: string;
    size_tier: number[];
    price?: number[];
    percentage?: (number | 'quote')[];
}

export interface AdditionalChargeOvercharge {
    type: 'overcharge';
    name: string;
    over: number;
    every?: number;
    price: number;
}

export type AdditionalChargeItem = 
  | AdditionalChargeFixed 
  | AdditionalChargePercentage 
  | AdditionalChargeTieredSize 
  | AdditionalChargeOvercharge;
