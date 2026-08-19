$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Get-NodeExe {
    $command = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $standardPath = Join-Path $env:ProgramFiles 'nodejs\node.exe'
    if (Test-Path -LiteralPath $standardPath) { return $standardPath }

    return $null
}

$setupDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $setupDir
$packageFile = Join-Path $projectRoot 'package.json'
$electronExe = Join-Path $projectRoot 'node_modules\electron\dist\electron.exe'

if (-not (Test-Path -LiteralPath $packageFile)) {
    throw "Studio Launcher package.json was not found. Keep the 'For New PC' folder inside the App Launcher folder."
}

Write-Host 'Shakib Studio Hub - first-time PC setup' -ForegroundColor Green
Write-Host "Project: $projectRoot"

$nodeExe = Get-NodeExe
if (-not $nodeExe) {
    Write-Step 'Node.js LTS was not found. Installing it with Windows Package Manager...'
    $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
    if (-not $winget) {
        throw "Windows Package Manager (winget) is unavailable. Install Node.js LTS from https://nodejs.org/, then run this setup again."
    }

    & $winget.Source install --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js LTS installation failed (exit code $LASTEXITCODE). Check your internet connection and Windows permissions, then run this setup again."
    }

    # A newly installed Node.js is not always added to this already-open terminal's PATH.
    $nodeExe = Get-NodeExe
    if (-not $nodeExe) {
        throw 'Node.js was installed but could not be located. Close this window, open Start_Setup_For_New_PC.bat again, and retry.'
    }
}

$nodeDir = Split-Path -Parent $nodeExe
$npmExe = Join-Path $nodeDir 'npm.cmd'
if (-not (Test-Path -LiteralPath $npmExe)) {
    throw "npm.cmd was not found beside Node.js: $nodeDir"
}

Write-Step "Using Node.js $(& $nodeExe --version)"
Write-Step 'Installing App Launcher dependencies (including Electron)...'
Push-Location $projectRoot
try {
    & $npmExe install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed (exit code $LASTEXITCODE). Check your internet connection, then run this setup again."
    }
}
finally {
    Pop-Location
}

if (-not (Test-Path -LiteralPath $electronExe)) {
    throw "Electron was not installed where expected: $electronExe"
}

Write-Step 'Creating or refreshing the Desktop shortcut...'
$shell = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcut = $shell.CreateShortcut((Join-Path $desktop 'Shakib Studio Hub.lnk'))
$shortcut.TargetPath = Join-Path $projectRoot 'Launch_Desktop_App.bat'
$shortcut.WorkingDirectory = $projectRoot
$shortcut.IconLocation = "$(Join-Path $projectRoot 'icon.ico'),0"
$shortcut.Description = 'Shakib Studio Hub Desktop'
$shortcut.Save()

Write-Host "`nSetup complete. Starting Shakib Studio Hub..." -ForegroundColor Green
Start-Process -FilePath (Join-Path $projectRoot 'Launch_Desktop_App.bat') -WorkingDirectory $projectRoot
