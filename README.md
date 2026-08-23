# Sahl — AI-Backed ERM & Audit Management (Phase 1 MVP frontend)

A frontend-only, mock-data prototype of the **Phase 1 "Core Loop"** described in
`Sahl_MVP_Scope_and_Phasing.docx`: the manual, no-AI workflow that proves the
Audit Universe → Risk Linking → Audit Risk Register → Planning → Engagement →
Findings → Follow-up → Reports path end-to-end, before any AI or automation
layer is added in Phase 2/3.

There is no backend — all data lives in React state, seeded from
`src/mockData.ts` and persisted to the browser's `localStorage` so changes
survive a refresh. Use **Reset demo data** in the top bar to restore the
original seed.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static production
build in `dist/`.

## What's implemented

Each module below traces back to the section of the same name in
`Sahl_AI_ERM_Audit_Management_Specification.docx`, using the exact field
names from `Sahl_Database_Schema.sql` and the action set from
`Sahl_API_Contracts.md`:

- **Audit Universe** — manual entity creation, Audit Manager confirmation.
  Confirming an entity runs the deterministic direct-ID join (automation B2,
  simulated here via org-unit match, since this mock has no entity-level FK
  on `risks`).
- **Risk Linking** — direct-join results plus a manual "needs review" path
  for entities the join can't resolve.
- **Audit Risk Register** — ERM residual score, control effectiveness, and
  prior findings are shown as read-only inputs; the adjusted score and its
  rationale are entered by the auditor and required before saving (mirrors
  the `NOT NULL adjustment_rationale` constraint in the schema).
- **Audit Planning** — draft plan → add confirmed entities → estimate hours
  → assign auditors → submit → Audit Manager approval → Audit Committee
  ratification. Gap/fatigue flags are computed from `last_audit_date` /
  `audit_cycle_months` (automation B3).
- **Engagements** — created from an approved plan line; RCM entry (from a
  reusable test-procedure library or a drafted procedure), sampling,
  manual test-result entry, and the exception queue a failed/exception
  result creates automatically.
- **Findings** — structured Condition / Criteria / Cause / Effect /
  Recommendation entry; Audit Manager approval auto-creates a
  `corrective_actions` row tagged `source: "audit"` with the owner
  resolved from the control's owner (automations B9 + B10).
- **Follow-up** — the same `corrective_actions` list ERM would use,
  filterable by status/source/owner; control-owner status updates, and
  auditor/Audit Manager closure validation (an action never auto-closes).
- **Reports** — structured template per engagement; `overall_opinion` is
  required before a report can be issued, and is never pre-filled.

RBAC gating (`src/lib/rbac.ts`) mirrors the "Auth" column of the API
contracts doc. Use the **Viewing as** switcher in the top bar to see how
each screen's actions change per role (Auditor, Audit Manager/CAE, Control
Owner, Risk Owner, Audit Committee, Admin).

## Explicitly out of scope (Phase 2/3)

No GenAI drafting, AI risk scoring, fuzzy matching, RPA evidence
collection, anomaly detection, or automated report assembly — per the MVP
doc's phase gate, none of that is built until Phase 1's exit criteria are
met. The data model still carries the field names those features will use
(e.g. `ai_suggested_priority`, `ai_rationale`) so the schema doesn't need
to change when Phase 2 starts, but the UI never populates or exercises them.

## Project structure

```
src/
  types.ts          Domain types, mirroring the DB schema field-for-field
  mockData.ts        Seed data for a full demo run across every module
  state/store.tsx     In-memory "backend" — state + mutations + localStorage
  lib/rbac.ts          Role → action permission matrix
  components/         Shared UI primitives + app layout/nav
  pages/                One file per screen, routed in App.tsx
```
