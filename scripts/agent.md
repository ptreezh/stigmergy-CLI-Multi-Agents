# scripts/ — Build, Deployment & Utility Scripts

Node.js scripts for automation, deployment, and analysis.

## Categories

| Prefix | Purpose |
|--------|---------|
| `auto-*.js` | Fully automated workflows (marketing, task runner, implementation) |
| `analyze-*.js` | Code analysis tools (router, package size) |
| `postinstall-*.js` | Post-install hooks |
| `*.js` | Utility scripts |

## Key Scripts

| Script | Purpose |
|--------|---------|
| `postinstall-deploy.js` | Deploys hooks to all CLI tool directories after install |
| `analyze-router.js` | Analyzes router-beta.js complexity |
| `analyze-package-size.js` | Reports package size distribution |

Most scripts are **event-driven** (run by hooks or npm scripts), not manually invoked.
