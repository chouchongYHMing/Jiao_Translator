$ErrorActionPreference = 'Stop'
$hostPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\build\native-host\JiaoTranslatorHost.exe'))
if (-not (Test-Path -LiteralPath $hostPath)) {
    throw 'Build the native host with install.ps1 -BuildOnly first.'
}

function Send-NativeMessage([string]$json) {
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = $hostPath
    $start.UseShellExecute = $false
    $start.RedirectStandardInput = $true
    $start.RedirectStandardOutput = $true
    $start.CreateNoWindow = $true
    $process = [Diagnostics.Process]::Start($start)
    try {
        $payload = [Text.Encoding]::UTF8.GetBytes($json)
        $inputStream = $process.StandardInput.BaseStream
        $header = [BitConverter]::GetBytes($payload.Length)
        $inputStream.Write($header, 0, 4)
        $inputStream.Write($payload, 0, $payload.Length)
        $inputStream.Flush()
        $process.StandardInput.Close()

        $outputStream = $process.StandardOutput.BaseStream
        $responseHeader = [byte[]]::new(4)
        if ($outputStream.Read($responseHeader, 0, 4) -ne 4) {
            throw 'The native host did not return a complete response header.'
        }
        $length = [BitConverter]::ToInt32($responseHeader, 0)
        if ($length -lt 1 -or $length -gt 65536) {
            throw "Invalid response length: $length"
        }
        $response = [byte[]]::new($length)
        $offset = 0
        while ($offset -lt $length) {
            $read = $outputStream.Read($response, $offset, $length - $offset)
            if ($read -eq 0) { throw 'Incomplete native host response.' }
            $offset += $read
        }
        return ([Text.Encoding]::UTF8.GetString($response) | ConvertFrom-Json)
    }
    finally {
        $process.Dispose()
    }
}

$ping = Send-NativeMessage '{"action":"ping"}'
if (-not $ping.ok -or $ping.status -ne 'ready') { throw 'Ping failed.' }
$unsupported = Send-NativeMessage '{"action":"run_arbitrary_command"}'
if ($unsupported.ok -or $unsupported.error -ne 'Unsupported action.') { throw 'Unexpected action was accepted.' }
Write-Host 'Native Messaging protocol and action allowlist passed.'
