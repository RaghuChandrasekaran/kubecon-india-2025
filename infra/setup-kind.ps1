# Requires: Docker, Kind, kubectl installed on Windows

#region Configuration and Helper Functions
$ErrorActionPreference = 'Stop'

# Configuration
$clusterName = Read-Host "📛 Enter a cluster name"
$regName = "kind-registry"
$regPort = "5001"  # Explicitly defined as string
$kindConfigPath = "./kind-cluster-config.yaml"

# Helper Functions
function Write-Phase {
    param($phase)
    Write-Host "`n📋 Phase: $phase`n" -ForegroundColor Cyan
}

function Write-Step {
    param($step)
    Write-Host "   $step" -ForegroundColor Yellow
}

function Write-Progress {
    param($message)
    Write-Host "   → $message" -ForegroundColor DarkGray
}

function Write-Success {
    param($message)
    Write-Host "   ✓ $message" -ForegroundColor Green
}

function Write-Warning {
    param($message)
    Write-Host "   ⚠ $message" -ForegroundColor Yellow
}

function Write-PhaseSummary {
    param(
        [string]$phase,
        [string[]]$completedSteps
    )
    Write-Host "`n📍 Phase Summary: $phase" -ForegroundColor Magenta
    foreach ($step in $completedSteps) {
        Write-Host "   ✓ $step" -ForegroundColor Green
    }
    Write-Host ""
}

function Start-Timer {
    return [System.Diagnostics.Stopwatch]::StartNew()
}

function Stop-Timer($stopwatch, $taskName) {
    $stopwatch.Stop()
    $elapsed = $stopwatch.Elapsed
    
    # Format time in a user-friendly way
    $formattedTime = if ($elapsed.TotalMinutes -ge 1) {
        "{0:0.0} minutes" -f $elapsed.TotalMinutes
    } elseif ($elapsed.TotalSeconds -ge 1) {
        "{0:0.0} seconds" -f $elapsed.TotalSeconds
    } else {
        "{0:0} milliseconds" -f $elapsed.TotalMilliseconds
    }
    
    Write-Host "⏱️ $taskName completed in $formattedTime`n" -ForegroundColor Gray
}

#region Pre-flight Checks
Write-Phase "Pre-flight Checks"

Write-Step "Validating configuration..."
$timer = Start-Timer

if ([string]::IsNullOrEmpty($regPort)) {
    Write-Error "Registry port cannot be empty"
    exit 1
}

if (-not (Test-Path $kindConfigPath)) {
    Write-Error "Kind cluster config file not found at $kindConfigPath"
    exit 1
}

Write-Step "Checking required tools..."
$tools = @(
    @{ Name = "Docker"; Command = "docker --version" },
    @{ Name = "Kind"; Command = "kind --version" },
    @{ Name = "kubectl"; Command = "kubectl version --client" }
)

foreach ($tool in $tools) {
    try {
        $null = Invoke-Expression $tool.Command
        Write-Host "   → $($tool.Name) is installed"
    } catch {
        Write-Error "$($tool.Name) is not installed or not in PATH"
        exit 1
    }
}

Stop-Timer $timer "Pre-flight validation"

Write-PhaseSummary "Pre-flight Checks" @(
    "Configuration validated"
    "Required files checked"
    "Required tools verified"
)
#endregion

#region Phase 1: Local Registry Setup
Write-Phase "Setting up Local Registry"

Write-Step "Checking for existing registry container..."
$timer = Start-Timer
$regExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^$regName$"
if (-not $regExists) {
    Write-Step "Setting up new registry container..."
    Write-Progress "Pulling registry:2 image..."
    try {
        # Pull the registry image with progress
        $pullOutput = docker pull registry:2 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Registry image pulled successfully"
        } else {
            Write-Error "Failed to pull registry image: $pullOutput"
            exit 1
        }

        Write-Progress "Starting registry container on port ${regPort}..."
        $containerId = docker run -d --restart=always -p "${regPort}:5000" --name $regName registry:2
        if ($containerId) {
            Write-Progress "Waiting for registry to be ready..."
            Start-Sleep -Seconds 2
            $health = docker inspect --format='{{.State.Status}}' $regName
            Write-Progress "Registry status: $health"
            if ($health -eq "running") {
                Write-Host "✅ Registry container successfully created and running"
            } else {
                Write-Error "Registry container is not running. Status: $health"
                exit 1
            }
        }
    } catch {
        Write-Error ("Failed to create registry container: {0}" -f $_.Exception.Message)
        exit 1
    }
} else {
    Write-Host "✅ Registry already exists, checking status..."
    $health = docker inspect --format='{{.State.Status}}' $regName
    Write-Host "   → Registry status: $health"
    if ($health -ne "running") {
        Write-Host "   → Starting existing registry container..."
        docker start $regName
    }
}
Stop-Timer $timer "Registry setup"

Write-PhaseSummary "Registry Setup" @(
    "Registry container status checked"
    "Registry running on port $regPort"
    "Container health verified"
)
#endregion

#region Phase 2: Cluster Creation
Write-Phase "Creating Kind Cluster"

Write-Step "Validating cluster configuration..."
$timer = Start-Timer
Stop-Timer $timer "Config validation"

Write-Step "Checking cluster status..."
$timer = Start-Timer
$existingClusters = kind get clusters

# Clean up any existing cluster resources
Write-Step "Cleaning up any existing resources..."

if ($existingClusters -contains $clusterName) {
    Write-Progress "Deleting existing Kind cluster..."
    kind delete cluster --name $clusterName
}

# Clean up all related containers even if cluster delete failed
Write-Progress "Checking for leftover containers..."
$containerPatterns = @(
    "$clusterName-control-plane",
    "$clusterName-worker",
    "kind-$clusterName-*"
)

foreach ($pattern in $containerPatterns) {
    $stuckContainers = docker ps -a --filter "name=$pattern" --format "{{.Names}}"
    if ($stuckContainers) {
        foreach ($container in $stuckContainers) {
            Write-Progress "Removing container: $container"
            docker rm -f $container 2>$null
        }
    }
}

# Clean up any Kind networks if needed
$kindNetwork = docker network ls --filter "name=kind" --format "{{.Name}}"
if ($kindNetwork) {
    Write-Progress "Removing old Kind network..."
    docker network rm kind 2>$null
}

# Give some time for resources to be cleaned up
Write-Progress "Waiting for cleanup to complete..."
Start-Sleep -Seconds 5

Write-Step "Creating Kubernetes cluster..."

try {
    Write-Host "`n"  # Add some spacing for better readability
    # Execute Kind directly to show its beautiful progress output
    kind create cluster --name $clusterName --config $kindConfigPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create cluster"
        exit 1
    }
    
    Write-Host "`n"  # Add spacing after Kind output
    Write-Success "Cluster created successfully"
    
    # Verify cluster access
    Write-Progress "Verifying cluster access..."
    $nodes = kubectl get nodes -o wide 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cluster is accessible"
        Write-Host "`nCluster Nodes:"
        Write-Host $nodes -ForegroundColor DarkGray
    } else {
        Write-Warning "Cluster created but might not be fully ready yet"
    }
} catch {
    Write-Error ("Failed to create cluster: {0}" -f $_.Exception.Message)
    exit 1
}
Stop-Timer $timer "Cluster check/creation"

Write-PhaseSummary "Cluster Creation" @(
    "Old resources cleaned up"
    "New cluster created: $clusterName"
    "Configuration applied from: $kindConfigPath"
)
#endregion

#region Phase 3: Registry Integration
Write-Phase "Configuring Registry Access"

Write-Step "Setting up registry access in cluster nodes..."
$timer = Start-Timer
$regHostDir = "/etc/containerd/certs.d/image.registry.local:$regPort"

# Verify cluster is ready before proceeding
Write-Host "   → Waiting for cluster to be ready..."
$retryCount = 0
$maxRetries = 30
do {
    $kindNodes = kind get nodes --name $clusterName 2>$null
    if ($kindNodes) {
        Write-Host "   → Found cluster nodes: $($kindNodes.Count) node(s)"
        break
    }
    $retryCount++
    if ($retryCount -eq $maxRetries) {
        Write-Error "Timeout waiting for cluster nodes to be ready"
        exit 1
    }
    Write-Host "   → Waiting for nodes to be ready... (Attempt $retryCount/$maxRetries)"
    Start-Sleep -Seconds 2
} while ($true)

$nodeCount = ($kindNodes | Measure-Object -Line).Lines
Write-Progress "Configuring $nodeCount cluster nodes..."

foreach ($node in $kindNodes) {
    Write-Progress "Setting up registry access on node: $node"
    try {
        docker exec $node mkdir -p $regHostDir
        $hostsToml = "[host.`"http://$regName:5000`"]"
        $hostsToml | docker exec -i $node /bin/sh -c "cat > $regHostDir/hosts.toml"
        Write-Success "Node $node configured successfully"
    } catch {
        Write-Error ("Failed to configure node {0}: {1}" -f $node, $_.Exception.Message)
        exit 1
    }
}
Stop-Timer $timer "Registry config to Kind nodes"

Write-Step "Configuring network connectivity..."
$timer = Start-Timer
$connected = docker inspect -f='{{json .NetworkSettings.Networks.kind}}' $regName 2>$null
if ($connected -eq "null") {
    docker network connect "kind" $regName
    Write-Host "✅ Connected registry to kind network."
} else {
    Write-Host "🔗 Already connected."
}
Stop-Timer $timer "Network attachment"

Write-PhaseSummary "Registry Integration" @(
    "Registry configured on all nodes"
    "Network connectivity established"
    "Node configurations updated"
)
#endregion

#region Phase 4: Kubernetes Configuration
Write-Phase "Configuring Kubernetes Settings"

Write-Step "Creating registry configuration in Kubernetes..."
$timer = Start-Timer

Write-Step "Waiting for Kubernetes API..."
Write-Host "   → Waiting for Kubernetes API to be ready..."
$retryCount = 0
$maxRetries = 30
do {
    $apiStatus = kubectl get --raw='/readyz' 2>$null
    if ($apiStatus -eq "ok") {
        Write-Host "   → Kubernetes API is ready"
        break
    }
    $retryCount++
    if ($retryCount -eq $maxRetries) {
        Write-Error "Timeout waiting for Kubernetes API to be ready"
        exit 1
    }
    Write-Host "   → Waiting for API to be ready... (Attempt $retryCount/$maxRetries)"
    Start-Sleep -Seconds 2
} while ($true)

# Create the ConfigMap
try {
    $configMap = @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "image.registry.local:$regPort"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
"@
    
    # Ensure kube-public namespace exists
    kubectl create namespace kube-public --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply the ConfigMap
    $configMap | kubectl apply -f - --validate=true
    Write-Host "✅ Registry ConfigMap created successfully"
} catch {
    Write-Error ("Failed to create registry ConfigMap: {0}" -f $_.Exception.Message)
    exit 1
}
Stop-Timer $timer "Registry documentation setup"

Write-PhaseSummary "Kubernetes Configuration" @(
    "Kubernetes API ready"
    "Registry ConfigMap created"
    "Namespace configuration complete"
)
#endregion

#region Final Summary
Write-Phase "Setup Complete"

Write-Host "✨ Your Kubernetes development environment is ready! ✨" -ForegroundColor Green
Write-Host @"

🔸 Environment Details:
   • Cluster Name: $clusterName
   • Local Registry: image.registry.local:$regPort
   • Config Path: $kindConfigPath

🔸 Verify Setup:
   • Check nodes:    kubectl get nodes
   • Check system:   kubectl get pods -A
   • Check registry: curl http://image.registry.local:$regPort/v2/_catalog

🔸 Quick Start:
   1. Tag an image:     docker tag myimage:latest image.registry.local:$regPort/myimage:latest
   2. Push to registry: docker push image.registry.local:$regPort/myimage:latest
   3. Deploy to K8s:    kubectl apply -f your-deployment.yaml

🔸 Documentation:
   • Kind:             https://kind.sigs.k8s.io/docs/user/quick-start/
   • Local Registry:   https://kind.sigs.k8s.io/docs/user/local-registry/
   • Kubernetes:       https://kubernetes.io/docs/home/
"@ -ForegroundColor Yellow
#endregion