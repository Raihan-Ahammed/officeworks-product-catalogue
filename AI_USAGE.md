# AI usage

## Tools

- An AI coding assistant (an LLM-based agent that can read and write files and
  run shell commands), directed by me. I set the approach and constraints,
  reviewed the output, and own every line in this submission.

## How it was directed

The plan I set up front:

1. Node.js + TypeScript Express backend that proxies the Fake Store API
   behind a `ProductSource` interface with caching and validation.
2. React + TypeScript client (Vite) covering the five acceptance criteria.
3. Enquiry delivery over SMTP behind an `EmailProvider` interface, with a
   local catch-all inbox for development.
4. Unit tests for the catalogue logic, API tests for the routes, component
   tests for the enquiry form.
5. README + this file + DECISIONS.md, honest about assumptions and cuts.

## Key prompts and moments that shaped the solution

1. **"All product data must go through the backend, and the data source and
   email provider are expected to change - design for that."** This produced
   the `ProductSource` / `EmailProvider` interfaces instead of direct calls.
2. **"The API docs don't show the rating field - treat it as optional and
   define 'top rated' explicitly."** This led to the defensive normalisation
   and the documented tie-breaking rule, rather than code that assumes every
   product has a rating.
3. **"The reviewer must run this in under 10 minutes with no accounts."**
   This shaped the two-command setup and the local Maildev inbox instead of
   real SMTP credentials.
4. **"Search should also match descriptions, and category pages mirror the
   home page's top-rated-first ordering."**

## Where the AI got something wrong, and how I caught it

- **Broken product images shipped unhandled.** The first UI pass rendered
  broken-image icons when an image URL failed. I caught this reviewing the
  running app and added a placeholder fallback in the image components.
- **Enquiry delivery was originally log-only.** The first version wrote the
  "email" to the backend console, which does not meet the acceptance
  criterion that the sales inbox receives an email. I caught this when
  re-reading the criteria against the submission and replaced it with real
  SMTP delivery plus a local test inbox.
- **Test isolation bug.** The first frontend test run failed because the test
  setup did not clean up rendered components between tests. Caught by running
  the suite; fixed in the test setup file.
- **Live smoke test blocked by bot protection.** The Fake Store API refused
  requests from the build environment, so end-to-end verification ran against
  a local stub serving the same payload shape. The defensive normalisation
  means a changed upstream payload fails loudly rather than silently, and the
  reviewer runs against the real API locally.

## Time spent

Recorded build window: 22 Nov 2026, 11:41-11:52 IST - about 11 minutes of
AI-assisted implementation and automated verification, including one
review-and-fix round. My own review and interview preparation time is still to
be added honestly before submitting.
