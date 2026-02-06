# E2E Test Fixer Skill

## Purpose

Fix failing E2E tests by using Playwright MCP to interactively debug and identify the root cause of failures. This skill emphasizes **live browser interaction** over guesswork.

## Critical Requirement

**YOU MUST USE PLAYWRIGHT MCP TOOLS** to debug failing tests. Never attempt to fix tests by:
- Guessing what the issue might be
- Only reading test code and component code
- Making assumptions about element visibility or positioning

Instead, always:
1. Navigate to the app with MCP
2. Reproduce the failing steps interactively
3. Observe actual browser state and errors
4. Verify fixes in the live browser before running tests

## Workflow

### Step 1: Understand the Failure

Run the failing test to get the error message:

```bash
pnpm test:e2e <test-file.spec.ts> --grep "<test-name>"
```

Key information to extract:
- **Error type**: TimeoutError, element not found, assertion failed, etc.
- **Failing locator**: What selector is the test trying to interact with
- **Line number**: Where in the test the failure occurs
- **Call log**: Playwright's detailed action log showing what it tried

### Step 2: Read the Test Code

Read the test file to understand:
- What user action is being performed
- What element the test is trying to interact with
- What the expected outcome is

```
Read the test file around the failing line number
```

### Step 3: Launch Browser with MCP

**This step is MANDATORY.** Navigate to the app:

```
mcp__playwright__browser_navigate to the app URL
```

Standard dev URL:
```
http://localhost:9999/?mediaId=&type=0&contentBlockId=4a3c8d1e-afd0-4c6b-a9e1-243449d09827&courseId=8b9a7457-4525-4c5d-9ff4-815bdda73987&questionId=831482ea-b58d-490a-af57-7f397506677f&sectionId=65d6b284-0582-42ab-9c8f-eea851e24faf&editorHost=staging.easygenerator.com
```

Wait for the editor to load:
```
mcp__playwright__browser_wait_for with time: 5
```

### Step 4: Reproduce the Test Steps

Manually perform each step the test does using MCP tools:

1. **Take snapshots** to see available elements:
   ```
   mcp__playwright__browser_snapshot
   ```

2. **Click elements** to navigate:
   ```
   mcp__playwright__browser_click with element description and ref
   ```

3. **Check console for errors**:
   ```
   mcp__playwright__browser_console_messages
   ```

4. **Evaluate JavaScript** to inspect DOM state:
   ```
   mcp__playwright__browser_evaluate with a function to query elements
   ```

### Step 5: Identify the Root Cause

Common failure patterns and how to diagnose them:

#### Pattern A: Element Outside Viewport
**Symptoms:**
- Test times out clicking an element
- Call log shows "element is outside of the viewport"
- Element is visible but not clickable

**Diagnosis with MCP:**
```javascript
// Evaluate to check element position
() => {
  const el = document.querySelector('.failing-selector');
  return {
    rect: el?.getBoundingClientRect(),
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth
  };
}
```

**Common causes:**
- Dropdown opening in wrong direction (downward when at bottom of screen)
- Element rendered outside scroll container
- CSS positioning issues (absolute/fixed positioning)

#### Pattern B: Element Not Found
**Symptoms:**
- Locator cannot find element
- Element exists but with different selector

**Diagnosis with MCP:**
```javascript
// Check if element exists with different selector
() => {
  return {
    byClass: document.querySelectorAll('.expected-class').length,
    byRole: document.querySelectorAll('[role="expected-role"]').length,
    byTestId: document.querySelectorAll('[data-testid="expected-id"]').length
  };
}
```

**Common causes:**
- Class name changed
- Element structure differs
- Element conditionally rendered

#### Pattern C: JavaScript Error Blocking Interaction
**Symptoms:**
- Click succeeds but nothing happens
- Console shows errors

**Diagnosis with MCP:**
```
mcp__playwright__browser_console_messages with level: "error"
```

**Common causes:**
- Method not found on component
- Undefined property access
- Event handler errors

#### Pattern D: Timing Issues
**Symptoms:**
- Test passes sometimes, fails other times
- Element appears but interaction fails

**Diagnosis with MCP:**
- Use `browser_wait_for` with text or time
- Take multiple snapshots to observe state changes

### Step 6: Locate the Component Code

Once you identify the issue, find the relevant Vue component:

```bash
# Search for component by class or selector
Grep for the failing selector in apps/vue/src
```

### Step 7: Implement the Fix

Based on the root cause:

#### For Positioning Issues:
- Add logic to detect available space
- Use CSS modifiers for alternate positioning
- Example: Dropdown opening upward when at bottom of screen

#### For Component Methods:
- Vue exposes methods via `defineExpose` and `__vueParentComponent.exposed`
- Ensure methods are properly exposed in the component

#### For Missing Elements:
- Check for missing classes, test IDs, or roles
- Verify conditional rendering logic

### Step 8: Verify Fix with MCP

**Before running the test again**, verify the fix works in the browser:

1. Refresh the page:
   ```
   mcp__playwright__browser_navigate to the same URL
   ```

2. Reproduce the steps that were failing

3. Confirm the interaction now works

4. Take a screenshot for visual verification:
   ```
   mcp__playwright__browser_take_screenshot
   ```

### Step 9: Run the Test

Only after verifying with MCP, run the actual test:

```bash
pnpm test:e2e <test-file.spec.ts> --grep "<test-name>"
```

### Step 10: Close Browser

```
mcp__playwright__browser_close
```

## MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Open a URL |
| `browser_snapshot` | Get accessibility tree (better than screenshot for finding refs) |
| `browser_take_screenshot` | Visual verification |
| `browser_click` | Click elements by ref |
| `browser_type` | Type text into inputs |
| `browser_evaluate` | Run JavaScript to inspect DOM |
| `browser_console_messages` | Check for JS errors |
| `browser_wait_for` | Wait for text, element, or time |
| `browser_close` | Close the browser |

## Example Debugging Session

### Problem: Font size dropdown options not clickable

1. **Error**: `TimeoutError: locator.click: element is outside of the viewport`

2. **MCP Investigation**:
   ```javascript
   // Evaluated in browser
   () => {
     const options = document.querySelectorAll('.font-option');
     return Array.from(options).map(o => ({
       text: o.textContent,
       rect: o.getBoundingClientRect()
     }));
   }
   ```

3. **Finding**: Options have `top: 854px` but viewport is only `836px` - dropdown opens downward off-screen

4. **Root Cause**: Select component always positions dropdown below button (`top: 1.5rem`)

5. **Fix**: Add logic to detect space and open upward when needed:
   - Added `openUpward` ref
   - Calculate space on toggle
   - CSS modifier `--upward` with `bottom: 100%`

6. **Verification**: Reopened dropdown with MCP, confirmed options now at `top: 575px` (within viewport)

7. **Test Result**: ✅ Passed

## Common Vue Issues

### Issue: Method called on DOM element instead of Vue component

**Vue** (methods via exposed):
```javascript
const el = document.querySelector('.component');
const vueComponent = el.__vueParentComponent;
await vueComponent?.exposed?.close?.(); // Vue pattern
```

### Issue: CSS scoping differences

- Vue scoped: Styles leak in but not out
- Check if parent styles are affecting the component

### Issue: Event handling

- Vue uses `emit()` function, parent uses `@event-name`
- Ensure event names and payloads are correct

## Checklist

- [ ] Read the failing test error carefully
- [ ] **Used MCP to navigate to the app** (REQUIRED)
- [ ] Reproduced failing steps interactively in browser
- [ ] Checked console for JavaScript errors
- [ ] Evaluated DOM to understand element state
- [ ] Identified root cause (not guessed)
- [ ] Implemented fix in component code
- [ ] **Verified fix with MCP before running test** (REQUIRED)
- [ ] Test passes
- [ ] Browser closed
