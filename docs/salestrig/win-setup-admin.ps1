# Salestrig Studio — elevated Windows setup (WSL2 + Docker Desktop)
# Runs as Administrator. Triggered via UAC by Claude; safe to re-run.
Start-Transcript -Path "$PSScriptRoot\win-setup-admin.log" -Force | Out-Null
Write-Output "=== [1/2] Installing WSL2 core (no distro) ==="
try { wsl --install --no-distribution } catch { Write-Output "wsl install note: $_" }

Write-Output "=== [2/2] Installing Docker Desktop ==="
try {
  winget install --id Docker.DockerDesktop -e --source winget `
    --accept-source-agreements --accept-package-agreements
} catch { Write-Output "docker install note: $_" }

Write-Output "=== DONE. A REBOOT is required before Docker can start. ==="
Stop-Transcript | Out-Null
