# Helper Functions - Importing common styling functions
. "$PSScriptRoot\build-and-push-images.ps1"

function Check-Command {
    param([string]$command)
    
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Check-Prerequisites {
    Write-Phase "Checking Prerequisites"
    
    $prerequisites = @{
        "docker" = "Docker"
        "kind" = "KinD (Kubernetes in Docker)"
        "kubectl" = "kubectl"
    }
    
    $allPresent = $true
    foreach ($prereq in $prerequisites.GetEnumerator()) {
        if (Check-Command $prereq.Key) {
            Write-Success "$($prereq.Value) is installed"
        } else {
            Write-Warning "$($prereq.Value) is not installed!"
            $allPresent = $false
        }
    }
    
    if (-not $allPresent) {
        Write-Warning "Please install missing prerequisites and try again"
        exit 1
    }
}

function Initialize-DevCluster {
    Write-Phase "Setting up KinD Cluster"
    
    # Run the setup-kind script
    & "$PSScriptRoot\setup-kind.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to setup KinD cluster"
        exit 1
    }
}

function Build-PushImages {
    Write-Phase "Building and Pushing Images"
    
    # Run the build and push script
    & "$PSScriptRoot\build-and-push-images.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to build and push images"
        exit 1
    }
}

function Deploy-Infrastructure {
    Write-Phase "Deploying Shared Infrastructure"
    
    Write-Step "Deploying shared services (Redis, MongoDB, Elasticsearch)"
    kubectl apply -k "$PSScriptRoot\k8s\shared-services\overlays\local"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to deploy shared services"
        exit 1
    }
    Write-Success "Shared services deployed successfully"
    
    # Wait for shared services to be ready
    Write-Progress "Waiting for shared services to be ready..."
    Start-Sleep -Seconds 10
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=shared-services -n shared-services --timeout=120s
}

function Deploy-Applications {
    Write-Phase "Deploying Application Services"
    
    Write-Step "Deploying application services"
    kubectl apply -k "$PSScriptRoot\k8s\apps\overlays\local"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to deploy application services"
        exit 1
    }
    Write-Success "Application services deployed successfully"
    
    # Wait for applications to be ready
    Write-Progress "Waiting for application services to be ready..."
    Start-Sleep -Seconds 10
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=application -n e-commerce --timeout=180s
}

function Show-Environment-Info {
    Write-Phase "Environment Information"
    
    Write-Host "`nAccess your applications:"
    Write-Host "Store UI: http://localhost:80"
    Write-Host "API Endpoints:"
    Write-Host "  - Cart Service:     http://localhost:8080"
    Write-Host "  - Products Service: http://localhost:8081"
    Write-Host "  - Search Service:   http://localhost:8082"
    Write-Host "  - Users Service:    http://localhost:8083"
    
    Write-Host "`nUseful commands:"
    Write-Host "  kubectl get pods -A              # List all pods"
    Write-Host "  kubectl get services -A          # List all services"
    Write-Host "  kubectl logs -f <pod-name>       # Follow pod logs"
    Write-Host "`nTo clean up the environment:"
    Write-Host "  kind delete cluster --name e-commerce-cluster"
}

# Main execution flow
try {
    Write-Host "🚀 Creating Development Environment" -ForegroundColor Cyan
    
    Check-Prerequisites
    Initialize-DevCluster
    Build-PushImages
    Deploy-Infrastructure
    Deploy-Applications
    Show-Environment-Info
    
    Write-Success "Development environment is ready!"
} catch {
    Write-Warning "Failed to create development environment: $_"
    exit 1
}
