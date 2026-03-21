# Agent Mind — Configuration

## Project
- **Name:** {{PROJECT_NAME}}
- **Description:** {{PROJECT_DESCRIPTION}}
- **Created:** {{DATE}}

## Domains
Knowledge domains relevant to this project. Each domain listed here should have a folder in `knowledge/domains/`.

{{DOMAINS}}

## Stack
Technologies used in this project. Each entry can have a matching file in `knowledge/stack/`.

{{STACK}}

## Agent Preferences
- **Primary agent:** {{PRIMARY_AGENT}}
- **Thinking depth:** adaptive (scale protocol depth to task size)
- **Memory writes:** quality-gated (all writes to knowledge/ pass through protocols/quality-gate.md)
- **Maintenance frequency:** every 2 weeks or on request

## Project Context
Add project-specific context the agent should know across all sessions. Things like: architecture decisions, team conventions, important constraints, deployment targets.

(Add as the project progresses. Keep under 50 lines — this loads every session as hot memory.)

## Notes
- This file loads every session (hot tier). Keep it concise.
- For domain-specific knowledge, use `knowledge/domains/` instead.
- For tech-specific knowledge, use `knowledge/stack/` instead.
- This file is for project-wide context that doesn't fit elsewhere.
