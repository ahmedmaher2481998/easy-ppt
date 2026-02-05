# EasyVideo Migration Presentation

## Project Overview

This repository contains the presentation materials for the **EasyVideo Frontend Migration** presentation - documenting the journey of migrating EasyVideo's frontend codebase from StencilJS to Vue.js.

## Purpose

- Generate and maintain presentation slides (PPT) for tomorrow's presentation
- The `ppt-plan.md` serves as the **script/outline** for the presentation
- Slides are generated from JSON configuration files

## Key Files

| File | Description |
|------|-------------|
| `ppt-plan.md` | Main presentation script and outline |
| `migration-presentation/slides.json` | JSON-driven slide content |
| `migration-presentation/slides-maher.json` | Alternative slide configuration |

## Presentation Topics

1. **Brief Intro** - What to expect from the session
2. **The Story** - Why Stencil was chosen, problems faced, first migration attempt
3. **The Pivot** - New "migrate first, refactor later" approach
4. **The Goal** - Why Vue was chosen and objectives
5. **The Process** - Two-phase migration strategy (Shared Package + Components)
6. **Issues & Solutions** - Shadow DOM vs Light DOM, module duplication, etc.
7. **The Result** - Achievements, stats, and key takeaways

## Technical Context

- **Source Framework:** StencilJS (Web Components with Shadow DOM)
- **Target Framework:** Vue.js (Light DOM)
- **Product:** EasyVideo - a video editing tool integrated with Easygenerator
- **Key Patterns:** LightDomAdapter, framework externalization, gradual migration

## Notion Documentation (MCP)

Use the **Notion MCP tools** to fetch additional context and historical information when needed.

### Primary Documentation
- **Frontend Framework Migration Hub:** https://www.notion.so/Frontend-Framework-Migration-23f81dfb382a808dbff2cf7d725e90a0
  - Contains detailed migration history
  - Decision logs and rationale
  - Technical specifications
  - Progress tracking

### Related Notion Pages
- [Why Vue Was Chosen](https://www.notion.so/25781dfb382a8087a63dfb50f0647e5f)
- [Migration Decisions Overview](https://www.notion.so/27f81dfb382a8036bd37f959e9eb7d24)
- [Vue ↔ Stencil Interop Guide](https://www.notion.so/28181dfb382a80529269d4e5e26b8d21)

### How to Use
```
# Fetch page content
Use notion-fetch with the page URL to retrieve detailed documentation

# Search for related content
Use notion-search to find additional migration-related documents
```

## Working with Slides

When editing or generating slides:
- Keep content concise for presentation format
- Focus on visual storytelling
- Technical diagrams help explain architecture
- Stats and numbers make impact tangible
- Reference Notion docs for detailed technical accuracy
