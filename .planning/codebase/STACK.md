# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- JavaScript (ES2020+) - Main implementation language for CLI tools and core logic
- TypeScript - Used in orchestration layer for type safety

**Secondary:**
- JSON - Configuration files, manifest, test configs
- TOML - Configuration files (cc-connect-config.toml)
- Bash - Shell scripts, postinstall deployment

## Runtime

**Environment:**
- Node.js >= 16.0.0 (minimum version from package.json engines)

**Package Manager:**
- npm (Node Package Manager)
- Lockfile: `package-lock.json` (generated automatically)

## Frameworks

**Core:**
- Commander.js ^14.0.2 - CLI command parsing and argument handling
- Inquirer.js ^8.2.6 - Interactive CLI prompts
- Chalk ^4.1.2 - Terminal string styling
- js-yaml ^4.1.1 - YAML parsing for config files

**Testing:**
- Jest ^30.2.0 - Test runner and assertion library
- Vitest - Used in openskills package
- Babel Jest - JavaScript transpilation for tests
- Playwright ^1.58.2 - Browser automation for E2E tests (optional peer dependency)

**Build/Dev:**
- TypeScript ^5.9.3 - TypeScript compilation
- ts-node ^10.9.2 - TypeScript execution in Node.js
- Babel ^7.28.6 - JavaScript transpilation
- ESLint ^9.39.2 - Linting
- Prettier ^3.7.4 - Code formatting
- Rimraf ^6.1.2 - Cross-platform file deletion

## Key Dependencies

**Critical:**
- `axios ^1.13.6` - HTTP client for API calls (gateway adapters, external requests)
- `semver ^7.7.3` - Semantic version parsing
- `cron-parser ^4.9.0` - Cron expression parsing
- `qrcode-terminal ^0.12.0` - Terminal-based QR code display (WeChat login)

**Infrastructure:**
- Wechaty ^1.20.2 - WeChat bot framework (optional peer dependency)
- wechaty-puppet-wechat ^1.18.4 - WeChat protocol implementation (optional peer dependency)
- file-box ^1.5.5 - File handling for WeChat (optional peer dependency)

**Overridden Dependencies (Security/Patching):**
- `minimatch ^10.2.4`
- `brace-expansion ^2.0.2`
- `picomatch ^4.0.3`

## Configuration

**Environment:**
- `.npmignore` - Package publish exclusions
- `.gitignore` - Git tracking exclusions
- Environment variables via `process.env`
- Config files: `gateway.json`, `cc-connect-config.toml`, `builtin-skills.json`, `predefined-skills.json`

**Build:**
- `tsconfig.json` - TypeScript configuration for general compilation
- `tsconfig.build.json` - TypeScript configuration for orchestration layer build (outputs to `dist/orchestration/`)
- `eslint.config.js` - ESLint configuration (ESLint v9 flat config format)
- `.prettierrc` - Prettier formatting rules
- `jest.config.js` - Jest test configuration (compiled to `dist/jest.config.js`)

**Script Entrypoints:**
- `src/index.js` - Main CLI entry point
- `src/cli/router-beta.js` - Modular command router (replaces old monolithic router)
- `bin/stigmergy` - CLI binary entry point
- `bin/stigmergy-gateway` - Gateway binary entry point

## Project Structure

```
stigmergy-CLI-Multi-Agents/
├── src/                          # Main source code
│   ├── index.js                 # Entry point
│   ├── cli/                     # CLI commands and routing
│   │   ├── router-beta.js       # Modular command router
│   │   └── commands/            # Command handlers (install, status, scan, skills, etc.)
│   ├── core/                    # Core functionality
│   │   ├── cli_tools.js         # CLI tool configurations and detection
│   │   ├── cli_path_detector.js  # CLI path detection and caching
│   │   ├── cli_adapters.js      # CLI parameter adapters
│   │   ├── soul_manager.js      # Soul lifecycle management
│   │   ├── soul_knowledge_base.js # Soul knowledge storage
│   │   ├── smart_router.js      # Intent analysis and CLI selection
│   │   ├── coordination/        # Cross-CLI coordination
│   │   └── skills/             # Skills management
│   ├── gateway/                 # IM gateway (multi-platform adapters)
│   │   ├── adapters/            # Platform-specific adapters
│   │   │   ├── feishu.js
│   │   │   ├── telegram.js
│   │   │   ├── slack.js
│   │   │   └── discord.js
│   │   ├── core/               # Core gateway logic
│   │   └── server.js           # HTTP server for webhooks
│   ├── orchestration/          # TypeScript orchestration layer
│   │   ├── core/               # Central orchestration logic
│   │   ├── managers/           # Task, git worktree, state managers
│   │   ├── events/             # Event bus system
│   │   ├── hooks/              # Hook system and installer
│   │   ├── integration/        # Resume session integration
│   │   └── wechat/            # WeChat integration
│   ├── adapters/               # AI CLI adapters
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwen/
│   │   ├── iflow/
│   │   └── ... (other CLI tools)
│   └── utils/                  # Utility functions
├── config/                     # Configuration files
│   ├── gateway.json           # Gateway server config
│   ├── cc-connect-config.toml # IM gateway config template
│   ├── builtin-skills.json    # Built-in skills
│   └── predefined-skills.json # Predefined skills
├── dist/                      # Compiled output
│   └── orchestration/         # Compiled TypeScript orchestration layer
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── e2e/                 # End-to-end tests
│   ├── automation/          # Automation tests
│   └── functional/          # Functional tests
├── scripts/                  # Build and utility scripts
│   ├── postinstall-deploy.js # Post-install hook deployment
│   └── run-tests.js         # Test runner
├── .gates/                  # Verification gate system
├── .planning/               # Planning documents
├── openskills/             # OpenSkills package
│   ├── vitest.config.ts
│   └── tsup.config.ts
├── worktrees/              # Worktree experiments
└── packages/              # Monorepo packages (packages/core, packages/mcp-server, etc.)

```

## Platform Requirements

**Development:**
- Node.js >= 16.0.0
- npm (comes with Node.js)
- Git (for version control and hooks)

**Production:**
- Node.js >= 16.0.0
- Supported OS: Windows, macOS, Linux (cross-platform CLI)
- Shell: Bash/Zsh (macOS/Linux), Git Bash/WSL (Windows)

## Key Build Commands

```bash
npm start                  # Run CLI
npm run build:orchestration # Compile TypeScript orchestration layer
npm run dev                # Development mode
npm run lint               # Linting with ESLint
npm run format             # Code formatting with Prettier
npm test                   # Run all tests
npm run test:unit          # Unit tests with coverage
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run gatekeeper         # Run verification gate
```

---

*Stack analysis: 2026-04-12*
