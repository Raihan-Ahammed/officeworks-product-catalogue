# Decisions and assumptions

## Assumptions (where the criteria left gaps)

- **"Top rated"** means the highest `rating.rate` from the Fake Store API,
  with ties broken by `rating.count` (a 4.5 from 300 reviews beats a 4.5 from
  3) and then by id for a stable order. The API's documentation omits the
  `rating` field from its sample responses, so the code treats rating as
  optional: unrated products rank below rated ones rather than crashing the
  sort.
- **Search** matches a case-insensitive substring against the product title
  and description. "Text matching that search term" reads as title at minimum;
  including description finds products like "gold bracelet" whose title says
  only "Bracelet".
- **Category page** shows the top 5 rated products of the category, then the
  remaining ones, mirroring the home page's definition of "top rated".
- **Prices are USD**, matching the Fake Store data.
- **The sales inbox address is configuration** (`SALES_INBOX`), not code.

## Requirements simplified or dropped, and why

- **Real email delivery** is cut to an interface (`EmailProvider`) plus a
  console-logging default. The brief expects the email provider to change, and
  the solution must not require paid services or accounts, so wiring real SMTP
  would add cost and secrets without adding judgement to the review. The
  acceptance criterion (sales inbox receives an email) is observable in the
  backend log. Swapping in SES/SMTP is a one-file change.
- **No database.** Product metadata is explicitly "not important yet" and the
  upstream API is the source of truth, so the backend is a read-through cache.
  Enquiries are delivered by email, not stored. If enquiry tracking becomes a
  requirement, that is a deliberate next step (e.g. RDS/DynamoDB), not an
  afterthought.
- **No pagination.** The Fake Store catalogue has 20 products; search and
  category filters keep lists small. Pagination would be ceremony at this
  scale.
- **No Docker setup.** `npm install && npm run dev` with Node 20+ meets the
  "running in under 10 minutes" bar with less to go wrong. The backend is
  stateless with config via environment variables, so containerising it later
  (ECS/EC2, static web on S3 + CloudFront) is straightforward and AWS
  compatible.
- **No authentication or admin UI.** Choosing the 5 featured products
  manually would need both; the criteria define "top rated" data-drivenly, so
  no admin surface is built.

## How the design supports growth

- The client never talks to the Fake Store API directly (a hard requirement),
  so the backend is the single place to change when the real product service
  arrives.
- `ProductSource` isolates the upstream API: response normalisation,
  caching, timeout, and stale-on-error behaviour live in one class.
- Catalogue rules (featured, search, category ordering) are pure functions in
  `catalogueService.ts`, unit-tested without HTTP.
- Validation lives server-side (zod) so a future mobile client gets the same
  guarantees; the web form mirrors it for fast feedback.

## Time spent

Roughly 2 hours inside the 2-3 hour time-box, split approximately:

- Planning and directing the AI assistant (approach, structure, acceptance
  criteria walkthrough): ~25 min
- Building (AI-generated, reviewed line by line): ~45 min
- Testing (unit + API tests, smoke test against a local Fake Store stub): ~30 min
- Review and documentation (this file, README, AI_USAGE): ~20 min
