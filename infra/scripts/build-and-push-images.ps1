# Helper Functions
function Write-Phase {
    param([string]$phase)
    Write-Host "`n🚀 $phase" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$step)
    Write-Host "`n📋 $step" -ForegroundColor Yellow
}

function Write-Progress {
    param([string]$message)
    Write-Host "   $message" -ForegroundColor Gray
}

function Write-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$message)
    Write-Host "⚠️ $message" -ForegroundColor DarkYellow
}

# Configuration - Can be overridden by environment variables
$registryUrl = if ($env:REGISTRY_URL) { $env:REGISTRY_URL } else { "image.registry.local:5001" }
$services = @(
    @{
        Name = "cart"
        Path = "..\cart-cna-microservice"
        Tag  = "latest"
    },
    @{
        Name = "products"
        Path = "..\products-cna-microservice"
        Tag  = "latest"
    },
    @{
        Name = "search"
        Path = "..\search-cna-microservice"
        Tag  = "latest"
    },
    @{
        Name = "store-ui"
        Path = "..\store-ui"
        Tag  = "latest"
    },
    @{
        Name = "users"
        Path = "..\users-cna-microservice"
        Tag  = "latest"
    }
)

# Check if registry is running
Write-Phase "Checking Local Registry"
$registryContainer = docker ps --filter "name=kind-registry" --format "{{.Names}}"
if (-not $registryContainer) {
    Write-Warning "Local registry is not running! Please run setup-kind.ps1 first."
    exit 1
}
Write-Success "Local registry is running at $registryUrl"

foreach ($service in $services) {
    Write-Phase "Processing $($service.Name) Service"
    
    # Build the image
    Write-Step "Building image for $($service.Name)..."
    Write-Progress "Running docker build in $($service.Path)"
    
    Push-Location $service.Path
    try {
        docker build -t "$($service.Name):$($service.Tag)" .
        if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
        Write-Success "Built $($service.Name):$($service.Tag)"
        
        # Tag the image for local registry
        Write-Step "Tagging image for local registry..."
        $registryImage = "$registryUrl/$($service.Name):$($service.Tag)"
        docker tag "$($service.Name):$($service.Tag)" $registryImage
        Write-Success "Tagged as $registryImage"
        
        # Push to local registry
        Write-Step "Pushing to local registry..."
        docker push $registryImage
        if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }
        Write-Success "Successfully pushed $registryImage"
        
    } catch {
        Write-Warning "Failed to process $($service.Name): $_"
    } finally {
        Pop-Location
    }
}

Write-Phase "Build and Push Summary"
Write-Success "All services have been processed"
Write-Host "`nNext steps:"
Write-Host "1. You can verify images in the registry using: docker images"
Write-Host "2. To see pushed images: curl http://$registryUrl/v2/_catalog"
