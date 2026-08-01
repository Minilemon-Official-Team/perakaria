# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
## Durable Design Decisions

- Place the About Company + Expertise section directly before Contact.
- Keep the company title and body on the left, with a simple skill index on the right.
- On desktop, reveal one expert detail plate on hover or keyboard focus. On touch layouts, reveal that plate inline after tapping a skill.
- Company copy, skill labels/details, specialist identity, visibility, order, and team photos must remain CMS-managed.
- Never expose placeholder labels, CMS terminology, demo notices, or editorial setup disclaimers on the public website; those remain internal to the admin surface.
- Treat the approved Perakaria deck as content source of truth: use its opening statement for the public hero and Opsi 1 from “Penjelasan Perakaria” for the company explanation.
