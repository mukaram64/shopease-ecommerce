# ShopEase — E-commerce Storefront

A responsive e-commerce demo using vanilla JavaScript, CSS Grid, localStorage, and [FakeStoreAPI](https://fakestoreapi.com/products).

## Features
- Product catalog fetched from FakeStoreAPI
- Responsive product cards with prices, ratings, and dynamic badges
- Search by product title, description, or category
- Category filters for Electronics, Jewelry, Men's clothing, and Women's clothing
- Slide-out cart drawer with navbar quantity badge
- Add/remove items and increase/decrease quantities
- Persistent cart using `localStorage`
- Subtotal, 8% estimated tax, and shipping ($5.99 under $75; free at $75+)
- Simulated checkout modal and order confirmation (no real payment)

## Project structure

```text
ecommerce-store/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Run locally
1. Extract the ZIP file.
2. Open the `ecommerce-store` folder in VS Code.
3. Recommended: run `index.html` using the VS Code **Live Server** extension.
4. Alternatively, open `index.html` in a modern browser. Internet access is required for FakeStoreAPI and Google Fonts.

## Main functions
- `fetchProducts()` — fetches the product catalog
- `renderProducts()` — draws filtered product cards
- `addToCart(productId)` — adds a product or increments its quantity
- `removeFromCart(productId)` — removes a product from the cart
- `updateQuantity(productId, change)` — adjusts quantity
- `calculateTotal()` — returns subtotal, tax, shipping, and total
- `renderCart()` — updates drawer items, badge, and totals

## Notes
- Currency is USD because FakeStoreAPI prices are listed in USD.
- Tax and shipping are demo values and can be changed near the top of `app.js`.
- Checkout is simulated only; no payment processor or backend order storage is connected.
