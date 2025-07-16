# PowerShell script to install components
param(
    [switch]$Infra,
    [switch]$App
)

if ($Infra) {
    Write-Host "Installing infrastructure..."
    # Add your infrastructure installation commands here
}
elseif ($App) {
    Write-Host "Installing application..."
    # Add your application installation commands here
}
else {
    Write-Host "Installing both infrastructure and application..."
    # Add your complete installation commands here
}
