# Instructions to Create the Extension

## Background

An existing VS Code extension project exists at `C:\Development\VegaDiscoveries\VS Code - Extensions\MarkdownPDF`.

The user wants to create a new VS Code extension, using the MarkdownPDF project as a template.

The purpose of the new extension is to allow the user to add to a project the agent conduct rules and enforcement structure found in this project.

The conduct rules are inside `AGENTS.md` and are also self-contained in `AgentConductRules.md`.

---

## Process Instructions

1. Identify all necessary steps.
2. Create a tracked todo list.
3. Process each todo item to completion before starting the next item.

---

## What the Extension Should Do

1. **Present a UI** informing the user of what this extension does.
2. Allow the user to **Continue** or **Cancel**.
3. If **Continue**, proceed with the steps below.

---

## File Target Locations

| File | Location |
|------|----------|
| `AGENTS.md` | Project root |
| `CLAUDE.md` | `project root/.claude/` |
| `SKILL.md` (conduct-rule-report) | `project root/.github/skills/-agent-conduct-rule-report/` |
| `SKILL.md` (pre-response-gate) | `project root/.github/skills/-agent-pre-response-gate/` |

---

## Folder Creation

Create any of the following folders if they do not already exist:

- `.claude/`
- `.github/`
- `.github/skills/`
- `.github/skills/-agent-conduct-rule-report/`
- `.github/skills/-agent-pre-response-gate/`

---

## File Handling Logic

### `AGENTS.md`

- **If it already exists** — append the content of `AgentConductRules.md` to the existing file.
- **If it does not exist** — use the `AGENTS.md` file from this project.

### `CLAUDE.md`

- **If it already exists** — add a directive in `CLAUDE.md` pointing to `AGENTS.md`.
- **If it does not exist** — use the `CLAUDE.md` file from this project.

### `.github/skills/-agent-conduct-rule-report/SKILL.md`

- **If it already exists** — prompt the user: notify them the file already exists and ask for confirmation to overwrite it.
  - **Yes** — overwrite the existing file.
  - **No** — leave the existing file (the user may have modified it).
- **If it does not exist** — use the `SKILL.md` file from this project.

### `.github/skills/-agent-pre-response-gate/SKILL.md`

- **If it already exists** — prompt the user: notify them the file already exists and ask for confirmation to overwrite it.
  - **Yes** — overwrite the existing file.
  - **No** — leave the existing file (the user may have modified it).
- **If it does not exist** — use the `SKILL.md` file from this project, then:
  - Check the Bootstrap Status at the end of the file.
    - If `Status: bootstrapped` — change it to `Status: waiting`.
    - Otherwise — do nothing.

---

## Completion UI

Present a UI to the user informing them of what was done, including:

- Instruction to invoke `/clear` in a Copilot Chat window to apply the new changes to future prompts.
- Instructions on how to produce an **Agent Conduct Rule Report**.

