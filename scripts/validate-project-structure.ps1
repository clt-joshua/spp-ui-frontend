[CmdletBinding()]
param()

$validatorPath = Join-Path $PSScriptRoot 'validate-project-structure.mjs'
& node $validatorPath
exit $LASTEXITCODE
