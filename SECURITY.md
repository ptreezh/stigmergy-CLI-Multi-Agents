# Security Policy

## Supported Versions

Security fixes are applied to the latest published release. Please make sure you
are testing against the most recent version before reporting an issue.

| Version          | Supported          |
| ---------------- | ------------------ |
| latest release   | :white_check_mark: |
| older releases   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using one of the following:

1. GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
   for this repository, or
2. Email the maintainer at **shurenzhang631@gmail.com**.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept if possible)
- Affected version(s) and environment (OS, Node.js version)
- Any suggested remediation

## What to expect

- We will acknowledge your report within 7 days.
- We will investigate and keep you informed of progress.
- We will credit you in the release notes once the issue is resolved, unless you
  prefer to remain anonymous.

## Scope

Stigmergy is a local orchestration layer for AI CLI tools. Areas of particular
interest include:

- Command execution / injection through the gateway or adapters
- Handling of untrusted input from message platforms (Feishu, Telegram, Slack, Discord)
- Credential or token handling in configuration and hook deployment
- Dependency vulnerabilities introduced by the project

## Safe harbor

We will not take legal action against researchers who discover and report
vulnerabilities responsibly, in accordance with this policy.
