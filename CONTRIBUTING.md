# Contributing to Stigmergy CLI

Thanks for your interest in improving Stigmergy! This document explains how to
contribute in a way that keeps the project healthy and reviewable.

## Ways to contribute

- **Bug reports** — open an issue using the bug report template.
- **Feature requests** — open an issue using the feature request template.
- **Code** — submit a pull request against `main`.
- **Documentation** — improvements to README, docs, and inline examples are welcome.
- **Agent adapters** — add support for a new AI CLI tool via the adapter system.

## Development setup

```bash
# Clone
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# Install dependencies
npm install

# Build the TypeScript orchestration layer
npm run build:orchestration
```

## Before you open a pull request

Run the same checks CI runs:

```bash
npm run lint
npm run build:orchestration
npx jest tests/unit
```

A pull request is ready to review when:

- [ ] Lint passes (`npm run lint`)
- [ ] Build passes (`npm run build:orchestration`)
- [ ] Unit tests pass (`npx jest tests/unit`)
- [ ] New behavior has tests
- [ ] Public-facing docs are updated when behavior changes
- [ ] Commit messages follow the format below

## Commit message format

```
{type}: {description}
```

Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `release`.

Guidelines:

- Keep each commit focused on one logical change.
- Keep pull requests small; split large changes into reviewable pieces.
- Prefer extending existing code (config / plugin / hooks) over new subsystems.

## Code style

- JavaScript (CommonJS), UTF-8, LF line endings, 2-space indent, single quotes,
  semicolons required.
- No comments unless they explain complex logic.
- Never suppress type errors with `as any` / `@ts-ignore` / `@ts-expect-error`.
- Do not use empty `catch` blocks.

These rules are enforced by ESLint/Prettier. Run `npm run format` to format.

## Reporting security issues

Please **do not** open a public issue for security vulnerabilities. See
[SECURITY.md](./SECURITY.md) for the responsible-disclosure process.

## Code of Conduct

By participating you agree to abide by our
[Code of Conduct](./CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
