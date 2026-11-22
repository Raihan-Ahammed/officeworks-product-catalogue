# AI usage

## Tools and models

- An AI coding assistant (an LLM-based coding agent with file and shell
  access), directed by me. I set the approach, reviewed every generated file
  line by line, ran the tests and the smoke test, and take ownership of the
  result.
- No agent instruction files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`) were
  used; direction was given directly in the conversation.

## Plan

The plan I gave the assistant, up front:

1. Node.js + TypeScript Express backend that proxies the Fake Store API
   behind a `ProductSource` interface with caching and validation.
2. React + TypeScript client (Vite) covering the five acceptance criteria.
3. Enquiry behind an `EmailProvider` interface, console provider by default.
4. Unit tests for the catalogue logic, API tests for the routes, component
   tests for the enquiry form.
5. README + DECISIONS.md honest about assumptions and cuts.

## Key prompts and moments that shaped the solution

1. **"All product data must go through the backend, and the data source and
   email provider are expected to change - design for that."** This produced
   the `ProductSource` / `EmailProvider` interfaces instead of direct calls.
2. **"The API docs don't show the rating field - treat it as optional and
   define 'top rated' explicitly."** This led to the defensive normalisation
   and the documented tie-breaking rule, rather than code that assumes every
   product has a rating.
3. **"The reviewer must run this in under 10 minutes with no accounts."**
   This cut real SMTP and Docker in favour of a console email provider and a
   two-command setup.
4. **"Search should also match descriptions, and category pages mirror the
   home page's top-rated-first ordering."** Direction on the acceptance
   criteria gaps.

## Where the AI got something wrong, and how I caught it

- **Component tests failed on first run**: the assistant's test setup did not
  reset the DOM between tests, so label queries matched multiple rendered
  forms. Caught by running the suite; fixed by adding cleanup to the test
  setup file.
- **Live smoke test was blocked by bot protection**: the Fake Store API
  refused requests from the build environment, so the first end-to-end check
  failed with a 403. Caught while verifying the running server; verified
  against a local stub serving the same payload shape instead, and the
  defensive normalisation means a changed upstream payload fails loudly
  rather than silently.
