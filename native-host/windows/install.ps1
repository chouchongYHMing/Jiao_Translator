param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-p]{32}$')]
    [string]$ExtensionId,
    [switch]$BuildOnly
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$outputDirectory = Join-Path $repoRoot 'build\native-host'
$source = Join-Path $PSScriptRoot 'Host.cs'
$compiler = @(
    "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe"
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $compiler) {
    throw 'The .NET Framework C# compiler (csc.exe) was not found.'
}

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$executable = Join-Path $outputDirectory 'JiaoTranslatorHost.exe'
& $compiler /nologo /target:exe "/out:$executable" /reference:System.Web.Extensions.dll $source
if ($LASTEXITCODE -ne 0) {
    throw 'Native host compilation failed.'
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'launch-server.cmd') -Destination $outputDirectory -Force

$manifestPath = Join-Path $outputDirectory 'com.jiao_translator.launcher.json'
$manifest = [ordered]@{
    name = 'com.jiao_translator.launcher'
    description = 'Launch the Jiao Translator local backend'
    path = $executable
    type = 'stdio'
    allowed_origins = @("chrome-extension://$ExtensionId/")
}
[IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 3), [Text.UTF8Encoding]::new($false))

if (-not $BuildOnly) {
    $registryKey = 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.jiao_translator.launcher'
    New-Item -Path $registryKey -Force | Out-Null
    Set-Item -Path $registryKey -Value $manifestPath
    Write-Host 'Native host installed for Chrome.'
}

Write-Host "Manifest: $manifestPath"
Write-Host "Extension ID: $ExtensionId"
