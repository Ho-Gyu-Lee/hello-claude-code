#requires -Version 5.1
<#
.SYNOPSIS
  Deploy this repo's Claude Code config into ~/.claude (manual, single-track).
.DESCRIPTION
  Copies rules / agents / skills / references / hooks(*.mjs) / CLAUDE.md into
  $env:USERPROFILE\.claude, then merges mcp/servers.json into ~/.claude.json
  (user-scope MCP servers; only the mcpServers key is touched, .bak written).
  Does NOT touch settings.json -- merge hooks/settings.global.json into
  ~/.claude/settings.json yourself.
  Use -McpFrom <file> to import mcpServers (incl. secrets) from a .claude.json backup.
  Use -RemoveStale to also delete files obsoleted by the harness redesign.
  (ASCII-only on purpose: Windows PowerShell 5.1 misreads BOM-less UTF-8.)
.EXAMPLE
  .\deploy.ps1
  .\deploy.ps1 -RemoveStale
  .\deploy.ps1 -McpFrom "$env:USERPROFILE\Desktop\.claude.json"
#>
[CmdletBinding()]
param([switch]$RemoveStale, [string]$McpFrom)

$ErrorActionPreference = "Stop"
$repo = $PSScriptRoot
$dest = Join-Path $env:USERPROFILE ".claude"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

function Copy-Tree($name) {
  $src = Join-Path $repo $name
  if (-not (Test-Path $src)) { return }
  $dst = Join-Path $dest $name
  New-Item -ItemType Directory -Force -Path $dst | Out-Null
  Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force
  Write-Host "copied  $name/ -> ~/.claude/$name/"
}

# CLAUDE.md (global instructions)
Copy-Item (Join-Path $repo "CLAUDE.md") (Join-Path $dest "CLAUDE.md") -Force
Write-Host "copied  CLAUDE.md -> ~/.claude/CLAUDE.md"

Copy-Tree "rules"
Copy-Tree "agents"
Copy-Tree "references"
Copy-Tree "mcp"

# skills: copy this repo's skills only (do NOT delete other skills in ~/.claude)
$skillsSrc = Join-Path $repo "skills"
$skillsDst = Join-Path $dest "skills"
New-Item -ItemType Directory -Force -Path $skillsDst | Out-Null
foreach ($d in Get-ChildItem $skillsSrc -Directory) {
  Copy-Item $d.FullName -Destination $skillsDst -Recurse -Force
  Write-Host "copied  skills/$($d.Name)/"
}

# hooks: copy Node scripts only
$hooksDst = Join-Path $dest "hooks"
New-Item -ItemType Directory -Force -Path $hooksDst | Out-Null
Copy-Item (Join-Path $repo "hooks\*.mjs") -Destination $hooksDst -Force
Write-Host "copied  hooks/*.mjs -> ~/.claude/hooks/"

# mcp: merge user-scope MCP servers into ~/.claude.json (Node script, .bak written)
$mcpScript = Join-Path $repo "mcp\merge-mcp.mjs"
if ($McpFrom) { node $mcpScript --from $McpFrom } else { node $mcpScript }
if ($LASTEXITCODE -ne 0) { Write-Warning "MCP merge failed (exit $LASTEXITCODE) -- ~/.claude.json untouched" }

if ($RemoveStale) {
  $stale = @(
    "hooks\pre-compact.sh", "hooks\post-compact.sh", "hooks\session-start.sh",
    "hooks\ui-verification-check.sh", "hooks\hooks-config.json",
    "hooks\session-start.mjs", "hooks\pre-compact.mjs", "hooks\post-compact.mjs",
    "rules\04-testing.md", "rules\06-ui-design.md", "rules\05-tool-usage.md"
  )
  foreach ($s in $stale) {
    $p = Join-Path $dest $s
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "removed ~/.claude/$s" }
  }
  $uiSkill = Join-Path $dest "skills\ui-toolkit-design"
  if (Test-Path $uiSkill) { Remove-Item $uiSkill -Recurse -Force; Write-Host "removed ~/.claude/skills/ui-toolkit-design/" }
}

Write-Host ""
Write-Host "NEXT (manual):"
Write-Host "  1. Merge hooks/settings.global.json (hooks block) into ~/.claude/settings.json"
Write-Host "  2. Ensure 'node' is available (Windows runs command hooks via Git Bash)"
Write-Host "  3. Run /hooks in Claude Code to confirm registration"
Write-Host "  4. (optional) /plugin marketplace remove ho-gyu-lee/hello-claude-code"
if (-not $RemoveStale) {
  Write-Host "  5. Re-run with -RemoveStale to delete obsoleted files (.sh hooks, moved rules, ui-toolkit-design)"
}
