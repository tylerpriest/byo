# V3 Research Items - Investigation & Recommendations

**Date:** 2025-01-07
**Purpose:** Research emerging technologies and best practices for V3
**Status:** Research Document

---

## Research Priority Matrix

| Item | Priority | Urgency | Impact | Research By |
|------|----------|---------|--------|-------------|
| ChemJungle Task Templates | HIGH | High | High | Before Phase 10 |
| Playwright MCP Stability | HIGH | Medium | High | Before Phase 7 |
| Vitest 4.0 Production Readiness | HIGH | High | High | Before Phase 7 |
| Lachlan's Project Patterns | MEDIUM | Medium | Medium | Ongoing |
| Beads Framework | MEDIUM | Low | Medium | Post-MVP |
| Claude Skills/Plugins/Agents | LOW | Low | High | Post-MVP |
| Docker vs npx Supabase | LOW | Medium | Medium | Optional |

---

## 1. ChemJungle Task Templates (HIGH Priority)

### Research Questions
- What task template structure does ChemJungle use?
- What slash commands are implemented?
- How do they integrate with AI workflows?
- Are there reusable patterns we can adopt?

### Investigation Plan

**Step 1: Access ChemJungle Repository**
```bash
# If available
git clone <chemjungle-repo-url>
cd chemjungle

# Examine structure
ls -la .claude/
ls -la docs/tasks/
ls -la scripts/
```

**Step 2: Analyze Task Templates**

Look for:
- `/docs/tasks/template/` - Template files
- `.claude/commands/` - Slash commands
- `/scripts/` - Automation scripts
- Task lifecycle workflow

**Step 3: Document Patterns**

Create: `/docs/implementation-plan_v3-ready-to-run/research/chemjungle-analysis.md`

```markdown
# ChemJungle Task Management Analysis

## Task Template Structure
[Document structure]

## Slash Commands Found
1. `/createtask` - [description]
2. `/gitcommit` - [description]
3. [etc.]

## Automation Scripts
- [List scripts]

## Recommended Adaptations for BYO
1. [Pattern to adopt]
2. [Pattern to modify]
3. [Pattern to skip]
```

### Expected Output

**Deliverable 1: Task Templates**
- `/docs/tasks/template/feature-template.md` (adapted)
- `/docs/tasks/template/bug-template.md` (adapted)
- `/docs/tasks/template/refactor-template.md` (adapted)

**Deliverable 2: Slash Commands**
- `.claude/commands/createtask.md`
- `.claude/commands/gitcommit.md`
- `.claude/commands/audit.md`

**Deliverable 3: Scripts**
- `/scripts/create-task.sh`
- `/scripts/move-task.sh` (draft → active → complete)

### Timeline
- **Research:** 2 hours
- **Adaptation:** 3 hours
- **Integration:** 2 hours
- **Total:** ~7 hours

### Success Criteria
- [ ] Task templates imported and adapted
- [ ] Slash commands working in Claude Desktop
- [ ] Scripts tested and documented
- [ ] Team can use new workflow

---

## 2. Playwright MCP - Stability & Features (HIGH Priority)

### Research Questions
- Is `@playwright/mcp` production-ready (Nov 2025)?
- What features does it provide?
- What are known limitations?
- Is there official documentation?
- Are there community adoption examples?

### Investigation Plan

**Step 1: Check Official Sources**

```bash
# Search npm
npm info @playwright/mcp

# Check GitHub
# https://github.com/microsoft/playwright/issues
# Search for "MCP" or "Model Context Protocol"

# Check Playwright docs
# https://playwright.dev/ (search for MCP)
```

**Step 2: Test Installation**

```bash
# Try installing
npm install -D @playwright/mcp

# Check if it works
npx playwright mcp --help

# Try configuring in Claude Desktop
# ~/Library/Application Support/Claude/claude_desktop_config.json
```

**Step 3: Test Features**

Create test file: `/tests/research/playwright-mcp-test.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('research: can playwright mcp generate tests?', async ({ page }) => {
  // Try asking Claude with Playwright MCP:
  // "Generate a test for the login page"
  // Does it work?
})
```

**Step 4: Check Community**

- Search Discord/Reddit for Playwright MCP experiences
- Check Twitter/X for announcements
- Look for blog posts about Playwright MCP

### Expected Findings

**Scenario A: Production Ready**
```markdown
✅ Stable release available
✅ Official documentation exists
✅ Community adoption growing
✅ Known issues are minor

→ DECISION: Include in V3 Phase 7
```

**Scenario B: Beta/Experimental**
```markdown
⚠️ Beta release, some bugs
⚠️ Limited documentation
⚠️ Few real-world examples
⚠️ API may change

→ DECISION: Include as OPTIONAL in V3, with fallback to manual tests
```

**Scenario C: Not Ready**
```markdown
❌ Alpha quality or unavailable
❌ No documentation
❌ Major known issues

→ DECISION: Skip for V3, revisit in V4
```

### Deliverable

File: `/docs/implementation-plan_v3-ready-to-run/research/playwright-mcp-evaluation.md`

```markdown
# Playwright MCP Evaluation

## Status: [Production Ready / Beta / Not Ready]

## Version Tested: [version]

## Features Available:
- [ ] Test generation
- [ ] Self-healing selectors
- [ ] Visual regression
- [ ] Test maintenance

## Known Issues:
1. [Issue 1]
2. [Issue 2]

## Recommendation:
[Include / Include as optional / Skip]

## Implementation Notes:
[How to integrate if including]
```

### Timeline
- **Research:** 3 hours
- **Testing:** 2 hours
- **Decision:** 1 hour
- **Total:** ~6 hours

---

## 3. Vitest 4.0 - Production Readiness (HIGH Priority)

### Research Questions
- Is Vitest 4.0 stable? (Released or still in beta?)
- Are all advertised features working?
- Is there a migration path from Vitest 1.x?
- What are the breaking changes?
- Browser mode stability?

### Investigation Plan

**Step 1: Check Official Release Status**

```bash
# Check npm
npm info vitest

# Check GitHub releases
# https://github.com/vitest-dev/vitest/releases

# Check documentation
# https://vitest.dev/
```

**Step 2: Test Installation**

```bash
# Install latest
npm install -D vitest@latest

# Check version
npx vitest --version

# Should be 4.x.x or is it still 1.x.x?
```

**Step 3: Test V4 Features**

Create: `/tests/research/vitest-v4-features.test.ts`

```typescript
import { describe, it, expect, bench } from 'vitest'

// Test: In-source testing
if (import.meta.vitest) {
  describe('in-source testing', () => {
    it('should work', () => {
      expect(true).toBe(true)
    })
  })
}

// Test: Benchmark mode
bench('array.push', () => {
  const arr: number[] = []
  arr.push(1)
})

// Test: Browser mode (requires config)
// See vitest.config.ts with browser: { enabled: true }
```

**Step 4: Test Browser Mode**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
  },
})
```

```bash
# Run browser tests
npm run test:browser
```

**Step 5: Check Breaking Changes**

- Review migration guide
- Test existing tests still work
- Check for deprecated APIs

### Expected Findings

**Scenario A: Vitest 4.0 Released & Stable**
```markdown
✅ v4.0.0+ available on npm
✅ All features working
✅ Migration guide available
✅ Community adoption

→ DECISION: Use Vitest 4.0 in V3
```

**Scenario B: Vitest Still 1.x, v4 in Beta**
```markdown
⚠️ v4 in beta/RC
⚠️ Some features experimental
⚠️ May have bugs

→ DECISION: Use latest stable (1.x) or latest beta (4.x-beta)
→ Document which features to avoid
```

**Scenario C: Vitest 4.0 Not Available**
```markdown
ℹ️ Only v1.x or v2.x available
ℹ️ v4 features are roadmap only

→ DECISION: Use latest stable, remove v4-specific features from plan
```

### Deliverable

File: `/docs/implementation-plan_v3-ready-to-run/research/vitest-v4-evaluation.md`

```markdown
# Vitest 4.0 Evaluation

## Current Status
- Latest stable version: [version]
- v4.0 status: [Released / Beta / Planned]

## Features Available
- [x] Basic testing (always available)
- [ ] Browser mode
- [ ] Workspace mode
- [ ] In-source testing
- [ ] Benchmark mode
- [ ] Type testing
- [ ] Sharding

## Migration Notes
[Any breaking changes or migration steps]

## Recommendation
[Which version to use in V3]

## Config to Use
```typescript
// vitest.config.ts
[recommended config]
```
```

### Timeline
- **Research:** 2 hours
- **Testing:** 3 hours
- **Decision:** 1 hour
- **Total:** ~6 hours

---

## 4. Lachlan's Latest Project - Patterns Study (MEDIUM Priority)

### Research Questions
- What project is Lachlan working on?
- What patterns/practices is he using?
- How does he structure projects?
- What tooling choices has he made?
- Are there lessons applicable to BYO?

### Investigation Plan

**Step 1: Identify Project**

- Check Lachlan's GitHub
- Recent Twitter/X posts
- Blog posts or streams

**Step 2: Analyze Structure**

```bash
# If repo is public
git clone <lachlan-repo-url>

# Examine
ls -la
cat README.md
cat package.json
ls -la .github/workflows/
ls -la docs/
```

**Step 3: Document Patterns**

Look for:
- Directory structure
- Testing approach
- Documentation style
- CI/CD setup
- Tool choices (Vite? Next.js? etc.)
- AI integration (if any)

**Step 4: Compare to BYO**

Create comparison matrix:

| Pattern | Lachlan's Project | BYO V3 | Should Adopt? |
|---------|-------------------|--------|---------------|
| Structure | [pattern] | [pattern] | [Yes/No/Modify] |
| Testing | [approach] | [approach] | [Yes/No/Modify] |
| [etc.] | | | |

### Deliverable

File: `/docs/implementation-plan_v3-ready-to-run/research/lachlan-project-analysis.md`

```markdown
# Lachlan's Project Analysis

## Project: [name]
## URL: [github url]

## Key Patterns Observed
1. [Pattern 1]
2. [Pattern 2]

## Tooling Choices
- [Tool 1]: [reason]
- [Tool 2]: [reason]

## Applicable to BYO
- ✅ Adopt: [pattern]
- ⚠️ Modify: [pattern]
- ❌ Skip: [pattern]

## Recommended Changes to V3
[List any recommended updates to V3 plan]
```

### Timeline
- **Research:** 3 hours
- **Analysis:** 2 hours
- **Documentation:** 1 hour
- **Total:** ~6 hours

---

## 5. Beads Framework - Spec-Driven Development (MEDIUM Priority)

### Research Questions
- What is the Beads framework? (github.com/steveyegge/beads)
- How does it enable spec-driven development?
- What are the core principles?
- Are there examples we can learn from?
- Can we adapt patterns to BYO?

### Investigation Plan

**Step 1: Study Beads Repository**

```bash
git clone https://github.com/steveyegge/beads
cd beads

# Read documentation
cat README.md
ls -la docs/
ls -la examples/
```

**Step 2: Understand Core Concepts**

- What is a "bead"?
- How do specs work?
- How does AI integration work?
- What's the workflow?

**Step 3: Create Sample Spec**

Try creating a spec in Beads format for a BYO feature:

```markdown
# Example: Auth Feature Spec (Beads Format)

## What
User authentication system with email/password

## Why
Users need secure access to platform

## How
[Beads-style specification]

## Tests
[Beads-style test specs]
```

**Step 4: Evaluate Fit**

Questions:
- Does Beads fit our workflow?
- Is it too heavyweight?
- Can we use parts of it?
- Do we need the full framework?

### Expected Outcomes

**Scenario A: Good Fit**
```markdown
✅ Clear benefits
✅ Not too complex
✅ Works with our tools

→ DECISION: Adopt Beads patterns in V3
→ Create Beads-style spec template
```

**Scenario B: Useful Patterns Only**
```markdown
⚠️ Full framework is overkill
✅ Some patterns are useful

→ DECISION: Cherry-pick useful patterns
→ Don't adopt full framework
```

**Scenario C: Not a Fit**
```markdown
❌ Too complex for our needs
❌ Doesn't match our workflow

→ DECISION: Skip Beads, stick with current spec format
```

### Deliverable

File: `/docs/implementation-plan_v3-ready-to-run/research/beads-framework-evaluation.md`

```markdown
# Beads Framework Evaluation

## Overview
[Summary of Beads framework]

## Core Principles
1. [Principle 1]
2. [Principle 2]

## Example Workflow
[Step-by-step example]

## Pros for BYO
- [Benefit 1]
- [Benefit 2]

## Cons for BYO
- [Drawback 1]
- [Drawback 2]

## Recommendation
[Adopt / Cherry-pick / Skip]

## If Adopting
[What to integrate and how]
```

### Timeline
- **Research:** 4 hours
- **Testing:** 3 hours
- **Decision:** 1 hour
- **Total:** ~8 hours

---

## 6. Claude Skills, Plugins, Agents (LOW Priority - Post-MVP)

### Research Questions
- What are Claude Skills?
- What are Claude Plugins?
- What are Claude Agents?
- How do they differ from MCPs?
- Are they available to users yet?
- How would they benefit BYO?

### Investigation Plan

**Step 1: Check Official Sources**

- Anthropic documentation
- Claude.ai announcements
- Developer forums

**Step 2: Identify Use Cases**

For BYO, could we use:
- **Skills** for end-to-end feature development?
- **Plugins** for build-time automation?
- **Agents** for autonomous tasks?

**Step 3: Test (if available)**

If any are available:
- Install/configure
- Test with BYO project
- Document capabilities

### Expected Findings

**Scenario A: Available & Useful**
```markdown
✅ Publicly available
✅ Clear use cases for BYO
✅ Documentation exists

→ DECISION: Integrate in V3.1 or V4
```

**Scenario B: Emerging/Beta**
```markdown
⚠️ Beta or limited access
⚠️ Unclear roadmap

→ DECISION: Monitor, revisit Q2 2025
```

**Scenario C: Not Ready**
```markdown
ℹ️ Announced but not available
ℹ️ No clear timeline

→ DECISION: Skip for now, revisit Q3 2025
```

### Deliverable

File: `/docs/implementation-plan_v3-ready-to-run/research/claude-advanced-features.md`

```markdown
# Claude Advanced Features Research

## Skills
- **Status:** [Available / Beta / Planned]
- **Use case for BYO:** [description]
- **Recommendation:** [Integrate / Wait / Skip]

## Plugins
- **Status:** [Available / Beta / Planned]
- **Use case for BYO:** [description]
- **Recommendation:** [Integrate / Wait / Skip]

## Agents
- **Status:** [Available / Beta / Planned]
- **Use case for BYO:** [description]
- **Recommendation:** [Integrate / Wait / Skip]

## Timeline for BYO
[When to revisit this research]
```

### Timeline
- **Research:** 3 hours
- **Testing:** 2 hours (if available)
- **Documentation:** 1 hour
- **Total:** ~6 hours

---

## 7. Docker vs npx Supabase (LOW Priority - Optional)

### Research Questions
- What are the pros/cons of each approach?
- Which is easier for teams?
- Which is more reliable?
- Can we support both?

### Investigation Plan

**Step 1: Test Both Approaches**

**npx approach:**
```bash
npx supabase init
npx supabase start
# Measure startup time
time npx supabase start
```

**Docker compose approach:**
```bash
docker-compose up -d
# Measure startup time
time docker-compose up -d
```

**Step 2: Compare**

| Factor | npx | Docker Compose |
|--------|-----|----------------|
| Setup time | [X min] | [Y min] |
| Startup time | [X sec] | [Y sec] |
| Memory usage | [X MB] | [Y MB] |
| Ease of use | [rating] | [rating] |
| Team preference | [%] | [%] |

**Step 3: Create Both Configs**

Provide both options in V3:
- Default: npx (simpler for most)
- Optional: Docker compose (for teams that prefer it)

### Deliverable

File: `/docs/implementation-plan_v3-ready-to-run/research/supabase-local-comparison.md`

```markdown
# Supabase Local Development Comparison

## npx Approach
**Pros:**
- [Pro 1]

**Cons:**
- [Con 1]

**Best for:**
- [Use case]

## Docker Compose Approach
**Pros:**
- [Pro 1]

**Cons:**
- [Con 1]

**Best for:**
- [Use case]

## Recommendation
- **Default:** npx supabase
- **Optional:** Docker compose (for teams with Docker)

## Files to Include in V3
- `/docs/documentation/setup.md` (npx instructions)
- `/docker/docker-compose.yml` (optional Docker setup)
- `/docs/documentation/docker-setup.md` (optional guide)
```

### Timeline
- **Testing:** 2 hours
- **Documentation:** 2 hours
- **Total:** ~4 hours

---

## Research Schedule

### Phase 1: Pre-Implementation (Before starting V3)
- **Week 1:**
  - [x] ChemJungle Task Templates (7 hours)
  - [x] Vitest 4.0 Evaluation (6 hours)

- **Week 2:**
  - [ ] Playwright MCP Evaluation (6 hours)
  - [ ] Lachlan's Project Analysis (6 hours)

### Phase 2: During Implementation (Parallel to V3)
- **Week 3-4:**
  - [ ] Beads Framework (8 hours)
  - [ ] Docker vs npx (4 hours)

### Phase 3: Post-MVP (After V3 complete)
- **Month 2:**
  - [ ] Claude Skills/Plugins/Agents (6 hours)
  - [ ] Revisit Playwright MCP (if skipped earlier)

---

## Research Output Template

For each item, create:

```markdown
# [Research Item Name]

## Executive Summary
[2-3 sentence summary]

## Status
[Production Ready / Beta / Not Ready]

## Recommendation
[Integrate / Cherry-pick / Skip / Wait]

## If Integrating
- **When:** [Phase X]
- **How:** [Integration approach]
- **Effort:** [X hours]

## If Waiting
- **Revisit:** [Date]
- **Condition:** [What needs to happen]

## Notes
[Any additional context]
```

---

## Success Metrics

Research is successful if:
- [ ] All HIGH priority items researched before Phase 7
- [ ] Clear recommendations made for each item
- [ ] Integration plans documented (if adopting)
- [ ] V3 plan updated with findings
- [ ] No blocking unknowns remain

---

## Next Steps

1. **Assign Research Tasks**
   - [ ] ChemJungle → [Person]
   - [ ] Playwright MCP → [Person]
   - [ ] Vitest 4.0 → [Person]

2. **Schedule Research Time**
   - Block time in calendar
   - Set deadlines

3. **Create Research Branch**
   ```bash
   git checkout -b research/v3-investigations
   ```

4. **Document Findings**
   - Store in `/docs/implementation-plan_v3-ready-to-run/research/`

5. **Update V3 Plan**
   - Incorporate findings
   - Adjust phases if needed

---

**Research Lead:** [TBD]
**Review Date:** [TBD]
**Status:** Not Started
