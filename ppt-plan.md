# Migration Presentation Script: Stencil to Vue

## Brief Intro - What You Can Expect From This Session

Welcome to this session where we'll walk through our journey of migrating EasyVideo's frontend codebase from StencilJS (a web component framework) to Vue.js.

**What we'll cover:**

- Why we decided to move away from StencilJS
- Our first attempt and what we learned
- The new approach and mindset that made the difference
- The technical process and architecture decisions
- Challenges we faced and how we solved them
- The results and current state

---

## The Story - What We Tried To Do Earlier

### Why We Started with Stencil

We initially adopted StencilJS at the product's launch because we had a ready-to-implement UI/SDK from the Rendley team, which accelerated our start. This approach was crucial for **validating the product quickly**. After working with it for three months, we completely overhauled much of the UI and codebase.

### The Problems We Faced with Stencil

**Technical Limitations:**

- Unable to leverage the Easygenerator UI Kit or Shared Modules
- Shadow DOM limitations prevented compatibility with product tours
- No types for web components - no static code analysis
- Heavy reliance on window object pollution

**Developer Experience Issues:**

- No dedicated developer tools for debugging
- HMR (Hot Module Reloading) was very limited/buggy - full page reloads required
- Limited IDE support - no component usage tracking, code completion, or refactoring support
- Smaller community meant fewer resources and tutorials

**Scaling Concerns:**

- Onboarding new team members was challenging
- StencilJS-specific quirks (e.g., performance issues with portal component)
- Framework evolution slower than React/Vue/Angular

### The First Migration Attempt (Deprecated)

**The Plan:** A 2-month effort with a complicated monorepo approach to enable partial migration while keeping the app functional.

**Key insight:** We can use Stencil components inside of the Vue app. So we planned to migrate around 20% of the codebase in 2 months with full team effort.

**The Goal:** By the end, we should have the top layer migrated - if you think of a component tree, this means the root component and the first layer after it. This would enable us to continue developing in Vue and carefully migrate as we go.

**The Setup:**

- Extracting all the logic to seprate packages so it can be used by both apps
- Monorepo with 5 (services, stores, utils & types,providers ,apps(stencil , vue) ) packages and two apps always running
- Incremental migration while maintaining the app running
- Continue releasing features during migration

**The Trade-offs:**

- **Big risk** - Complex setup with many moving parts
- **Not that efficient** - Lots of overhead maintaining two apps
- **Time constraints** - Limited resources forced this approach

**The Big Benefit - Learnings:**
We deeply understood what we could do and the current architecture, paving the way for a better future approach.

**What Happened:**
This approach was interrupted due to business requirements. We stopped the migration temporarily. All the progress we made before this pause became outdated - syncing the new repo would take much more time than we had and would increase the overall required migration timeline.

---

### The Pivot - A New Approach

After the pause, we experimented and adjusted our approach. We took **5 days to do a POC** of a new plan:

> **"Migrate first, refactor later"**

**The New Strategy:**

1. Migrate all our syntax to Vue first
2. Then refactor the huge architecture debt we have

In the previous attempt, we tried to do both at the same time - that was the inefficiency.

**The Risk:**
After seeing the results of the POC, we realized we needed a very well-defined and careful approach. Otherwise, we would find ourselves in a big pile of non-functioning code - time wasted.

**The Mitigation:**

- Careful planning
- E2E tests
- Incremental approach

With these safeguards, it was possible.

**AI-Assisted Migration:**

The new approach also utilized AI heavily. We started using **GitHub Copilot**, but quickly realized we needed something more powerful that could:

- Handle **long-running tasks**
- Run **parallel agents**
- Do a lot of **reading really quick** (understanding large codebases)

So during the POC, we switched to **Claude Code** with:

- **Claude Sonnet 4.5** for execution (writing code, making changes)
- **Claude Opus 4.5** for planning (architecture decisions, migration strategies)

It worked well - the AI could analyze the entire codebase, understand dependencies, generate migration plans, and execute changes across multiple files simultaneously. This accelerated our migration speed while maintaining quality, so we decided to continue with this approach moving forward.

---

## The New Goal

**Primary Objective:** Pure syntax conversion from Stencil to Vue while maintaining identical app behavior.

**Core Focus:**

- Convert Stencil syntax to Vue syntax without changing functionality
- Fix framework-specific quirks that arise during conversion
- Address UI quirks and style differences between Shadow DOM and Light DOM
- Follow a solid, validated plan with clear execution and verification steps

**Success Criteria:**

- App behavior remains exactly the same before and after migration
- All existing features work identically in Vue
- Each migration step is validated through E2E tests
- No regressions introduced during conversion

### Why Vue Was Chosen

1. **Ecosystem Reusability** - Years of development created valuable components: collaboration features, publish/preview fragments, notifications, content blocks, shared modules

2. **Integrated User Experience** - we have a lot of sdks , and utilities vue specific with gave vue an edge

3. **Performance Out-of-the-Box** - Critical for a heavy video editing tool

4. **Team Development Efficiency** - Vue combines familiar concepts from both Angular and React

## The Mindset Going Into The Planning

### Two-Phase Approach

**Phase 1: Logic Extraction**
Extract all TypeScript logic into a separate `@easyvideo/shared` package. This includes ~103 non-UI files organized into groups:

- G1: Foundation (types, enums, config) - 18 files
- G2: Utilities - 20 files
- G3-G4: Services - 20 files
- G5: Rendley SDK Core - 5 files (CRITICAL)
- G6: Event Bridge - 1 file
- G7: Store Logic - 16 files
- G8: SDK Import Cleanup - ~51 files

The result: framework-agnostic business logic that both Stencil and Vue can consume.

**Phase 2: Component Migration**
Draw the dependency diagram of the entire component tree (138 components total). Since Vue components can consume Stencil components but **not the reverse**, we do a top-down migration layer by layer:

| Layer | Name                                   | Components |
| ----- | -------------------------------------- | ---------- |
| L0    | Root                                   | 1          |
| L1    | Direct Children                        | 7          |
| L1b   | Layout Internals (Navbar, Sidebar)     | 2          |
| L2    | Major Sections (Composition, Timeline) | 4          |
| L3    | Module Internals                       | ~45        |
| L4    | Deep Components                        | ~64        |
| L5    | UI Primitives                          | ~20        |

### The Core Principle

> **Vue app is always running.** At each layer, Vue components wrap Stencil children until those children are also migrated.

Each phase and step must be **verified before proceeding**. The app must remain functional throughout the entire migration.

### Framework Differences Research

Used **Context7 MCP** at the start to identify key differences between Stencil and Vue:

- **Lifecycle mapping:** `connectedCallback` → `onMounted`, `disconnectedCallback` → `onUnmounted`
- **Shadow DOM vs Light DOM:** Stencil uses Shadow DOM with encapsulated styles, Vue renders directly to document
- **MobX reactivity:** Use `<Observer>` component from `mobx-vue-lite` instead of manual `autorun`
- **Props/Events:** Map Stencil `@Prop()` to Vue props, `@Event()` to Vue emits
- **Refs and Methods:** Use typed refs with `InstanceType<typeof Component>` for method access

### Migration Rules

Built specific rules for consistent conversion:

- **Move code as-is** - No refactoring during migration, syntax conversion only
- **Match file structure exactly** - Vue directory paths mirror Stencil paths exactly
- **Respect lifecycle differences** - Map Stencil lifecycles to Vue equivalents
- **Match CSS scoping** - If Stencil has no `scoped: true`, Vue uses `<style>` without scoped attribute
- **Use wrapper components** - Always import from `@/stencil-components` for unmigrated components, never raw `<ve-*>` tags

### Maximizing AI Tools

The mindset was to **utilize everything available** with Claude Code:

- **Rules** - Detailed migration rules embedded in CLAUDE.md for consistent conversion
- **Skills** - Reusable prompts for repetitive tasks (component conversion, validation)
- **Well-defined tasks** - Tasklists for each layer with clear acceptance criteria and verification steps
- **Parallel agents** - Multiple agents working on independent components simultaneously
- **Decision logs** - Document choices for each group to maintain consistency across sessions
- **Memory files** - Track learnings and patterns discovered during migration

### Custom Agent Architecture

We built **custom skills (reusable agent prompts)** to handle the migration systematically:

| Skill/Agent                  | Purpose                                                                     |
| ---------------------------- | --------------------------------------------------------------------------- |
| **stencil-to-vue-migration** | Full component conversion: analyzes Stencil, creates Vue, updates consumers |
| **vue-migration-validation** | Comprehensive validation covering both syntax and style checks              |

**What the validator checks:**

- **Syntax validation:** Props, events, state, methods, lifecycle hooks, template structure, slots
- **Style validation:** CSS scoping (shadow/scoped/none), class coverage, cascade behavior
- **Consumer updates:** Verifies all Vue files using the component are updated
- **Build validation:** Type checking and build verification

**E2E Test Map:** A mapping of which E2E tests are relevant to each layer, so we could run targeted regression tests after each migration step.

### Orchestration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│  1. Convert layer plan → task list (reviewed before start)   │
│  2. Select relevant E2E tests for this layer                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   stencil-to-vue-migration    │
              │   (parallel component conversion)│
              │                               │
              │   For each component:         │
              │   1. Analyze Stencil source   │
              │   2. Create Vue component     │
              │   3. Copy styles              │
              │   4. Update consumers         │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   vue-migration-validation    │
              │                               │
              │   Validates:                  │
              │   • Props/events/state match  │
              │   • CSS scoping correct       │
              │   • Template structure        │
              │   • All consumers updated     │
              │   • Build passes              │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Results → Orchestrator      │
              │   Run layer E2E tests         │
              │   Mark task complete or fix   │
              └───────────────────────────────┘
```

**Why sub-agents?** The main agent acts as an **orchestrator** while the sub-agents start with clear context and a well-defined task. Each sub-agent focuses on one responsibility, completes it correctly, then delivers results back to the orchestrator. This prevents context pollution and keeps each agent focused.

**Key orchestration behaviors:**

- Task list generated from layer plan and reviewed by humans before execution
- Components migrated in dependency order (children first)
- Validation runs after each component, not just at the end
- E2E tests selected per-layer to catch regressions early

---

## The Process

### Two-Phase Migration Strategy

#### Phase 1: Shared Package Extraction

Extract ~103 non-UI files from Stencil into `@easyvideo/shared` package.

| Group | Name                              | Files | Risk         |
| ----- | --------------------------------- | ----- | ------------ |
| G1    | Foundation (types, enums, config) | 18    | Low          |
| G2    | Utilities                         | 20    | Low          |
| G3    | Services (no SDK)                 | 8     | Low          |
| G4    | Services (moderate deps)          | 12    | Medium       |
| G5    | Rendley SDK Core                  | 5     | **CRITICAL** |
| G6    | Event Bridge                      | 1     | High         |
| G7    | Store Logic                       | 16    | Medium       |
| G8    | SDK Import Cleanup                | ~51   | Medium       |

**Key Deliverables:**

- Framework-agnostic business logic in shared package
- SDK singleton (`getEngine()`) exported from shared
- RendleyBridge with callback injection pattern
- Zero `Engine.getInstance()` calls in app code

#### Phase 2: Component Migration

Migrate 138 Stencil components to Vue, layer by layer.

| Layer | Name                               | Components | Risk        |
| ----- | ---------------------------------- | ---------- | ----------- |
| L0    | Root                               | 1          | High        |
| L1    | Direct Children                    | 7          | Medium      |
| L1b   | Layout Internals (Navbar, Sidebar) | 2          | Medium      |
| L2    | Major Sections                     | 4          | Medium-High |
| L3    | Module Internals                   | ~45        | Medium      |
| L4    | Deep Components                    | ~64        | Low         |
| L5    | UI Primitives                      | ~20        | Low         |

---

## The Issues We Faced & How We Solved Them

### Issue 1: Shadow DOM vs Light DOM - The Core Difference

| Aspect        | Stencil (Shadow DOM)                       | Vue (Light DOM)                        |
| ------------- | ------------------------------------------ | -------------------------------------- |
| DOM Structure | Components have encapsulated shadow trees  | Components render directly to document |
| Native API    | `element.shadowRoot` returns `ShadowRoot`  | No shadow root exists                  |
| CSS Scoping   | Styles encapsulated within shadow boundary | Styles apply globally (unless scoped)  |
| DOM Queries   | Scoped to shadow root                      | Scoped to document or container        |

**The Problem**: The Stencil codebase was written expecting a `ShadowRoot` object. In Vue, there's no shadow root.

**Solution: LightDomAdapter**
Created a wrapper class that provides the same method signatures as a real `ShadowRoot`, but delegates to standard DOM APIs:

```typescript
// What ShadowRoot has:          // What LightDomAdapter does:
shadowRoot.getElementById(id)  → element.querySelector(`#${id}`)
shadowRoot.querySelector(sel)  → element.querySelector(sel)
shadowRoot.appendChild(node)   → element.appendChild(node)
shadowRoot.dispatchEvent(evt)  → element.dispatchEvent(evt)
```

### Issue 2: Module Duplication - Multiple Engine Singletons

**Symptom:**

```
[ERROR] Cannot find the parent of the clip {clipId: '...', layerId: '...'}
```

**Root Cause:** Stencil was bundling its own copies of `@easyvideo/shared`, `@rendley/sdk`, and `mobx`. When Vue initialized the Engine singleton, only Vue's copy was initialized. Stencil components used their own uninitialized Engine instance.

**Solution:** Added a custom Rollup plugin in `stencil.config.ts` to externalize shared packages:

```typescript
const externalPackages = ["@easyvideo/shared", "@rendley/sdk", "mobx"];
```

### Issue 3: Circular Dependencies

**Symptom:** Build failures and runtime errors due to modules importing each other in a cycle.

**Root Cause:** Some stores and services had bidirectional dependencies that worked in Stencil's bundling but broke when extracting to the shared package.

**Solution:** Implemented two temporary patterns:

1. **Callback injection** - Instead of importing directly, pass dependencies as callbacks during initialization
2. **Re-export pattern** - Create intermediate modules that break the cycle by re-exporting from a single entry point

### Issue 4: Direct DOM Manipulation Assumptions

**Symptom:** Code breaking because expected elements weren't in the DOM at runtime.

**Root Cause:** Several parts of the codebase relied on direct DOM manipulation, inserting non-standard tags (like `<ve-*>` custom elements) with the assumption that web components would always be registered and present. Vue's rendering model doesn't guarantee these elements exist at the same lifecycle points.

**Solution:** Updated the code to check for element existence before manipulation and ensured custom elements were registered before Vue mounts.

### Issue 5: MobX vs Vue Reactivity Mismatch

**Symptom:** State changes in MobX stores not triggering Vue component re-renders, or vice versa.

**Root Cause:** MobX requires **full mutation** (replacing the entire object/array) to detect state changes. Vue's reactivity system uses **proxy-based tracking** which detects property-level changes. When MobX stores were shared between frameworks, the different detection mechanisms caused inconsistencies.

**Solution:** Used `mobx-vue-lite` with the `<Observer>` component wrapper to bridge the reactivity systems, ensuring MobX observable changes properly trigger Vue re-renders.

---

## The Result

### Migration Scope & Scale

**Components & Assets:**
- Stencil components inventoried: 138 + 108 icons in TSX
- Vue components created: 267
- Documentation & planning files: 32+

### Testing Suite (NEW Capability)

- **Framework:** Playwright
- **E2E test files:** 17
- **E2E test cases:** 140

> This is the first time EasyVideo has automated end-to-end regression coverage.

### Timeline & Phases

**Total execution:** 32 days
**Planning:** 1 week (pre-execution)
**Start:** Dec 22, 2025
**Completion:** Jan 23, 2026

| Phase | Dates | Outcome |
|-------|-------|---------|
| Phase 1 – Logic | Dec 24–26 | 16 shared stores + core services extracted |
| Phase 2 – Components | Dec 30–Jan 22 | 5 UI layers migrated to Vue |
| Cleanup | Jan 22–23 | Old framework removal & cleanup |

### E2E Coverage Highlights

- Automated regression coverage for **critical editor workflows**
- Covers scenarios previously validated only via **manual QA**
- Acts as **guardrails** to close the feedback loop during development
- Enables safer refactors and faster future iteration

### Current Approach vs Old Approach

| Aspect | Old Approach (First Attempt) | New Approach |
|--------|------------------------------|--------------|
| Timeline | 2 months planned | 32 days actual |
| Strategy | Migrate + refactor simultaneously | Migrate first, refactor later |
| Setup | 5 packages, 2 apps running | Single app, gradual replacement |
| Team | Full team effort for ~20% migration | AI-assisted execution |
| Testing | Manual QA | E2E tests built in (140 tests) |
| Risk | High - complex moving parts | Controlled - validated at each step |
| Outcome | Interrupted, progress became outdated | Completed successfully |

**Key difference:** Simplicity and focus over complexity and parallelism.

### Why This Matters

- Removes legacy framework constraints
- Establishes a modern, scalable Vue foundation
- Introduces automated regression testing for the first time
- Reduces future change risk and QA overhead

**Outcome:** a faster, safer, and more maintainable editor platform moving forward.

---

## Resources

- [Frontend Framework Migration Documentation](https://www.notion.so/Frontend-Framework-Migration-23f81dfb382a808dbff2cf7d725e90a0)
- [Why Vue Was Chosen](https://www.notion.so/25781dfb382a8087a63dfb50f0647e5f)
- [Migration Decisions Overview](https://www.notion.so/27f81dfb382a8036bd37f959e9eb7d24)
- [Vue ↔ Stencil Interop Guide](https://www.notion.so/28181dfb382a80529269d4e5e26b8d21)
