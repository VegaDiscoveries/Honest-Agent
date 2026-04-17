# Honest Agent

A VS Code extension that installs agent conduct rules and enforcement structure into any project — for GitHub Copilot and Claude agents.

## What It Does

Running the **Honest Agent: Install Conduct Rules** command adds a structured conduct rule set and enforcement skills to your project. These files govern AI agent behavior across the project, covering both GitHub Copilot and Claude.

### Files Installed

| File | Purpose |
|---|---|
| `AGENTS.md` | The authoritative conduct rule set for all agents in the project |
| `.claude/CLAUDE.md` | Claude agent configuration — references `AGENTS.md` |
| `.github/skills/-agent-pre-response-gate/SKILL.md` | Two-phase gate that evaluates every agent response before delivery |
| `.github/skills/-agent-conduct-rule-report/SKILL.md` | Skill for generating a structured session conduct report |

If any of these files already exist, the extension prompts before overwriting.

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

## Usage

1. Open a project folder in VS Code
2. Open the Command Palette (`Ctrl+Shift+P`)
3. Run **Honest Agent: Install Conduct Rules**
4. Follow the installation wizard

## Requirements

- VS Code 1.0.0 or later
- A workspace folder must be open before running the install command

## Publisher

[VegaDiscoveries](https://github.com/VegaDiscoveries)
