# Addendum to Ready-to-Run Implementation Plan

**Purpose:** Enhanced guidance integrating insights from notes.md
**Target Document:** `/docs/prompts/ready-to-run.md`
**Version:** 2.0 (Concise)

---

## Working with AI Agents

**Insert BEFORE Phase 1**

### Task Lifecycle & Specs

**Directory Structure:**
```
/docs/tasks/
  /draft/      - Planned work
  /active/     - In progress
  /complete/   - Archived
  /template/   - Reusable patterns
```

**Spec Template:**
```markdown
# [Feature Name]
## What: [1-2 sentences]
## Why: [User need + business value]
## How: [Technical approach]
## Success Criteria: [Checklist]
## Dependencies: [What must exist first]
```

**Reference:** [github.com/steveyegge/beads](https://github.com/steveyegge/beads) for spec-driven development

### AI-Native Workflow

1. Human writes spec → `/docs/specs/[feature].md`
2. Human creates task → `/docs/tasks/draft/[feature].md`
3. AI reads spec + ready-to-run.md + relevant code
4. AI implements, writes tests, updates docs
5. Human reviews code, security, business logic
6. Human merges, AI archives to `/docs/tasks/complete/`

### Best Practices

**Do:**
- ✅ Write detailed specs
- ✅ Reference existing patterns
- ✅ Review AI code for security
- ✅ Update docs as AI implements

**Don't:**
- ❌ Give vague requirements
- ❌ Let AI make architectural decisions alone
- ❌ Skip code review
- ❌ Modify auth/payments without review

**Action Item:** Import task templates from ChemJungle project

---

## Phase Enhancements

### Phase 2: ShadCN MCP (Make Primary)

**Add after task 9:**

```markdown
10. **Configure ShadCN MCP server** (STANDARD, not optional)
    ```bash
    npx shadcn@latest mcp
    ```

    Enables:
    - AI component discovery
    - Automated installation
    - Pattern matching

    Troubleshooting: See MCP Authentication section below
```

### Phase 7: Testing Decision Framework

**Add to task 35:**

**When to Write Tests:**

| Priority | Scope |
|----------|-------|
| **✅ Always** | Auth, payments, RBAC, public APIs, security functions |
| **⚠️ Recommended** | Business logic, utilities, form validation, error handling |
| **⏭️ Optional** | Prototypes, spikes, simple components, config files |

**Vitest 4.0 Features:**
- Workspace mode (monorepos)
- Browser mode (real browser testing)
- In-source testing (tests alongside code)
- Benchmark mode (performance)
- Type testing (TypeScript checking)

**Playwright MCP:** Emerging (Nov 2025) - AI-assisted E2E testing, self-healing tests

### Phase 9: Documentation Decision Framework

**Add before task 47:**

**Before creating ANY document:**

1. **Update existing?** → Update, don't create new
2. **Is this SSOT?** → Make canonical, others link here
3. **Belongs in root?** → 99% no (only README, LICENSE, DEPLOYMENT, CLAUDE, CONTRIBUTING)
4. **What's the lifecycle?**
   - Architecture → `/docs/architecture.md`
   - Features → `/docs/features/[name].md`
   - Specs → `/docs/specs/[name].md`
   - Sessions → `/docs/prompts/session-summary-[topic].md`
   - Tasks → `/docs/tasks/[status]/[name].md`

**Anti-Patterns:**
- ❌ Duplicate info in multiple places
- ❌ Orphaned docs never updated
- ❌ Root folder full of markdown
- ❌ Docs contradicting code

---

## Infrastructure Decisions

### Docker vs npx supabase

| Factor | Docker | npx supabase |
|--------|--------|--------------|
| Setup | Medium (needs Docker) | Low (Node only) |
| Startup | ~30s | ~10s |
| Resources | Higher | Lower |
| Multi-project | Excellent | Good |
| Team skill | Varies | Higher (Node) |

**Current:** `npx supabase start` (simpler, faster)

**Switch to Docker when:**
- Team uses Docker extensively
- Need exact environment parity
- Multiple Supabase projects
- Complex orchestration needed

**Migration:**
```bash
# npx → Docker
npx supabase db dump > schema.sql
# Create docker-compose.yml
docker-compose up -d
docker exec -i supabase psql -U postgres < schema.sql
```

---

## AI Integration Guide

### Current MCPs

**ShadCN (Phase 2):**
```bash
npx shadcn@latest mcp
```
Enables AI component discovery and installation.

**GitHub (Optional):**
```bash
gh auth login
# Configure in Claude Desktop
```
Enables PR management, issue tracking.

### Future Integrations (Research)

**Status: Researching**
- Claude Skills - End-to-end feature implementation
- Claude Plugins - Build-time automation
- Claude Agents - Autonomous development
- Playwright MCP - AI-assisted E2E testing

**Action Items:**
- [ ] Test with this boilerplate
- [ ] Document patterns
- [ ] Create guidelines
- [ ] Monitor development

---

## User Onboarding System

**Add as Phase 12 or Tech Stack Addition**

### Onboarding by Role

**Admin:**
- Goal: Invite team, configure settings (< 10 min)
- Flow: Setup checklist → Invite users → Configure → Success

**Editor/Moderator:**
- Goal: Create first content (< 15 min)
- Flow: Tour → Create draft → Submit → Celebrate

**User:**
- Goal: Complete first action (< 5 min)
- Flow: Welcome → Tour → First action → Success

**Guest/Viewer:**
- Goal: Understand access, upgrade path
- Flow: Explain role → Show views → Upgrade path

### Implementation

**Database Schema:**
```sql
CREATE TABLE user_onboarding (
  user_id UUID PRIMARY KEY,
  profile_completed BOOLEAN DEFAULT FALSE,
  first_action_completed BOOLEAN DEFAULT FALSE,
  tutorial_viewed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Detection:**
```typescript
export async function isFirstLogin(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('created_at, last_login_at')
    .eq('id', userId)
    .single()

  return !data?.last_login_at
}
```

**Checklist Component:**
```typescript
<OnboardingChecklist items={[
  { id: 'profile', title: 'Complete profile', action: () => {} },
  { id: 'invite', title: 'Invite team', action: () => {} },
]} />
```

**In-App Tours:**
- Tool: react-joyride or Intro.js
- Keep short (5-10 min)
- Make skippable
- Role-based flows

### Email Sequences

- Day 0: Welcome + quick start
- Day 1: Feature highlight #1
- Day 3: Feature highlight #2
- Day 7: Progress summary
- Day 14: Feedback request
- Day 30: Milestone celebration

### Metrics

- Time to first login/action
- Onboarding completion rate
- Feature adoption rate
- Return rate (Day 1, 7, 30)

**Implementation Phases:**
1. **MVP:** First-time detection, welcome screen, basic checklist
2. **Enhanced:** In-app tour, role-based flows, email sequence
3. **Advanced:** Personalized flows, video tutorials, A/B testing

---

## MCP Authentication

### Common Issues

**MCP not found:**
```bash
# Check config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Should contain:
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn", "mcp"]
    }
  }
}
```

**Authentication failed:**
```bash
# Authenticate CLIs first
gh auth login
vercel login
npx supabase login

# Then restart Claude Desktop
```

**Components not appearing:**
- Verify components.json valid
- Check components in correct directory
- Restart Claude Desktop
- Clear conversation, start fresh

### MCPs Requiring Auth

| MCP | Auth Command | Verify |
|-----|--------------|--------|
| GitHub | `gh auth login` | `gh auth status` |
| Vercel | `vercel login` | `vercel whoami` |
| Supabase | `npx supabase login` | `npx supabase projects list` |
| ShadCN | No auth needed | `npx shadcn@latest --version` |

### Setup Checklist

- [ ] Install Claude Desktop
- [ ] Install Node.js 18+
- [ ] Install required CLIs
- [ ] Authenticate CLIs
- [ ] Configure claude_desktop_config.json
- [ ] Restart Claude Desktop
- [ ] Test MCP commands

---

## Research Action Items

**From notes.md - Track as Future Enhancements**

### High Priority
- [ ] ChemJungle task templates - Review and adapt
- [ ] Lachlan's project patterns - Study and document
- [ ] Claude Skills - Test integration

### Medium Priority
- [ ] Product management (beads framework)
- [ ] Playwright MCP - Monitor and test
- [ ] Docker infrastructure - Create docker-compose.yml

### Low Priority
- [ ] Claude Plugins research
- [ ] Claude Agents testing
- [ ] MCP auth automation script

---

## Quick Reference

### Decision Frameworks

**Testing:**
- Always: Auth, payments, RBAC, APIs
- Recommended: Business logic, forms
- Optional: Prototypes, simple components

**Documentation:**
1. Update existing? (don't create new)
2. Is this SSOT? (canonical)
3. Root folder? (99% no)
4. Lifecycle? (/docs/[type]/)

**Infrastructure:**
- Start: npx supabase (simpler)
- Scale: Docker (when team/projects grow)

### AI Workflow
Spec → Draft Task → AI Implements → Human Reviews → Merge → Archive

### Onboarding
First-time detection → Role-based flow → Checklist → Email sequence → Metrics

---

**Last Updated:** 2025-11-03
**Companion:** `/docs/prompts/ready-to-run.md`
