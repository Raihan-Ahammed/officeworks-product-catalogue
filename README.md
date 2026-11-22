# Product Catalogue (Proof of Concept)

A small product catalogue for an entrepreneur's MVP: customers browse top rated
products, browse by category, search, view product details, and send an enquiry
to the sales inbox. Built as a foundation to grow on, not a throwaway
prototype: the product data source and the email provider sit behind
interfaces so they can be swapped without touching the app.

## Tech choices

- **Client: React + TypeScript (Vite).** React is the option that matches the
  team's day-to-day stack, and TypeScript catches contract mistakes between
  the client and the API at build time.
- **Backend: Node.js + TypeScript (Express).** Same language across the stack,
  so types and validation patterns are shared, and the critical acceptance
  constraint (all product data goes through the backend) is enforced in one
  small, testable layer.
- The backend is a read-through cache in front of the
  [Fake Store API](https://fakestoreapi.com). No database: product metadata is
  explicitly out of scope, and enquiries are delivered by email rather than
  stored (see `DECISIONS.md`).

## Getting started (under 10 minutes)

Prerequisite: Node.js 20 or newer. Nothing else - no accounts, no secrets, no
paid services.

```sh
npm install
npm run dev
```

Then open http://localhost:5173 (the web app). The API runs on
http://localhost:4000 and Vite proxies `/api` to it.

That is the whole setup. Configuration is optional: copy `.env.example` to
`.env` to change the port, the product source URL, the cache TTL, or the sales
inbox address.

## Scripts

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Runs backend and web app together in watch mode           |
| `npm test`          | Runs the backend and web test suites (Vitest)             |
| `npm run build`     | Type-checks and builds both apps                          |
| `npm run typecheck` | Type-checks without building                              |

## What is implemented

- **Home page**: the 5 top rated products (highest `rating.rate`, ties broken
  on review count).
- **Category page**: top rated products for the category, then the remaining
  products in that category.
- **Search**: case-insensitive match on product title and description.
- **Product page**: full details plus an Enquire button.
- **Enquiry**: validated form; the backend sends the enquiry to the sales
  inbox and the customer sees a Thank you message. The default
  `ConsoleEmailProvider` logs the email to the backend console so the reviewer
  can see it without any email account.

## API

| Endpoint                      | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `GET /api/health`             | Liveness check                                 |
| `GET /api/products`           | All products (`?search=`, `?category=` filters)|
| `GET /api/products/featured`  | The 5 top rated products                       |
| `GET /api/products/:id`       | One product                                    |
| `GET /api/categories`         | Distinct categories                            |
| `POST /api/enquiries`         | Submit an enquiry (validated)                  |

## Project structure

```
server/            Express API (TypeScript)
  src/products/    ProductSource interface, Fake Store implementation, catalogue logic
  src/enquiries/   EmailProvider interface, enquiry validation
  tests/           Unit and API tests
web/               React app (TypeScript, Vite)
  src/pages/       Home, Category, Search, Product
  src/components/  ProductCard, SearchBar, EnquiryForm
  src/test/        Component tests
```

## Swapping the pieces that will change

- **Product data source**: implement `ProductSource`
  (`server/src/products/types.ts`) and inject it in `server/src/index.ts`.
  `FAKE_STORE_API_BASE` already points the existing implementation at any
  compatible service.
- **Email provider**: implement `EmailProvider`
  (`server/src/enquiries/EmailProvider.ts`) - for example SES or SMTP - and
  inject it in `server/src/index.ts`. No other code changes.
- **Look and feel**: all styling lives in `web/src/styles.css`; components are
  plain semantic HTML ready for a design system.

See `DECISIONS.md` for assumptions and trade-offs, and `AI_USAGE.md` for how
AI tools were used.
