---
name: frontend-feature-implementation
description: Implements frontend features in KK’s Next.js app using Tailwind CSS and existing shadcn/radix-ui components. Use when adding UI, wiring GraphQL/Apollo data dependencies, defining component/state/data flow, or ensuring accessibility and consistent styling without introducing new UI frameworks or abstraction layers.
---

# Frontend Feature Implementation (Next.js + Tailwind + shadcn/radix-ui)

Implement frontend features in a Next.js application using Tailwind CSS and shadcn/radix-ui components.

Start by identifying required UI changes and data dependencies from GraphQL or API sources. Define component structure, state handling, and data flow clearly. Use existing shadcn/radix-ui components before creating new UI primitives. Apply Tailwind CSS consistently with existing styling patterns in the codebase. Ensure accessibility and predictable interaction behavior. Avoid introducing new UI frameworks or abstraction layers. Keep changes consistent with existing design system and folder structure.

## KK frontend touchpoints (match these patterns)

- **App Router pages**: `src/app/**/page.tsx`
- **Feature components**: `src/components/**`
- **UI primitives (shadcn/radix)**: `src/components/ui/**` (e.g. `button.tsx`, `dialog.tsx`, `select.tsx`)
- **GraphQL client**:
  - Provider: `src/lib/graphql/client/apollo-provider.tsx`
  - Queries/fragments/hooks: `src/lib/graphql/**`
  - Generated types: `src/lib/generated/graphql/**` and `@/graphql` types

Prefer following existing usage patterns like `react-hook-form` + `zod` for forms and Apollo `useQuery` hooks for reads.

## Inputs to gather (ask only if needed)

- **UI goal**: user story + success criteria
- **Screen/entry point**: route(s) affected, where the UI lives
- **Data dependencies**: GraphQL query/mutation names, required fields, loading/error states
- **Interaction model**: create/edit/delete flows, optimistic updates vs refetch, pagination/infinite scroll
- **Accessibility requirements**: keyboard behavior, focus management, ARIA needs

If missing, proceed with a minimal assumption set and keep changes localized.

## Implementation workflow (follow in order)

### 1) Identify UI changes + states
- **New/changed UI**: what components/screens change
- **States**:
  - loading
  - empty
  - error
  - success
  - disabled/permission-limited
- **Edge interactions**: cancellation, retries, form reset, navigation/back behavior

### 2) Identify data dependencies (GraphQL/API)
- **Reads**: query + variables + pagination strategy (if list)
- **Writes**: mutation + inputs + expected return fields
- **Consistency**: refetch, cache update, or optimistic update strategy
- **Error mapping**: where to show errors (field-level vs global)

### 3) Component structure (keep it simple)
Propose a small tree:
- **Page component**: route-level composition and layout
- **Feature components**: domain UI (cards, lists, forms)
- **UI primitives**: reuse from `src/components/ui/**` before adding new ones

**Guidelines**
- Keep state close to where it’s used.
- Prefer explicit props over implicit global state.
- Avoid new abstraction layers (no new UI frameworks, no custom design systems).

### 4) State handling + data flow
Define clearly:
- **Local state**: UI-only state (dialog open, selected row, input text)
- **Server state**: GraphQL queries/mutations (Apollo)
- **Form state** (if applicable): `react-hook-form` + `zod` validation
- **Side effects**: navigation (`next/navigation`), toasts/messages (use existing patterns if present)

### 5) Implement with existing shadcn/radix-ui
- Prefer existing components from `src/components/ui/**`.
- When extending, match patterns:
  - `cn(...)` utility usage (`src/lib/utils.ts`)
  - Tailwind class conventions (spacing, grid, max widths)
  - variant patterns (e.g. `cva` in `button.tsx`)

### 6) Accessibility & predictable interactions
Minimum checks:
- Keyboard support (tab order, enter/escape, arrow keys where expected)
- Focus management (especially dialogs/menus)
- Labels and `aria-*` attributes (inputs, selects, comboboxes)
- Disabled states are truly non-interactive and announced

### 7) Verification
- **Manual happy path**: primary user flow works
- **Error cases**: API failure surfaced clearly, retry possible
- **Empty state**: no-data UI is intentional
- **Visual regression**: layout consistent with existing pages

## Output expectations (when doing implementation)
- Keep diffs small and localized to the feature.
- Reuse existing UI primitives and styling conventions.
- No new UI frameworks or broad refactors.
- If you must add a new UI primitive, keep it generic and consistent with shadcn patterns.

