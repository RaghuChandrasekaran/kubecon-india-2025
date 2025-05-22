[CmdletBinding()]
param(
    [Parameter()]
    [switch]$Reset,
    
    [Parameter()]
    [switch]$Continue,
    
    [Parameter()]
    [ValidateSet('prerequisites', 'cluster', 'images', 'infrastructure', 'applications')]
    [string]$Step
)

# Helper Functions - Importing common styling functions
. "$PSScriptRoot\build-and-push-images.ps1"

# State management
$stateFile = Join-Path $PSScriptRoot ".dev-env-state"

function Get-SetupState {
    if (Test-Path $stateFile) {
        Get-Content $stateFile
    } else {
        "init"
    }
}

function Update-SetupState {
    param([string]$state)
    $state | Set-Content $stateFile
}

function Reset-SetupState {
    if (Test-Path $stateFile) {
        Remove-Item $stateFile
    }
}

function Test-Command {
    param([string]$command)
    
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Test-Prerequisites {
    Write-Phase "Checking Prerequisites"
    
    $prerequisites = @{
        "docker" = "Docker"
        "kind" = "KinD (Kubernetes in Docker)"
        "kubectl" = "kubectl"
    }
    
    $allPresent = $true
    foreach ($prereq in $prerequisites.GetEnumerator()) {
        if (Test-Command $prereq.Key) {
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
    
    # Get current state
    $currentState = Get-SetupState
    
    if ($Reset) {
        Reset-SetupState
        $currentState = "init"
        Write-Host "Reset setup state. Starting fresh." -ForegroundColor Yellow
    }
    
    # Define the steps
    $steps = @(
        @{
            Name = "prerequisites"
            Action = { Test-Prerequisites }
            Desc = "Checking prerequisites"
        },
        @{
            Name = "cluster"
            Action = { Initialize-DevCluster }
            Desc = "Setting up KinD cluster"
        },
        @{
            Name = "images"
            Action = { Build-PushImages }
            Desc = "Building and pushing images"
        },
        @{
            Name = "infrastructure"
            Action = { Deploy-Infrastructure }
            Desc = "Deploying infrastructure"
        },
        @{
            Name = "applications"
            Action = { Deploy-Applications }
            Desc = "Deploying applications"
        }
    )
    
    # Determine start index
    $startIndex = 0
    
    if ($PSBoundParameters.ContainsKey('Step')) {
        $stepNames = $steps | ForEach-Object { $_.Name }
        $startIndex = [array]::IndexOf($stepNames, $Step)
        if ($startIndex -ge 0) {
            Write-Host "Starting from $($steps[$startIndex].Desc)" -ForegroundColor Yellow
        }
    } elseif ($Continue -and $currentState -ne "init") {
        $stepNames = $steps | ForEach-Object { $_.Name }
        $continueIndex = [array]::IndexOf($stepNames, $currentState)
        if ($continueIndex -ge 0) {
            $startIndex = $continueIndex + 1
            if ($startIndex -lt $steps.Count) {
                Write-Host "Continuing from $($steps[$startIndex].Desc)" -ForegroundColor Yellow
            }
        }
    }
    
    # Execute steps
    for ($i = $startIndex; $i -lt $steps.Count; $i++) {
        $step = $steps[$i]
        & $step.Action
        Update-SetupState $step.Name
    }
    
    Show-Environment-Info
    Update-SetupState "complete"
    Write-Success "Development environment is ready!"
    
} catch {
    Write-Warning "Failed to create development environment: $_"
    Write-Host "`nTo continue from this point later, run:"
    Write-Host "    .\create-dev-env.ps1 -Continue"
    Write-Host "To start fresh:"
    Write-Host "    .\create-dev-env.ps1 -Reset"
    exit 1
}
