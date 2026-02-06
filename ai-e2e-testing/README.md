# AI-Driven E2E Testing Presentation

A presentation explaining how Claude Code + Playwright MCP were used to generate 140 E2E tests for the EasyVideo Stencil-to-Vue migration project.

## Key Topics Covered

1. **The Challenge** - Why AI-generated tests were needed for the migration
2. **Playwright MCP** - The secret weapon: AI actually uses the browser instead of guessing
3. **The Workflow** - 4-step mandatory process for test generation
4. **Framework-Agnostic Locators** - Tests that survive migration (no `ve-*` selectors)
5. **Custom Skills** - test-generator and test-fixer Claude skills
6. **Infrastructure** - Parallel testing with automatic setup/teardown
7. **Real Example** - How AI found and fixed a dropdown positioning bug
8. **Results** - 140 tests, 17 files, zero migration breaks

## Running the Presentation

```bash
# Using Python
python3 -m http.server 8080

# Using Node
npx serve .

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## Navigation

- **Arrow keys** or **Space** to navigate between slides
- **Nav dots** on the right for quick jump
- Progress bar at the top shows position

## Theme

Purple accent (`#7C3AED`) to distinguish from the migration presentation (orange).

## Source Material

This presentation is based on documentation from:
- `/easyvideo-client-vue/.claude/` - Project knowledge and skills
- `/easyvideo-client-vue/e2e/` - Actual E2E test files and infrastructure
- `.claude/skills/test-generator/SKILL.md` - Test generation workflow
- `.claude/skills/test-fixer/SKILL.md` - Test debugging workflow
- `e2e/DATA_TESTID_MAP.md` - Comprehensive selector documentation
