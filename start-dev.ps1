# Salestrig Studio — local dev launcher (Windows)
# Starts backend + frontend + orchestrator, each in its own minimized window.
# Prereqs: `pnpm dev:docker` is up (postgres/redis/temporal), Node 22 via fnm installed.
#
# NOTE: backend runs WITHOUT `nest --watch` because tsc-watch fails to spawn the
# runtime in this environment (compiles but never binds :3000). Frontend keeps
# Next.js fast-refresh; orchestrator keeps its watch. Restart backend manually
# after backend code changes (re-run this script or just the backend block).

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$inst = "C:\Users\jorda\AppData\Roaming\fnm\node-versions\v22.22.3\installation"
if (-not (Test-Path "$inst\node.exe")) {
  Write-Error "Node 22 not found at $inst — adjust the path to your fnm install."
  exit 1
}

function Start-App([string]$Title, [string]$WorkDir, [string]$InnerCmd) {
  $full = "`$env:Path = '$inst;' + `$env:Path; Set-Location '$WorkDir'; `$Host.UI.RawUI.WindowTitle = '$Title'; $InnerCmd"
  Start-Process powershell -ArgumentList '-NoExit','-NoProfile','-Command',$full -WindowStyle Minimized
  Write-Host "started: $Title"
}

# Backend — non-watch (reliable). Loads ../../.env via dotenv.
Start-App 'salestrig-backend' "$repo\apps\backend" `
  'corepack pnpm exec dotenv -e ../../.env -- nest start --entryFile=./apps/backend/src/main'

# Frontend — Next.js dev on :4200 (native fast refresh).
Start-App 'salestrig-frontend' "$repo" `
  'corepack pnpm --filter ./apps/frontend dev'

# Orchestrator — Temporal worker (watch works here).
Start-App 'salestrig-orchestrator' "$repo" `
  'corepack pnpm --filter ./apps/orchestrator dev'

Write-Host ""
Write-Host "Frontend: http://localhost:4200   Backend: http://localhost:3000"
Write-Host "Temporal UI: http://localhost:8080   pgAdmin: http://localhost:8081"
Write-Host "(give the backend ~30-60s to finish compiling + bind :3000)"
