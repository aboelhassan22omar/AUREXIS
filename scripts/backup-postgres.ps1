param(
    [string]$OutputDirectory = "D:\AUREXIS\backups"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = "D:\AUREXIS"
$ComposeFile = Join-Path $ProjectRoot "docker-compose.yml"

if (-not (Test-Path $OutputDirectory)) {
    New-Item `
        -ItemType Directory `
        -Path $OutputDirectory `
        -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path `
    $OutputDirectory `
    "aurexis_$Timestamp.sql"

Write-Host ""
Write-Host "========================================"
Write-Host "AUREXIS PostgreSQL Backup"
Write-Host "========================================"
Write-Host ""

Set-Location $ProjectRoot

$Container = docker compose `
    -f $ComposeFile `
    ps -q postgres

if (-not $Container) {
    throw "AUREXIS PostgreSQL container is not running."
}

$DatabaseName = docker compose `
    -f $ComposeFile `
    exec -T postgres `
    printenv POSTGRES_DB

$DatabaseUser = docker compose `
    -f $ComposeFile `
    exec -T postgres `
    printenv POSTGRES_USER

$DatabaseName = $DatabaseName.Trim()
$DatabaseUser = $DatabaseUser.Trim()

if (
    [string]::IsNullOrWhiteSpace(
        $DatabaseName
    )
) {
    throw "POSTGRES_DB could not be determined."
}

if (
    [string]::IsNullOrWhiteSpace(
        $DatabaseUser
    )
) {
    throw "POSTGRES_USER could not be determined."
}

Write-Host "Database : $DatabaseName"
Write-Host "User     : $DatabaseUser"
Write-Host "Backup   : $BackupFile"
Write-Host ""

docker compose `
    -f $ComposeFile `
    exec -T postgres `
    pg_dump `
    -U $DatabaseUser `
    -d $DatabaseName `
    --clean `
    --if-exists `
    --no-owner `
    --no-privileges |
    Out-File `
        -FilePath $BackupFile `
        -Encoding utf8

if (-not (Test-Path $BackupFile)) {
    throw "Backup file was not created."
}

$BackupSize = (
    Get-Item $BackupFile
).Length

if ($BackupSize -le 0) {
    throw "Backup file is empty."
}

Write-Host ""
Write-Host "Backup completed successfully."
Write-Host "Size: $BackupSize bytes"
Write-Host "File: $BackupFile"
Write-Host ""