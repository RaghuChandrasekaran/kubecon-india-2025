#!/bin/bash
#==============================================================================
# Development Environment Setup Script
#==============================================================================
# 
# DESCRIPTION:
#   Sets up a development environment with:
#   1. A standalone Docker registry container (independent of any cluster)
#   2. A Kind Kubernetes cluster configured to use the Docker registry
#
# USAGE:
#   ./install-cluster.sh [CLUSTER_NAME]
#
#==============================================================================

# Exit on any error
set -e

# Configuration - support both interactive and non-interactive modes
if [[ -n "$1" ]]; then
  cluster_name="$1"
  echo "📛 Using cluster name: $cluster_name"
else
  echo "📛 Enter a cluster name (or press Enter for 'devpilot-cluster'):"
  echo -n "   > "
  read cluster_name
  cluster_name="${cluster_name:-devpilot-cluster}"  # Use default if empty
  echo "📛 Using cluster name: $cluster_name"
fi

# Configuration - Using alternative port 9080 instead of 8080 to avoid conflicts
registry_name="kind-registry"
registry_port="5001"        # Registry port
registry_ui_port="9080"     # Changed UI port to avoid conflict with port 8080
kind_config_path="./kind-cluster-config.yaml"

echo "📛 Setting up development environment"

# Helper Functions
function write_phase() { echo -e "\n📋 Phase: $1\n"; }
function write_step() { echo -e "   $1"; }
function write_progress() { echo -e "   → $1"; }
function write_success() { echo -e "   ✓ $1"; }
function write_warning() { echo -e "   ⚠ $1"; }
function write_error() { echo -e "   ❌ $1"; }

function start_timer() { start_time=$(date +%s.%N); }
function stop_timer() {
  local end_time=$(date +%s.%N)
  local elapsed=$(echo "$end_time - $start_time" | bc)
  local task_name="$1"
  
  if (( $(echo "$elapsed >= 60" | bc -l) )); then
    local formatted_time=$(echo "scale=1; $elapsed / 60" | bc)
    echo -e "⏱️ $task_name completed in ${formatted_time} minutes\n"
  elif (( $(echo "$elapsed >= 1" | bc -l) )); then
    local formatted_time=$(echo "scale=1; $elapsed" | bc)
    echo -e "⏱️ $task_name completed in ${formatted_time} seconds\n"
  else
    local formatted_time=$(echo "scale=0; $elapsed * 1000" | bc)
    echo -e "⏱️ $task_name completed in ${formatted_time} milliseconds\n"
  fi
}

function write_phase_summary() {
  local phase="$1"
  shift
  local completed_steps=("$@")
  
  echo -e "\n📍 Phase Summary: $phase"
  for step in "${completed_steps[@]}"; do
    echo -e "   ✓ $step"
  done
  echo ""
}

#region Pre-flight Checks
write_phase "Pre-flight Checks"

write_step "Checking required tools..."
start_timer

tools=("docker:Docker" "kind:Kind" "kubectl:kubectl")

for tool_info in "${tools[@]}"; do
  cmd="${tool_info%%:*}"
  name="${tool_info#*:}"
  
  if command -v "$cmd" >/dev/null 2>&1; then
    write_progress "$name is installed"
  else
    write_error "$name is not installed or not in PATH"
    exit 1
  fi
done

if [[ ! -f "$kind_config_path" ]]; then
  write_error "Kind cluster config file not found at $kind_config_path"
  exit 1
fi

stop_timer "Pre-flight validation"

write_phase_summary "Pre-flight Checks" \
  "Required tools verified" \
  "Configuration validated"
#endregion

#region Phase 1: Docker Registry Setup
write_phase "Setting up Docker Registry"

write_step "Checking for existing registry container..."
start_timer

registry_exists=$(docker ps -a --format '{{.Names}}' | grep -E "^${registry_name}$" || true)
if [[ -z "$registry_exists" ]]; then
  write_step "Setting up new Docker registry container..."
  
  # Create Docker volume for registry data persistence
  write_progress "Creating Docker volume for registry data..."
  docker volume create registry-data || true
  
  # Pull and run the Docker registry
  write_progress "Starting registry container..."
  
  # Using registry:2 image with CORS enabled
  docker run -d \
    --name $registry_name \
    -p $registry_port:5000 \
    -v registry-data:/var/lib/registry \
    -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Origin="['*']" \
    -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Methods="['HEAD', 'GET', 'OPTIONS', 'DELETE']" \
    -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Headers="['Authorization', 'Accept', 'Content-Type']" \
    -e REGISTRY_HTTP_HEADERS_Access-Control-Expose-Headers="['Docker-Content-Digest']" \
    --restart always \
    registry:2
  
  # Set up the registry UI
  write_progress "Starting registry UI container..."
  docker run -d \
    --name registry-ui \
    -p $registry_ui_port:80 \
    -e REGISTRY_URL=http://localhost:$registry_port \
    -e SINGLE_REGISTRY=true \
    -e DELETE_IMAGES=true \
    -e REGISTRY_TITLE="Docker Registry UI" \
    --restart=always \
    joxit/docker-registry-ui:latest
    
  write_success "Docker registry and UI successfully created and running"
else
  write_progress "Registry container already exists, checking status..."
  health=$(docker inspect --format='{{.State.Status}}' "$registry_name")
  if [[ "$health" != "running" ]]; then
    write_progress "Starting existing registry container..."
    docker start "$registry_name"
  fi
  
  # Check for UI container
  ui_exists=$(docker ps -a --format '{{.Names}}' | grep -E "^registry-ui$" || true)
  if [[ -z "$ui_exists" ]]; then
    write_progress "Starting registry UI container..."
    docker run -d \
      --name registry-ui \
      -p $registry_ui_port:80 \
      -e REGISTRY_URL=http://localhost:$registry_port \
      -e SINGLE_REGISTRY=true \
      -e DELETE_IMAGES=true \
      -e REGISTRY_TITLE="Docker Registry UI" \
      --restart=always \
      joxit/docker-registry-ui:latest
  else
    ui_health=$(docker inspect --format='{{.State.Status}}' "registry-ui" 2>/dev/null || echo "not_found")
    if [[ "$ui_health" != "running" ]]; then
      write_progress "Starting existing UI container..."
      docker start "registry-ui"
    fi
  fi
  
  write_success "Docker registry and UI containers are running"
fi

# Add to /etc/hosts if not already there
if ! grep -q "image.registry.local" /etc/hosts; then
  write_progress "Adding image.registry.local to /etc/hosts..."
  echo "127.0.0.1 image.registry.local" | sudo tee -a /etc/hosts
  write_success "Added image.registry.local to /etc/hosts"
else
  write_progress "image.registry.local already in /etc/hosts"
fi

stop_timer "Registry setup"

write_phase_summary "Docker Registry Setup" \
  "Standalone registry running" \
  "Registry accessible at image.registry.local:$registry_port" \
  "Registry UI accessible at http://localhost:$registry_ui_port" \
  "Data persistence configured with Docker volumes"
#endregion

#region Phase 2: Cluster Creation
write_phase "Creating Kind Cluster"

write_step "Checking cluster status..."
start_timer
existing_clusters=$(kind get clusters)

if echo "$existing_clusters" | grep -q "^${cluster_name}$"; then
  write_progress "Cluster ${cluster_name} exists. Deleting for fresh setup..."
  kind delete cluster --name "$cluster_name"
  write_success "Existing cluster deleted successfully"
else
  write_progress "Cluster ${cluster_name} does not exist. Creating new cluster..."
fi

# Clean up any leftover containers
write_progress "Cleaning up leftover containers..."
docker rm -f "${cluster_name}-control-plane" "${cluster_name}-worker" 2>/dev/null || true

# Give time for cleanup
sleep 3

write_step "Creating Kubernetes cluster..."

# Create cluster with better error handling
if ! kind create cluster --name "$cluster_name" --config "$kind_config_path"; then
  write_error "Failed to create cluster $cluster_name"
  exit 1
fi

write_success "Cluster created successfully"

# Quick verification
write_progress "Verifying cluster..."
if kubectl get nodes >/dev/null 2>&1; then
  write_success "Cluster is accessible"
else
  write_warning "Cluster created but not immediately accessible"
fi

stop_timer "Cluster creation"

write_phase_summary "Cluster Creation" \
  "Old resources cleaned up" \
  "New cluster created: $cluster_name" \
  "Configuration applied"
#endregion

#region Phase 3: Registry Integration
write_phase "Configuring Registry Access"

write_step "Setting up registry access in cluster nodes..."
start_timer

# Configure cluster to use Docker registry
write_progress "Configuring cluster to use Docker registry..."

# Get nodes with timeout
write_progress "Getting cluster nodes..."
retry_count=0
max_retries=10

while true; do
  kind_nodes=$(kind get nodes --name "$cluster_name" 2>/dev/null || true)
  
  if [[ -n "$kind_nodes" ]]; then
    node_count=$(echo "$kind_nodes" | wc -l)
    write_success "Found $node_count cluster node(s)"
    break
  fi
  
  retry_count=$((retry_count + 1))
  if [[ $retry_count -eq $max_retries ]]; then
    write_error "Could not get cluster nodes after $max_retries attempts"
    exit 1
  fi
  
  write_progress "Waiting for nodes... (Attempt $retry_count/$max_retries)"
  sleep 2
done

# Configure each node to trust the Docker registry
reg_host_dir="/etc/containerd/certs.d/image.registry.local:$registry_port"
echo "$kind_nodes" | while read -r node; do
  if [[ -n "$node" ]]; then
    write_progress "Configuring node: $node"
    docker exec "$node" mkdir -p "$reg_host_dir"
    hosts_toml="[host.\"http://image.registry.local:$registry_port\"]"
    echo "$hosts_toml" | docker exec -i "$node" /bin/sh -c "cat > $reg_host_dir/hosts.toml"
    write_success "Node $node configured"
  fi
done

# Connect registry container to kind network
write_progress "Connecting registry to cluster network..."
docker network connect "kind" "$registry_name" || true
write_progress "Connecting UI container to cluster network..."
docker network connect "kind" "registry-ui" || true
write_success "Networks connected"

stop_timer "Registry integration"

write_phase_summary "Registry Integration" \
  "Registry linked to Kind cluster" \
  "Network connectivity established"
#endregion

#region Final Setup
write_phase "Final Configuration"

write_step "Creating Kubernetes registry configuration..."
start_timer

# Wait for API to be ready
write_progress "Waiting for Kubernetes API..."
kubectl wait --for=condition=Ready nodes --all --timeout=60s

# Create registry ConfigMap
config_map=$(cat <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "image.registry.local:$registry_port"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
)

kubectl create namespace kube-public --dry-run=client -o yaml | kubectl apply -f - >/dev/null 2>&1
echo "$config_map" | kubectl apply -f -

write_success "Registry ConfigMap created"

stop_timer "Final configuration"
#endregion

#region Summary
echo ""
echo "✨ Development environment setup complete! ✨"
echo ""
echo "🔸 Cluster: $cluster_name"
echo "🔸 Nodes: $(kubectl get nodes --no-headers | wc -l)"
echo ""
echo "🌟 Docker Registry Information 🌟"
echo "🔸 Registry: image.registry.local:$registry_port"
echo "🔸 Registry UI: http://localhost:$registry_ui_port"
echo "🔸 Access credentials: Not required (open access)"
echo ""
echo "🔸 To push images to the registry:"
echo "   docker tag your-image:tag image.registry.local:$registry_port/your-image:tag"
echo "   docker push image.registry.local:$registry_port/your-image:tag"
echo ""
echo "🔸 Quick test:"
echo "   kubectl get nodes"
echo "   curl http://image.registry.local:$registry_port/v2/_catalog"
echo ""
echo "💡 Registry data is persisted in Docker volumes. Your registry data will be"
echo "   preserved even when you stop or delete your Kubernetes cluster."
#endregion