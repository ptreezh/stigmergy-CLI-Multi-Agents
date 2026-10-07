# eb-edu Backend Development Workflow Skill

## Purpose

Standard workflow for adding routes/features to `f:\aa\stigmergy-eb-edu\medusa-backend`.
Prevents the 5 recurring mistakes from Phase 03.

## Activation

```
skill: eb-edu-backend-dev
```

## Workflow

### Step 1 — Schema changes (if any Prisma model changes)

```bash
# 1. Kill ALL backend instances FIRST (Windows DLL lock)
netstat -ano | grep ":9000 " | grep LISTENING | awk '{print $5}' | xargs -I{} taskkill //F //PID {}

# 2. Edit prisma/schema.prisma
# Add new models at the END (before closing the file)

# 3. Push schema + generate client
cd f:/aa/stigmergy-eb-edu/medusa-backend
npx prisma db push && npx prisma generate

# 4. Start backend in dev mode (transpile-only, not dist cache)
npx ts-node --transpile-only src/index.ts &
sleep 3
```

**CRITICAL**: `npm start` uses `dist/` compiled files. New `.ts` route files do NOT appear in `dist/`. Always use `npx ts-node --transpile-only`.

### Step 2 — Add route file

```bash
# Create src/routes/<name>.ts
# Follow pattern: schools.ts (inline async handlers, direct prisma calls, NO service layer)
```

### Step 3 — Register in src/index.ts

```typescript
import xxxRoutes from './routes/xxx';
// ...
app.use('/api/v1/xxx', xxxRoutes);
```

### Step 4 — Verify with curl (before CLI)

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:9000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# Test directly (bypasses CLI path issues)
curl http://localhost:9000/api/v1/your-route -H "Authorization: Bearer $TOKEN"
```

**Always curl direct first.** This catches route registration errors before debugging CLI path拼接 issues.

### Step 5 — CLI end-to-end test

```bash
EB_EDU_API_URL=http://localhost:9000/api/v1
eb-edu your-command args
```

## CLI API Path Mapping

| CLI command | eb_edu_cli.py path | Registered as |
|---|---|---|
| `medusa inventory check` | `/medusa/inventory` | `/api/v1/medusa/inventory` |
| `medusa inventory adjust` | `/medusa/inventory/adjust` | `/api/v1/medusa/inventory/adjust` |
| `medusa analytics sales` | `/medusa/analytics/sales` | `/api/v1/medusa/analytics/sales` |
| `medusa order cancel` | `/medusa/orders/:id/cancel` | `/api/v1/medusa/orders/:id/cancel` |
| `medusa order refund` | `/medusa/orders/:id/refund` | `/api/v1/medusa/orders/:id/refund` |
| `medusa shipping fulfill` | `/medusa/orders/:id/fulfill` | `/api/v1/medusa/orders/:id/fulfill` |

base_url in eb_edu_cli.py = `http://localhost:9000/api/v1`
CLI path is appended to base_url.

## Common Traps

### Trap 1: dist/ cache (npm start ≠ ts-node)

```
WRONG:  npm start  # uses dist/ — new ts files not loaded
RIGHT:  npx ts-node --transpile-only src/index.ts
```

### Trap 2: Prisma DLL lock (generate fails with EPERM)

```
WRONG:  npx prisma generate  # while backend is running
RIGHT:  taskkill all node processes on port 9000 first
```

### Trap 3: Python string escaping in code generators

```
WRONG:  content += "out = ['## test\\n']"  # \n becomes newline byte (0x0a)
RIGHT:  L.append("out = ['## test" + chr(92) + "n']")
BEST:   lines = []; lines.append("out = ['## test\\\\n']"); content = '\n'.join(lines)
```

Python interprets `"\\n"` as a newline character, not two literal chars.
Use `chr(92)` (backslash) + `chr(10)` (newline) for explicit control.

### Trap 4: Edit leaving orphaned syntax

```
WRONG:  Edit deletes middle of a try block but leaves res.json() lines outside
RIGHT:  Always Read the full file first, ensure old_string covers complete blocks
BEST:   For multi-line structural changes, Write the complete file
```

### Trap 5: Order operations require shared data

Order cancel/refund/fulfill live in `src/lib/mockData.ts` (shared `orders` array).
Import from there, do NOT redefine locally in `orders.ts` and `medusa.ts` separately.

## Backend Architecture

- Framework: Express + TypeScript + Prisma + SQLite
- Port: 9000 (default)
- Pattern: **No service layer** — route files contain inline async handlers
- Prisma called directly: `prisma.school.findMany()`, no intermediaries
- Auth: JWT via `authenticateToken` middleware, role check via `authorizeRoles()`
- Timestamp: `ts()` from `src/lib/prisma.ts` (returns `Date.now().toString()`)

## Testing Checklist

```
npx tsc --noEmit                        # Level 1: TS compile
curl http://localhost:9000/health       # Level 2: server alive
curl <new-route> with Bearer token       # Level 3: route registered
eb-edu <command>                        # Level 4: CLI end-to-end
# restart backend, re-test → data persisted # Level 5: persistence
```

## Files

- Backend root: `f:\aa\stigmergy-eb-edu\medusa-backend\`
- Entry: `src\index.ts`
- Schema: `prisma\schema.prisma`
- Routes: `src\routes\*.ts`
- Shared mock data: `src\lib\mockData.ts`
