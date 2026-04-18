import { signal, computed, Injectable } from '@angular/core';
import { PricingTable, PriceValue, AdditionalChargeItem } from '../models/pricing.model';

@Injectable({ providedIn: 'root' })
export class PricingStore {
    private readonly _pricing = signal<PricingTable | null>(null);
    private readonly _charges = signal<AdditionalChargeItem[]>([]);

    readonly pricing = this._pricing.asReadonly();
    readonly charges = this._charges.asReadonly();

    readonly columns = computed(() => {
        const state = this._pricing();
        return state ? state.item_tier : [];
    });

    readonly rows = computed<{ label: number | null, values: PriceValue[] }[]>(() => {
        const state = this._pricing();
        if (!state) return [];
        if (state.type === 'flat') {
            return [{ label: null, values: state.prices }];
        } else {
            return state.size_tiers.map(st => ({ label: st.size, values: st.prices }));
        }
    });

    setPricing(data: PricingTable) {
        if (!data || !Array.isArray(data.item_tier)) {
            console.error('Invalid pricing data');
            return;
        }
        this._pricing.set(data);
    }

    setCharges(data: AdditionalChargeItem[]) {
        this._charges.set(data);
    }

    updateCell(rowIndex: number, colIndex: number, value: PriceValue) {
        this._pricing.update(state => {
            if (!state) return state;

            if (
                colIndex < 0 ||
                colIndex >= state.item_tier.length ||
                (state.type !== 'flat' && (rowIndex < 0 || rowIndex >= state.size_tiers.length))
            ) {
                return state;
            }

            if (state.type === 'flat') {
                return {
                    ...state,
                    prices: state.prices.map((v, i) =>
                        i === colIndex ? value : v
                    )
                };
            } else {
                return {
                    ...state,
                    size_tiers: state.size_tiers.map((st, i) => {
                        if (i !== rowIndex) return st;

                        return {
                            ...st,
                            prices: st.prices.map((v, idx) =>
                                idx === colIndex ? value : v
                            )
                        };
                    })
                };
            }
        });
    }

    updateCharge(chargeIndex: number, updates: any) {
        this._charges.update(charges => {
            if (chargeIndex < 0 || chargeIndex >= charges.length) return charges;
            
            return charges.map((charge, i) => 
                i === chargeIndex ? { ...charge, ...updates } : charge
            ) as AdditionalChargeItem[];
        });
    }

    updateChargeValue(chargeIndex: number, fieldIndex: number, value: PriceValue) {
        this._charges.update(charges => {
            if (chargeIndex < 0 || chargeIndex >= charges.length) return charges;
            
            const charge = charges[chargeIndex] as any;
            
            if (charge.type === 'tiered-size') {
                if (charge.price) {
                    return charges.map((c, i) =>
                        i === chargeIndex
                            ? { ...c, price: (c as any).price!.map((v: PriceValue, idx: number) => idx === fieldIndex ? value : v) }
                            : c
                    );
                } else if (charge.percentage) {
                    return charges.map((c, i) =>
                        i === chargeIndex
                            ? { ...c, percentage: (c as any).percentage!.map((v: PriceValue, idx: number) => idx === fieldIndex ? value : v) }
                            : c
                    );
                }
            }
            return charges;
        });
    }

    addColumn(tier: number, defaultValue: PriceValue = 0) {
        this._pricing.update(state => {
            if (!state) return state;

            if (state.item_tier.includes(tier)) return state;
            const safeValue = typeof defaultValue === 'number' ? defaultValue : 0;

            const newTiers = [...state.item_tier, tier];
            newTiers.sort((a, b) => a - b);
            const insertIndex = newTiers.indexOf(tier);
            const expectedLength = newTiers.length;

            if (state.type === 'flat') {
                const newPrices = [...state.prices];
                newPrices.splice(insertIndex, 0, safeValue);
                if (newPrices.length !== expectedLength) {
                    console.warn('Mismatch in flat pricing lengths');
                }
                return { ...state, item_tier: newTiers, prices: newPrices };
            } else {
                const newSizeTiers = state.size_tiers.map(st => {
                    const np = [...st.prices];
                    np.splice(insertIndex, 0, safeValue);
                    return { ...st, prices: np };
                });
                newSizeTiers.forEach(st => {
                    if (st.prices.length !== expectedLength) {
                        console.warn('Mismatch in size pricing row');
                    }
                });
                return { ...state, item_tier: newTiers, size_tiers: newSizeTiers };
            }
        });

        // Update charges with new column
        this._charges.update(charges => 
            charges.map(charge => {
                if (charge.type === 'tiered-size') {
                    return {
                        ...charge,
                        price: charge.price ? [...charge.price, 0] : undefined,
                        percentage: charge.percentage ? [...charge.percentage, 0] : undefined
                    };
                }
                return charge;
            })
        );
    }

    removeColumn(colIndex: number) {
        this._pricing.update(state => {
            if (!state) return state;

            const newTiers = state.item_tier.filter((_, i) => i !== colIndex);
            const expectedLength = newTiers.length;

            if (state.type === 'flat') {
                const newPrices = state.prices.filter((_, i) => i !== colIndex);
                if (newPrices.length !== expectedLength) {
                    console.warn('Mismatch in flat pricing lengths');
                }
                return { ...state, item_tier: newTiers, prices: newPrices };
            } else {
                const newSizeTiers = state.size_tiers.map(st => ({
                    ...st,
                    prices: st.prices.filter((_, i) => i !== colIndex)
                }));
                newSizeTiers.forEach(st => {
                    if (st.prices.length !== expectedLength) {
                        console.warn('Mismatch in size pricing row');
                    }
                });
                return { ...state, item_tier: newTiers, size_tiers: newSizeTiers };
            }
        });

        // Update charges by removing column
        this._charges.update(charges =>
            charges.map(charge => {
                if (charge.type === 'tiered-size') {
                    return {
                        ...charge,
                        price: charge.price ? charge.price.filter((_, i) => i !== colIndex) : undefined,
                        percentage: charge.percentage ? charge.percentage.filter((_, i) => i !== colIndex) : undefined
                    };
                }
                return charge;
            })
        );
    }
}
