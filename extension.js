'use strict';
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');

function activate(context) {
  var command = vscode.commands.registerCommand('extension.honest-agent.install', async function () {
    await runInstallWizard(context);
  });
  context.subscriptions.push(command);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

async function runInstallWizard(context) {

  // ── Step 1: Intro UI ────────────────────────────────────────────────────────
  var panel = vscode.window.createWebviewPanel(
    'honestAgentInstall',
    'Honest Agent — Install Conduct Rules',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  panel.webview.html = getIntroHtml();

  var userChoice = await new Promise(function (resolve) {
    panel.webview.onDidReceiveMessage(function (message) {
      resolve(message.command);
    }, undefined, context.subscriptions);
  });
  panel.dispose();

  if (userChoice !== 'continue') return;

  // ── Step 2: Resolve workspace root ─────────────────────────────────────────
  var workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      'Honest Agent: No workspace folder open. Please open a project folder first.'
    );
    return;
  }
  var projectRoot = workspaceFolders[0].uri.fsPath;
  var extensionRoot = context.extensionPath;
  var results = [];

  // ── Step 3: Create required folders ────────────────────────────────────────
  ensureDir(path.join(projectRoot, '.claude'));
  ensureDir(path.join(projectRoot, '.github'));
  ensureDir(path.join(projectRoot, '.github', 'skills'));
  ensureDir(path.join(projectRoot, '.github', 'skills', '-agent-conduct-rule-report'));
  ensureDir(path.join(projectRoot, '.github', 'skills', '-agent-pre-response-gate'));

  // ── Step 4: AGENTS.md ──────────────────────────────────────────────────────
  var agentsMdDest = path.join(projectRoot, 'AGENTS.md');
  var conductRulesSrc = path.join(extensionRoot, 'AgentConductRules.md');
  var agentsMdSrc = path.join(extensionRoot, 'AGENTS.md');

  if (fs.existsSync(agentsMdDest)) {
    var appendContent = fs.readFileSync(conductRulesSrc, 'utf8');
    fs.appendFileSync(agentsMdDest, '\n\n' + appendContent, 'utf8');
    results.push('`AGENTS.md` — conduct rules appended to existing file.');
  } else {
    fs.copyFileSync(agentsMdSrc, agentsMdDest);
    results.push('`AGENTS.md` — created.');
  }

  // ── Step 5: CLAUDE.md ──────────────────────────────────────────────────────
  var claudeMdDest = path.join(projectRoot, '.claude', 'CLAUDE.md');
  var claudeMdSrc = path.join(extensionRoot, '.claude', 'CLAUDE.md');

  if (fs.existsSync(claudeMdDest)) {
    var claudeContent = fs.readFileSync(claudeMdDest, 'utf8');
    if (!claudeContent.includes('AGENTS.md')) {
      fs.appendFileSync(claudeMdDest, '\n@../AGENTS.md\n', 'utf8');
      results.push('`.claude/CLAUDE.md` — directive to `AGENTS.md` added to existing file.');
    } else {
      results.push('`.claude/CLAUDE.md` — already references `AGENTS.md`; no change made.');
    }
  } else {
    fs.copyFileSync(claudeMdSrc, claudeMdDest);
    results.push('`.claude/CLAUDE.md` — created.');
  }

  // ── Step 6: -agent-conduct-rule-report/SKILL.md ────────────────────────────
  var reportSkillDest = path.join(
    projectRoot, '.github', 'skills', '-agent-conduct-rule-report', 'SKILL.md'
  );
  var reportSkillSrc = path.join(
    extensionRoot, '.github', 'skills', '-agent-conduct-rule-report', 'SKILL.md'
  );

  if (fs.existsSync(reportSkillDest)) {
    var overwriteReport = await vscode.window.showWarningMessage(
      'Honest Agent: .github/skills/-agent-conduct-rule-report/SKILL.md already exists. Overwrite it?',
      'Yes', 'No'
    );
    if (overwriteReport === 'Yes') {
      fs.copyFileSync(reportSkillSrc, reportSkillDest);
      results.push('`.github/skills/-agent-conduct-rule-report/SKILL.md` — overwritten.');
    } else {
      results.push('`.github/skills/-agent-conduct-rule-report/SKILL.md` — skipped (existing file kept).');
    }
  } else {
    fs.copyFileSync(reportSkillSrc, reportSkillDest);
    results.push('`.github/skills/-agent-conduct-rule-report/SKILL.md` — created.');
  }

  // ── Step 7: -agent-pre-response-gate/SKILL.md ─────────────────────────────
  var gateSkillDest = path.join(
    projectRoot, '.github', 'skills', '-agent-pre-response-gate', 'SKILL.md'
  );
  var gateSkillSrc = path.join(
    extensionRoot, '.github', 'skills', '-agent-pre-response-gate', 'SKILL.md'
  );

  if (fs.existsSync(gateSkillDest)) {
    var overwriteGate = await vscode.window.showWarningMessage(
      'Honest Agent: .github/skills/-agent-pre-response-gate/SKILL.md already exists. Overwrite it?',
      'Yes', 'No'
    );
    if (overwriteGate === 'Yes') {
      fs.copyFileSync(gateSkillSrc, gateSkillDest);
      results.push('`.github/skills/-agent-pre-response-gate/SKILL.md` — overwritten.');
    } else {
      results.push('`.github/skills/-agent-pre-response-gate/SKILL.md` — skipped (existing file kept).');
    }
  } else {
    // Copy and reset Bootstrap Status so the gate self-activates in the target project
    var gateContent = fs.readFileSync(gateSkillSrc, 'utf8');
    gateContent = gateContent.replace('Status: bootstrapped', 'Status: waiting');
    fs.writeFileSync(gateSkillDest, gateContent, 'utf8');
    results.push(
      '`.github/skills/-agent-pre-response-gate/SKILL.md` — created (Bootstrap Status set to `waiting`).'
    );
  }

  // ── Step 8: Completion UI ──────────────────────────────────────────────────
  var completionPanel = vscode.window.createWebviewPanel(
    'honestAgentComplete',
    'Honest Agent — Installation Complete',
    vscode.ViewColumn.One,
    {}
  );
  completionPanel.webview.html = getCompletionHtml(results);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getIntroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline';">
  <title>Honest Agent</title>
  <style>
    body { font-family: var(--vscode-font-family); padding: 24px 32px; max-width: 640px; }
    h1   { font-size: 1.4em; margin-bottom: 0.4em; }
    p, li { line-height: 1.6; }
    .actions { margin-top: 28px; display: flex; gap: 12px; }
    button { padding: 8px 20px; font-size: 1em; cursor: pointer; border: none; border-radius: 3px; }
    .btn-continue {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .btn-continue:hover { background: var(--vscode-button-hoverBackground); }
    .btn-cancel {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .btn-cancel:hover { background: var(--vscode-button-secondaryHoverBackground); }
    code {
      background: var(--vscode-textCodeBlock-background);
      padding: 1px 4px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
  </style>
</head>
<body>
  <h1>Honest Agent — Install Conduct Rules</h1>
  <p>This extension installs agent conduct rules and enforcement structure into your current project.</p>
  <p>The following files will be added:</p>
  <ul>
    <li><code>AGENTS.md</code> — conduct rules for Copilot and Claude agents</li>
    <li><code>.claude/CLAUDE.md</code> — Claude agent configuration pointing to AGENTS.md</li>
    <li><code>.github/skills/-agent-conduct-rule-report/SKILL.md</code> — conduct report skill</li>
    <li><code>.github/skills/-agent-pre-response-gate/SKILL.md</code> — pre-response gate skill</li>
  </ul>
  <p>If any of these files already exist, you will be prompted before any overwrite occurs.</p>
  <div class="actions">
    <button class="btn-continue" onclick="proceed()">Continue</button>
    <button class="btn-cancel"   onclick="cancel()">Cancel</button>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    function proceed() { vscode.postMessage({ command: 'continue' }); }
    function cancel()  { vscode.postMessage({ command: 'cancel' }); }
  </script>
</body>
</html>`;
}

function getCompletionHtml(results) {
  var resultItems = results
    .map(function (r) { return '<li>' + r + '</li>'; })
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
  <title>Honest Agent — Complete</title>
  <style>
    body { font-family: var(--vscode-font-family); padding: 24px 32px; max-width: 640px; }
    h1   { font-size: 1.4em; margin-bottom: 0.4em; }
    h2   { font-size: 1.1em; margin-top: 24px; margin-bottom: 6px; }
    p, li { line-height: 1.6; }
    code {
      background: var(--vscode-textCodeBlock-background);
      padding: 1px 4px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
    .result-list {
      background: var(--vscode-textBlockQuote-background);
      padding: 12px 20px;
      border-radius: 4px;
      border-left: 3px solid var(--vscode-activityBarBadge-background);
    }
  </style>
</head>
<body>
  <h1>Installation Complete</h1>

  <h2>What was done</h2>
  <div class="result-list">
    <ul>
        ${resultItems}
    </ul>
  </div>

  <h2>Apply changes to Copilot</h2>
  <p>
    Run <code>/clear</code> in a Copilot Chat window to reload agent instructions
    and apply the new conduct rules to future prompts.
  </p>

  <h2>Generate an Agent Conduct Rule Report</h2>
  <p>After a Copilot or Claude session, ask the agent:</p>
  <p><code>Generate an agent conduct rule report</code></p>
  <p>
    The agent will read the session violation log and produce a dated report file
    in <code>ClaudeConductRulesEffect/</code> at your project root.
  </p>
</body>
</html>`;
}
