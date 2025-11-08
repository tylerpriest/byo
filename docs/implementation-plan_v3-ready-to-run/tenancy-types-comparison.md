# Multi-Tenancy Types - Complete Comparison

**Date:** 2025-01-07
**Purpose:** Compare all tenancy patterns for SaaS applications
**Context:** Tutoring platform decision (tutors with students)

---

## 🏗️ The 3 Main Tenancy Types

### **Type 1: Shared Database, Shared Schema**
### **Type 2: Shared Database, Separate Schema**
### **Type 3: Separate Database per Tenant**

---

## 📊 Type 1: Shared Database, Shared Schema (Row-Level Isolation)

### Architecture

```
┌─────────────────────────────────────┐
│   Database: tutoring_platform_prod  │
├─────────────────────────────────────┤
│                                     │
│  organizations table                │
│  ┌────────────────────────────┐    │
│  │ id: org-1 | Ms. Smith      │    │
│  │ id: org-2 | Mr. Jones      │    │
│  │ id: org-3 | Dr. Brown      │    │
│  └────────────────────────────┘    │
│                                     │
│  lessons table                      │
│  ┌────────────────────────────┐    │
│  │ id: 1 | org_id: org-1 | ... │    │
│  │ id: 2 | org_id: org-2 | ... │    │
│  │ id: 3 | org_id: org-1 | ... │    │
│  └────────────────────────────┘    │
│                                     │
│  students table                     │
│  ┌────────────────────────────┐    │
│  │ id: 1 | org_id: org-1 | ... │    │
│  │ id: 2 | org_id: org-2 | ... │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### How It Works

```sql
-- Every table has organization_id
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT,
  content TEXT,
  created_at TIMESTAMP
);

-- RLS policy enforces isolation
CREATE POLICY "Users see only their org's lessons"
ON lessons FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- When Ms. Smith queries:
SELECT * FROM lessons; -- She only sees org-1 lessons
-- RLS automatically adds: WHERE organization_id = 'org-1'
```

### Pros ✅

| Benefit | Details |
|---------|---------|
| **Cost** | One database = lowest cost |
| **Simplicity** | Single codebase, single deployment |
| **Development Speed** | Fastest to build and iterate |
| **Cross-Tenant Analytics** | Easy to query across all tutors |
| **Maintenance** | One schema to update |
| **Backup** | Single backup covers everyone |
| **Search** | Full-text search across all data |
| **Migrations** | Run once, affects everyone |

### Cons ❌

| Risk | Details |
|------|---------|
| **Data Leakage Risk** | RLS bugs could expose data |
| **Noisy Neighbor** | One tutor's heavy usage affects others |
| **Scaling Limits** | Single DB performance ceiling |
| **Customization** | Can't customize per tutor easily |
| **Compliance** | Some regulations require physical isolation |
| **Blast Radius** | Database issue affects all tutors |

### Cost Breakdown

```
Supabase Pro: $25/month (up to 100,000 rows)
- 100 tutors × 50 students = 5,000 users ✅
- Lessons, assignments, etc. = ~50,000 rows ✅
- Total: $25/month

Break-even point: ~1000 tutors
```

### Best For

- ✅ Early-stage startups (0-1000 customers)
- ✅ SMB SaaS ($10-100/month per customer)
- ✅ B2B2C platforms (your tutoring platform)
- ✅ Cost-sensitive products
- ✅ Rapid development needs

### Examples Using This

- GitHub (early days)
- Slack (early days)
- Linear
- Notion (early days)
- **Your tutoring platform** ← Recommended

### Security Considerations

**Critical: RLS must be perfect**

```sql
-- ❌ DANGEROUS: No RLS policy
CREATE TABLE lessons (...);
-- Anyone can see all lessons!

-- ✅ SAFE: RLS enforced
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON lessons
USING (organization_id IN (SELECT ...));
-- Users only see their org's data

-- ✅ EXTRA SAFE: Test in CI/CD
-- Write tests that try to access other org's data
-- Should fail if RLS is working
```

---

## 📊 Type 2: Shared Database, Separate Schema (Schema-Level Isolation)

### Architecture

```
┌─────────────────────────────────────┐
│   Database: tutoring_platform_prod  │
├─────────────────────────────────────┤
│                                     │
│  Schema: org_ms_smith               │
│  ┌────────────────────────────┐    │
│  │  lessons table             │    │
│  │  students table            │    │
│  │  assignments table         │    │
│  └────────────────────────────┘    │
│                                     │
│  Schema: org_mr_jones               │
│  ┌────────────────────────────┐    │
│  │  lessons table             │    │
│  │  students table            │    │
│  │  assignments table         │    │
│  └────────────────────────────┘    │
│                                     │
│  Schema: public (shared)            │
│  ┌────────────────────────────┐    │
│  │  organizations table       │    │
│  │  users table               │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### How It Works

```sql
-- Create schema per organization
CREATE SCHEMA org_ms_smith;
CREATE SCHEMA org_mr_jones;

-- Each schema has identical structure
CREATE TABLE org_ms_smith.lessons (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT
);

CREATE TABLE org_mr_jones.lessons (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT
);

-- Application sets search_path per request
SET search_path TO org_ms_smith;
SELECT * FROM lessons; -- Only Ms. Smith's lessons

SET search_path TO org_mr_jones;
SELECT * FROM lessons; -- Only Mr. Jones's lessons
```

### Pros ✅

| Benefit | Details |
|---------|---------|
| **Better Isolation** | Physical separation within DB |
| **Per-Tenant Backup** | Restore one tutor without affecting others |
| **Per-Tenant Customization** | Can add custom columns for specific tutors |
| **Easier Compliance** | Better for some regulations |
| **Performance Isolation** | Heavy usage in one schema doesn't affect others as much |
| **Easier to Migrate** | Can move one schema to new DB |

### Cons ❌

| Risk | Details |
|------|---------|
| **Complex Schema Management** | Must create schema for each new tutor |
| **Migrations Complexity** | Run migration × number of tutors |
| **Cross-Tenant Queries Hard** | Need UNION across all schemas |
| **Higher Cost** | Each schema has overhead |
| **Not Supabase Native** | Would need custom implementation |
| **Backup Complexity** | More complex to backup all schemas |

### Cost Breakdown

```
Supabase Pro: $25/month (100,000 rows)
- 100 schemas × overhead = higher memory usage
- May need to upgrade sooner
- Total: $25-50/month

Break-even point: Similar to Type 1, but more overhead
```

### Best For

- ✅ Mid-size B2B SaaS (100-1000 customers)
- ✅ Regulated industries (healthcare, finance)
- ✅ Enterprise customers needing isolation
- ✅ When per-tenant customization needed
- ❌ Not for your tutoring platform (too complex for MVP)

### Examples Using This

- Heroku Postgres (multi-tenant addon pattern)
- Some legacy enterprise SaaS
- WordPress.com (sort of - uses table prefixes)

### Implementation Complexity

```typescript
// Must set schema per request
app.use(async (req, res, next) => {
  const orgId = req.user.organizationId
  const schema = `org_${orgId}`

  // Set schema for this request
  await db.query(`SET search_path TO ${schema}`)

  next()
})

// Migrations must run per schema
async function migrateAll() {
  const orgs = await getOrganizations()

  for (const org of orgs) {
    await db.query(`SET search_path TO org_${org.id}`)
    await runMigration()
  }
}
```

---

## 📊 Type 3: Separate Database per Tenant (Database-Level Isolation)

### Architecture

```
┌─────────────────────────┐
│ Database: ms_smith_prod │
├─────────────────────────┤
│  lessons table          │
│  students table         │
│  assignments table      │
└─────────────────────────┘

┌─────────────────────────┐
│ Database: mr_jones_prod │
├─────────────────────────┤
│  lessons table          │
│  students table         │
│  assignments table      │
└─────────────────────────┘

┌─────────────────────────┐
│ Database: dr_brown_prod │
├─────────────────────────┤
│  lessons table          │
│  students table         │
│  assignments table      │
└─────────────────────────┘

┌─────────────────────────┐
│  Master DB: metadata    │
├─────────────────────────┤
│  tenants table          │
│  (routing info)         │
└─────────────────────────┘
```

### How It Works

```typescript
// Master database stores routing
const tenants = {
  'ms-smith': {
    dbUrl: 'postgres://ms-smith-db.supabase.co',
    dbKey: 'smith-anon-key'
  },
  'mr-jones': {
    dbUrl: 'postgres://mr-jones-db.supabase.co',
    dbKey: 'jones-anon-key'
  }
}

// Route to correct database
function getTenantDb(orgId) {
  const tenant = tenants[orgId]
  return createClient(tenant.dbUrl, tenant.dbKey)
}

// Each request uses different DB
const db = getTenantDb(req.user.organizationId)
const lessons = await db.from('lessons').select()
```

### Pros ✅

| Benefit | Details |
|---------|---------|
| **Complete Isolation** | Physically separate databases |
| **Maximum Security** | No risk of cross-tenant data leakage |
| **Per-Tenant Versioning** | Can run different app versions per tutor |
| **Dedicated Resources** | No noisy neighbor problem |
| **Easy to Scale** | Add more databases as needed |
| **Custom Features** | Specific tutors can have custom schema |
| **White-Label Ready** | Easy to give tutors their own subdomain/DB |
| **Compliance** | Meets strictest regulations (HIPAA, etc.) |

### Cons ❌

| Risk | Details |
|------|---------|
| **Extremely Expensive** | 100 tutors = 100 databases × $25 = $2,500/month! |
| **Complex Management** | Provisioning, monitoring, backups per DB |
| **Migration Nightmare** | Must run migration 100 times |
| **Cross-Tenant Analytics Impossible** | Can't analyze across all tutors easily |
| **Slow Onboarding** | Creating new database takes time |
| **Operational Overhead** | Need automation for everything |
| **Hard to Debug** | Issues affect one tutor at a time |

### Cost Breakdown

```
Supabase Pro: $25/month per project

Scenario 1: 10 tutors
- 10 databases × $25 = $250/month 💸

Scenario 2: 100 tutors
- 100 databases × $25 = $2,500/month 💸💸💸

Scenario 3: 1000 tutors
- 1000 databases × $25 = $25,000/month 💸💸💸💸💸

Break-even point: Only if tutors pay $100+/month
```

### Best For

- ✅ Enterprise SaaS (customers pay $10K+/month)
- ✅ White-label platforms (tutors want branded DB)
- ✅ Highly regulated industries (HIPAA, PCI, SOC2)
- ✅ When customers demand physical isolation
- ❌ **NOT for your tutoring platform** (way too expensive)

### Examples Using This

- Heroku (separate Postgres per app)
- MongoDB Atlas (dedicated clusters)
- White-label platforms
- Healthcare SaaS (patient data)
- Financial platforms

### Implementation Complexity

```typescript
// Tenant provisioning system needed
async function createNewTutor(tutorEmail) {
  // 1. Create new Supabase project (API call)
  const project = await supabase.management.createProject({
    name: `tutor-${tutorEmail}`,
    region: 'us-east-1'
  })

  // 2. Run all migrations on new DB
  await runMigrations(project.dbUrl)

  // 3. Store routing info
  await masterDb.tenants.insert({
    email: tutorEmail,
    dbUrl: project.dbUrl,
    dbKey: project.anonKey
  })

  // 4. Wait for provisioning (minutes)
  await waitForReady(project.id)

  // Total time: 5-10 minutes per tutor!
}
```

---

## 🆚 Side-by-Side Comparison

### Cost Comparison (100 Tutors)

| Type | Monthly Cost | Cost per Tutor | Break-Even |
|------|-------------|----------------|------------|
| **Type 1: Shared DB** | $25-50 | $0.25-0.50 | Any price point ✅ |
| **Type 2: Separate Schema** | $50-100 | $0.50-1.00 | $10+/month ✅ |
| **Type 3: Separate DB** | $2,500 | $25.00 | $50+/month ❌ |

### Development Time (Initial Build)

| Type | Time | Complexity |
|------|------|------------|
| **Type 1** | 2-3 hours | Low ✅ |
| **Type 2** | 6-8 hours | Medium |
| **Type 3** | 15-20 hours | High ❌ |

### Scaling Comparison

| Type | 10 Tutors | 100 Tutors | 1000 Tutors | 10,000 Tutors |
|------|-----------|------------|-------------|---------------|
| **Type 1** | ✅ Perfect | ✅ Great | ⚠️ Upgrade DB | ❌ Need Type 2/3 |
| **Type 2** | ⚠️ Overkill | ✅ Good | ✅ Great | ⚠️ Upgrade DB |
| **Type 3** | ❌ Too complex | ⚠️ Expensive | ✅ Scales | ✅ Scales |

### Feature Comparison

| Feature | Type 1 | Type 2 | Type 3 |
|---------|--------|--------|--------|
| **Cross-tenant analytics** | ✅ Easy | ⚠️ Hard | ❌ Nearly impossible |
| **Per-tenant customization** | ❌ Limited | ✅ Good | ✅ Complete |
| **Data isolation** | ⚠️ RLS | ✅ Schema | ✅ Physical |
| **Backup/restore** | ✅ One backup | ⚠️ Per schema | ⚠️ Per DB |
| **Migrations** | ✅ Once | ⚠️ Per schema | ❌ Per DB |
| **Onboarding speed** | ✅ Instant | ✅ Seconds | ❌ Minutes |
| **Cost** | ✅ Cheap | ⚠️ Medium | ❌ Expensive |

---

## 🎯 Decision Matrix for Your Tutoring Platform

### Current Situation
- Early stage ✅
- 0 tutors (pre-launch) ✅
- Limited budget ✅
- Need to iterate fast ✅
- No enterprise customers yet ✅

### Projected Growth
- Year 1: 10-50 tutors
- Year 2: 50-200 tutors
- Year 3: 200-1000 tutors

### Recommendation: **Type 1 (Shared Database)**

**Why:**

| Factor | Type 1 | Decision |
|--------|--------|----------|
| **Cost** | $25-50/month for 100 tutors | ✅ Affordable |
| **Speed** | 2-3 hours to build | ✅ Fast to market |
| **Complexity** | Low, easy to maintain | ✅ Small team OK |
| **Scalability** | Good up to 1000 tutors | ✅ Covers Year 1-3 |
| **Security** | RLS + tests = safe | ✅ Adequate |
| **Analytics** | Easy to analyze across tutors | ✅ Important |

### Migration Path

**Year 1-2: Type 1**
- All tutors on shared DB
- RLS isolation
- $25-50/month

**Year 2-3: Hybrid (Type 1 + Type 3)**
- Most tutors stay Type 1
- Enterprise tutors ($100+/month) → Type 3
- Gives upsell option

**Year 3+: Full Type 3**
- Only if hitting scale limits
- Or regulatory requirements

---

## 🔄 Hybrid Approaches

### Approach 1: Tiered Tenancy

```
Free/Pro Tutors → Type 1 (Shared DB)
    ↓
Enterprise Tutors → Type 3 (Dedicated DB)
```

**Pricing:**
- Free: $0 (shared DB, 10 students)
- Pro: $19/month (shared DB, 50 students)
- Enterprise: $199/month (dedicated DB, unlimited students, custom features)

**Benefits:**
- Most tutors are cheap (Type 1)
- High-paying tutors get isolation (Type 3)
- Upsell path is clear

---

### Approach 2: Geographic Sharding

```
US Tutors → Database: us-east-1 (Type 1)
EU Tutors → Database: eu-west-1 (Type 1)
APAC Tutors → Database: ap-south-1 (Type 1)
```

**Benefits:**
- Better performance (closer to users)
- Data residency compliance (GDPR)
- Still Type 1 within each region

---

### Approach 3: Growth-Based Migration

```
Start: Type 1 (all tutors shared)
    ↓
At 500 tutors: Split to Type 2 (new tutors get schemas)
    ↓
At 2000 tutors: Offer Type 3 for enterprise
```

**Benefits:**
- Start simple
- Migrate as you grow
- Keep costs low initially

---

## 🛠️ Implementation Guide for Type 1

### Step 1: Database Schema

```sql
-- Core isolation pattern
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT,
  plan TEXT
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  -- All other columns
);

-- RLS enforcement
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation"
ON lessons FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

### Step 2: Application Code

```typescript
// Every query automatically filtered by RLS
const lessons = await supabase
  .from('lessons')
  .select('*')
// RLS adds: WHERE organization_id IN (user's orgs)

// No need to manually filter!
// RLS handles it at database level
```

### Step 3: Testing

```typescript
// Test RLS isolation
describe('Data Isolation', () => {
  it('tutors cannot see other tutors lessons', async () => {
    const tutor1 = await createTutor()
    const tutor2 = await createTutor()

    const lesson = await createLesson(tutor1.orgId)

    // Try to access as tutor2
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lesson.id)

    expect(data).toHaveLength(0) // Should be empty!
  })
})
```

---

## 📋 Summary Table

| Criteria | Type 1 | Type 2 | Type 3 |
|----------|--------|--------|--------|
| **Best For** | Startups, SMB SaaS | Mid-size B2B | Enterprise, White-label |
| **Cost (100 tutors)** | $25-50/mo | $50-100/mo | $2,500/mo |
| **Build Time** | 2-3 hours | 6-8 hours | 15-20 hours |
| **Complexity** | Low ✅ | Medium | High ❌ |
| **Scalability** | 0-1000 ✅ | 100-5000 | Unlimited |
| **Security** | RLS ⚠️ | Schema ✅ | Physical ✅✅ |
| **Your Platform** | ✅ **Recommended** | Maybe later | No ❌ |

---

## 🎯 Final Recommendation

### For Your Tutoring Platform: **Type 1**

**Start with:**
- Shared database (Supabase)
- organization_id on all tables
- RLS policies for isolation
- Test RLS thoroughly (30% coverage)

**Migrate later (if needed):**
- At 1000 tutors → Consider Type 2 for new tutors
- Enterprise tier → Offer Type 3 at $199+/month

**This gives you:**
- ✅ Fastest time to market
- ✅ Lowest cost
- ✅ Simplest to maintain
- ✅ Easy to iterate
- ✅ Scalable to 1000 tutors
- ✅ Migration path when needed

**Phase 14 design already follows Type 1** ✅
