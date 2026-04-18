# Pricing Management

A robust, reactive, and scalable Angular 17+ application built to manage complex dynamic pricing matrices. The UI parses deeply nested pricing structures from JSON and presents them in an instantly reactive, editable grid system format powered by Angular Signals.

## Features

- **Signal-Based Reactivity:** The application uses modern Angular `signal()` and `computed()` features to manage a completely immutable state tree. Any changes made to the pricing table instantly update the view optimally.
- **Dynamic Pricing Table:**
  - Complete control over pricing columns across multiple configurations.
  - Automatically parse both flat pricing setups and multi-tiered size matrices.
  - Effortlessly add new columns or delete existing ones without breaking array lengths or data invariants.
- **Resilient Data Adapters:** Defensive adapter pattern handles the complex variations of `pricing.json`. It gracefully fills mismatches, enforces strict typings, and unpacks diverse billing formats like `size`, `flat`, `fixed`, `percentage`, and string-based descriptors like `quote` or `dropout`.
- **Additional Charges Render:** Dedicated nested panels handle edge-case additional charges dynamically across UI elements.

## Architecture

1. **State Store (`pricing.store.ts`):** 
   Acts as the brain of the application. It holds the `_pricing` signal and safely modifies state using immutable patterns (`.map`, `.filter`). It protects against invalid modifications or runtime out-of-bounds deletions.
2. **Adapter Layer (`pricing.adapter.ts`):**
   Normalizes backend JSON (like `embroidered_specials.rui.default`) into typed domains (`PricingTable`, `FlatPricing`, `SizePricing`).
3. **Smart & Dumb Components:**
   - `PricingTableComponent`: Maps the active store values to the rendered grid UI and propagates user click events up.
   - `PricingCellComponent`: A pure display and input cell component handling specific value validations directly at the UI edge.

## How It Works

1. **Initialization:** On load, the `AppComponent` reads raw JSON data and pushes a specific data slice (e.g., *Default*, *Inserts*, *FR*) into the `PricingStore` via the formatting Adapter.
2. **Reactivity:** Using `computed()` derivations, the `store.columns()` and `store.rows()` values are automatically unwrapped to reflect the current tabular format.
3. **Editing Values:** Double clicking/tapping a price cell inputs a new value which emits back up to the store, running a strict immutable replacement update.
4. **Mutating Grids:** Pressing `+ Add Column` generates a new tiered column constraint and back-fills placeholder values (safely padding zeros) onto the active state structure.

## Getting Started

### Development Server

To run the project locally on your machine, follow these steps:

1. Ensure you have Node.js and the Angular CLI installed.
2. From the project root, start the development server using npm or ng:
   ```bash
   npm start
   # or
   ng serve
   ```
3. Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you modify any source files.

### Building for Production

To create a production-ready build of the project, run:

```bash
ng build
```
This output is statically compiled, optimized, and placed into the `dist/` directory.

## Technologies Used

- **Framework:** Angular 17.x+ (Standalone Components)
- **State Management:** Angular Core Signals
- **Language:** TypeScript 5.x
- **Styles:** Native lightweight CSS with flexbox/grid
