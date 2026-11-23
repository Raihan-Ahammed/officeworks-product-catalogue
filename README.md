# Officeworks product catalogue

AI-Native Engineer code challenge submission.

**The implementation lives on the `feature/product-catalogue` branch and is under review in [pull request #1](https://github.com/Raihan-Ahammed/officeworks-product-catalogue/pull/1).** This `main` branch only holds the initial scaffold, so run the code from the feature branch as below.

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
- Enquiry email goes over SMTP behind an `EmailProvider` interface. In
  development `npm run dev` also starts Maildev, a local catch-all inbox with
  a web UI, so the full enquiry flow works with no accounts and no secrets.

## Getting started (under 10 minutes)

Prerequisite: Node.js 20 or newer. Nothing else - no accounts, no secrets, no
paid services.

```sh
git clone https://github.com/Raihan-Ahammed/officeworks-product-catalogue.git
cd officeworks-product-catalogue
git checkout feature/product-catalogue
npm install
npm run dev
```

Then open:

- http://localhost:5173 - the web app (Vite proxies `/api` to the backend)
- http://localhost:1080 - Maildev, the local sales inbox: enquiry emails land
  here

That is the whole setup. Configuration is optional: copy `.env.example` to
`.env` to change the port, the product source URL, the cache TTL, the sales
inbox address, or the SMTP settings.

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
- **Enquiry**: validated form; the backend sends the enquiry by SMTP to the
  sales inbox and the customer sees a Thank you message. In development the
  email arrives in the local Maildev inbox at http://localhost:1080.

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
- **Email provider**: `EmailProvider` (`server/src/enquiries/EmailProvider.ts`)
  already has an SMTP implementation; production only needs env vars
  (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) pointing at SES or
  another provider. `EMAIL_PROVIDER=console` falls back to logging.
- **Look and feel**: all styling lives in `web/src/styles.css`; components are
  plain semantic HTML ready for a design system.

Full setup instructions, assumptions and trade-offs, and honest AI-usage/time notes are in `README.md`, `DECISIONS.md`, and `AI_USAGE.md` on the feature branch.
