# Honest Agent

Source content repository for the Honest Agent VS Code extension — AI agent conduct rules and enforcement structure for GitHub Copilot and Claude.

## About This Repository

This repository contains the authoritative source files that the Honest Agent extension installs into projects. It is not the extension itself. The extension packages these files and deploys them into a user's project via the VS Code command palette.

## What Gets Installed Into a Project

| File | Purpose |
|---|---|
| `AGENTS.md` | The authoritative conduct rule set for all agents in the project |
| `.claude/CLAUDE.md` | Claude agent configuration — references `AGENTS.md` |
| `.github/skills/-agent-pre-response-gate/SKILL.md` | Two-phase gate that evaluates every agent response before delivery |
| `.github/skills/-agent-conduct-rule-report/SKILL.md` | Skill for generating a structured session conduct report |

If any of these files already exist in the target project, the extension prompts before overwriting.

## Repository Contents

| Path | Description |
|---|---|
| `AGENTS.md` | Full conduct rule set — the primary source file |
| `AgentConductRules.md` | Standalone conduct rules block (appended to existing AGENTS.md files) |
| `.github/skills/` | Skill source files deployed by the extension |
| `.claude/` | Claude-specific configuration source |
| `honest-agent-logos/` | Logo design samples |
| `Instructions to Create the Extension.md` | Build notes for the VS Code extension |

## Conduct Rule Set

The rule set embedded in `AGENTS.md` contains four components:

### Forbidden Rules — F-1 through F-22
22 actions that are prohibited in all circumstances, including:
- Fabricating explanations, diagnoses, or findings (F-2, F-4)
- Stating unconfirmed findings as confirmed (F-8)
- Applying fixes based on inferred diagnoses without disclosure (F-15)
- Modifying content outside requested scope without prior disclosure (F-10)
- Agreeing with user framing before performing independent evaluation (F-17)

### Avoid Patterns — A-1 through A-4
4 weak or misleading response patterns the agent must avoid, including sycophantic openers (A-4) and presenting assumptions as near-conclusions (A-2).

### Evidence Standards
Defines what counts as evidence-based versus unverified. Claims not meeting the standard must be labeled as unverified possibilities with a stated path to verification.

### Procedural Completeness
All steps in any defined procedure must be completed. Steps may not be skipped because they seem low-value or unlabeled as mandatory.

## Pre-Response Gate

The `-agent-pre-response-gate` skill enforces a two-phase gate on every agent turn:

| Phase | When | What |
|---|---|---|
| **Turn-Open Phase** | First tool call of the turn | Session setup (violation log on Turn 1) |
| **Pre-Delivery Phase** | Before every response is delivered | Evaluates the forming response against all F and A rules; re-drafts on failure |

The gate also maintains a session conduct violation log at `/memories/session/conduct-violations.md`, recording any violations detected and corrected during the session.

## Publisher

[VegaDiscoveries](https://github.com/VegaDiscoveries)
