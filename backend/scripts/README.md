# Backend Scripts

This directory contains utility scripts for database initialization, migration, and seeding.

---

## Quick Reference

| Script | Purpose | Run Once? |
|---|---|---|
| `initPlatformAdmin.js` | Create the first Platform Admin account | Yes (idempotent) |
| `migrate.js` | Convert String `userId` fields to ObjectId | Yes (idempotent) |
| `seed.js` | Populate default categories and cuisines | Yes (idempotent) |

**Recommended order for fresh deployment:**
```bash
node scripts/initPlatformAdmin.js  # 1. Create admin account
node scripts/seed.js               # 2. Seed categories and cuisines
node scripts/migrate.js            # 3. Migrate existing data (if any)
```

---

## Platform Admin Initialization

### Purpose
Creates the first Platform Admin (superadmin) account if one doesn't already exist.

### Usage

```bash
node scripts/initPlatformAdmin.js
```

Credentials are read **exclusively from environment variables** — no defaults are
hard-coded. Both `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` must be set
in your `.env` file (or exported in the shell) before running the script.

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `PLATFORM_ADMIN_EMAIL` | ✅ Yes | Email address for the Platform Admin account |
| `PLATFORM_ADMIN_PASSWORD` | ✅ Yes | Password (min 8 characters) |
| `PLATFORM_ADMIN_NAME` | No | Display name (default: "Platform Administrator") |

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` with your own values.
3. Run the script:
   ```bash
   node scripts/initPlatformAdmin.js
   ```

### What happens if a variable is missing?

The script exits immediately with a list of the missing variables and a reference to `.env.example`. No database connection is attempted.

### Safety Features

- **No hardcoded credentials** — all values come from environment variables.
- **Idempotent** — safe to run multiple times. If a superadmin already exists, the script reports it and exits without making changes.
- **Password hashing** — uses bcrypt with salt (same mechanism as the registration endpoint).
- **Exit codes** — returns `0` on success or when admin already exists, `1` on error.

### Sample Output

**First run (creates admin):**
```
✓ Connected to MongoDB

✓ Platform Admin created successfully!
  Email: admin@yourdomain.com
  Name:  Platform Administrator
  Role:  superadmin
  ID:    65f8a2b3c4d5e6f7a8b9c0d1

  You can now log in to the Admin dashboard with the credentials you provided.

✓ Disconnected from MongoDB
```

**Subsequent runs (admin already exists):**
```
✓ Connected to MongoDB
✓ Platform Admin already exists:
  Email: admin@yourdomain.com
  Name:  Platform Administrator
  Created: 2024-03-15T10:30:45.123Z

No action taken. Script is idempotent.
```

**Missing environment variable:**
```
[FATAL] Missing required environment variables:
  - PLATFORM_ADMIN_EMAIL
  - PLATFORM_ADMIN_PASSWORD

Set these variables in your .env file before running this script.
See .env.example for reference.
```

### Security Best Practices

1. **Never commit `.env`** to version control (it is in `.gitignore`).
2. **Use a strong password** — uppercase, lowercase, numbers, and special characters.
3. **Use `.env.example`** as the committed reference for required variables (placeholder values only).
4. **Run this script only once** per environment (development, staging, production).

### When to Use

- **Initial setup** — run once when setting up a new environment.
- **Fresh database** — run after dropping/recreating the database.
- **Recovery** — run if the Platform Admin account is accidentally deleted.

### Troubleshooting

**Error: "Missing required environment variables"**
- Check your `.env` file and ensure `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` are set.

**Error: "Password must be at least 8 characters long"**
- Set `PLATFORM_ADMIN_PASSWORD` to a value with 8 or more characters.

**Connection errors:**
- Verify your `MONGODB_URI` is correct and reachable.

---

## Migration Script — `migrate.js`

### Purpose
Converts `userId` fields in `orders`, `favorites`, and `reviews` collections from String to ObjectId, so they properly reference `userModel` documents.

### Why This Is Needed
The original schema stored `userId` as a plain String. The multi-restaurant refactoring changed the intended type to `ObjectId` for proper Mongoose population and query scoping. This script performs the one-time data conversion.

### Usage

```bash
node scripts/migrate.js
```

### What It Does

For each collection (`orders`, `favorites`, `reviews`):
1. Reads all documents
2. Checks if `userId` is a String that looks like a 24-char hex ObjectId
3. If yes and the user exists → converts to ObjectId using `$set`
4. If yes but no matching user → logs a warning, leaves unchanged
5. If already an ObjectId → skips (idempotent)

### Safety Guarantees

- **Idempotent**: Running twice produces zero changes on second run
- **Non-destructive**: Never deletes or overwrites any field except `userId` type
- **Graceful warnings**: Unresolvable IDs are warned about and left untouched
- **Exit code 0**: Always exits 0 on completion (even with warnings)
- **Exit code 1**: Only on unexpected fatal error

### Sample Output

**First run (with data to convert):**
```
Connecting to MongoDB...
✓ Connected

Loading user IDs...
✓ Found 42 user(s)

─── Migrating orders ────────────────────────────────
  Converted : 123
  Already ObjectId (skipped): 0
  Unresolvable (warned): 2

─── Migrating favorites ─────────────────────────────
  Converted : 87
  Already ObjectId (skipped): 0
  Unresolvable (warned): 0

─── Migrating reviews ───────────────────────────────
  Converted : 34
  Already ObjectId (skipped): 0
  Unresolvable (warned): 0

═══ Migration complete ══════════════════════════════
  Total documents converted : 244
  Total warnings            : 2

  ⚠  Some userId fields could not be resolved — see warnings above.
     These documents were left unchanged and are safe to investigate manually.

✓ Disconnected from MongoDB
```

**Second run (idempotent — nothing to do):**
```
─── Migrating orders ────────────────────────────────
  Converted : 0
  Already ObjectId (skipped): 125
  Unresolvable (warned): 0
...
  Total documents converted : 0
```

### When to Run
- Once, after deploying the multi-restaurant backend to an environment that has existing data
- Safe to run before or after the server is live (uses standard Mongoose `updateOne`)

---

## Seed Script — `seed.js`

### Purpose
Connects to MongoDB and prepares collections. Currently configured empty to allow 100% clean initialization where all categories and cuisines are managed dynamically directly from the Platform Administrator Panel.

### Usage

```bash
node scripts/seed.js
```

### Clean Initial State
By default, the seed arrays inside `seed.js` are empty to ensure a clean slate setup. If you wish to pre-populate custom default categories or cuisines during deployment, edit the `DEFAULT_CATEGORIES` and `DEFAULT_CUISINES` constants directly inside `backend/scripts/seed.js` before executing the script.

### Safety Guarantees

- **Idempotent**: Checks `countDocuments()` before inserting; if collection is non-empty, skips entirely
- **Non-destructive**: Never modifies existing documents
- **Exit code 0**: Always exits 0 on completion


### When to Run
- Once, when setting up a new environment
- Before Restaurant Managers start tagging their restaurants with cuisines
- Before the Admin frontend tries to render the category/cuisine management pages
