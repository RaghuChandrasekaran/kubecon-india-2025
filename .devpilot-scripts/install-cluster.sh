#!/bin/bash
# Requires: Docker, Kind, kubectl installed on Linux

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

reg_name="kind-registry"
reg_port="5001"
kind_config_path="$HOME/.devpilot-scripts/kind-cluster-config.yaml"

echo "📛 Setting up cluster: $cluster_name"

# Helper Functions
function write_phase() {
  echo -e "\n📋 Phase: $1\n" 
}

function write_step() {
  echo -e "   $1"
}

function write_progress() {
  echo -e "   → $1"
}

function write_success() {
  echo -e "   ✓ $1"
}

function write_warning() {
  echo -e "   ⚠ $1"
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

function start_timer() {
  start_time=$(date +%s.%N)
}

function stop_timer() {
  local end_time=$(date +%s.%N)
  local elapsed=$(echo "$end_time - $start_time" | bc)
  local task_name="$1"
  
  # Format time in a user-friendly way
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

#region Pre-flight Checks
write_phase "Pre-flight Checks"

write_step "Validating configuration..."
start_timer

if [[ -z "$reg_port" ]]; then
  echo "Error: Registry port cannot be empty"
  exit 1
fi

if [[ ! -f "$kind_config_path" ]]; then
  echo "Error: Kind cluster config file not found at $kind_config_path"
  exit 1
fi

write_step "Checking required tools..."
tools=("docker:Docker" "kind:Kind" "kubectl:kubectl")

for tool_info in "${tools[@]}"; do
  cmd="${tool_info%%:*}"
  name="${tool_info#*:}"
  
  if command -v "$cmd" >/dev/null 2>&1; then
    write_progress "$name is installed"
  else
    echo "Error: $name is not installed or not in PATH"
    exit 1
  fi
done

stop_timer "Pre-flight validation"

write_phase_summary "Pre-flight Checks" \
  "Configuration validated" \
  "Required files checked" \
  "Required tools verified"
#endregion

#region Phase 1: Local Registry Setup
write_phase "Setting up Local Registry"

write_step "Checking for existing registry container..."
start_timer

reg_exists=$(docker ps -a --format '{{.Names}}' | grep -E "^${reg_name}$" || true)
if [[ -z "$reg_exists" ]]; then
  write_step "Setting up new registry container..."
  write_progress "Pulling registry:2 image..."
  
  if ! docker pull registry:2; then
    echo "Error: Failed to pull registry image"
    exit 1
  fi
  write_success "Registry image pulled successfully"
  
  write_progress "Starting registry container on port ${reg_port}..."
  container_id=$(docker run -d --restart=always -p "${reg_port}:5000" --name "$reg_name" registry:2)
  if [[ -n "$container_id" ]]; then
    write_progress "Waiting for registry to be ready..."
    sleep 2
    health=$(docker inspect --format='{{.State.Status}}' "$reg_name")
    write_progress "Registry status: $health"
    if [[ "$health" == "running" ]]; then
      echo "✅ Registry container successfully created and running"
    else
      echo "Error: Registry container is not running. Status: $health"
      exit 1
    fi
  fi
else
  echo "✅ Registry already exists, checking status..."
  health=$(docker inspect --format='{{.State.Status}}' "$reg_name")
  write_progress "Registry status: $health"
  if [[ "$health" != "running" ]]; then
    write_progress "Starting existing registry container..."
    docker start "$reg_name"
  fi
fi

# CRITICAL FIX: Connect registry to kind network BEFORE creating cluster
write_progress "Ensuring registry is connected to kind network..."
if ! docker network inspect kind >/dev/null 2>&1; then
  write_progress "Creating kind network..."
  docker network create kind 2>/dev/null || true
fi

# Check if registry is already connected to kind network
if ! docker inspect "$reg_name" --format '{{.NetworkSettings.Networks.kind}}' >/dev/null 2>&1; then
  write_progress "Connecting registry to kind network..."
  docker network connect "kind" "$reg_name"
  write_success "Registry connected to kind network"
else
  write_progress "Registry already connected to kind network"
fi

stop_timer "Registry setup"

write_phase_summary "Registry Setup" \
  "Registry container status checked" \
  "Registry running on port $reg_port" \
  "Registry connected to kind network" \
  "Container health verified"
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
  echo "Error: Failed to create cluster $cluster_name"
  exit 1
fi

write_success "Cluster created successfully"

# Quick verification
write_progress "Verifying cluster..."
if kubectl get nodes >/dev/null 2>&1; then
  write_success "Cluster is accessible"
else
  echo "Warning: Cluster created but not immediately accessible"
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
reg_host_dir="/etc/containerd/certs.d/image.registry.local:$reg_port"

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
    echo "Error: Could not get cluster nodes after $max_retries attempts"
    exit 1
  fi
  
  write_progress "Waiting for nodes... (Attempt $retry_count/$max_retries)"
  sleep 2
done

# Configure each node
echo "$kind_nodes" | while read -r node; do
  if [[ -n "$node" ]]; then
    write_progress "Configuring node: $node"
    docker exec "$node" mkdir -p "$reg_host_dir"
    hosts_toml="[host.\"http://$reg_name:5000\"]"
    echo "$hosts_toml" | docker exec -i "$node" /bin/sh -c "cat > $reg_host_dir/hosts.toml"
    write_success "Node $node configured"
  fi
done

stop_timer "Registry integration"

write_phase_summary "Registry Integration" \
  "Registry configured on all nodes" \
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
    host: "image.registry.local:$reg_port"
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
echo "✨ Cluster setup complete! ✨"
echo ""
echo "🔸 Cluster: $cluster_name"
echo "🔸 Registry: image.registry.local:$reg_port"
echo "🔸 Nodes: $(kubectl get nodes --no-headers | wc -l)"
echo ""
echo "🔸 Quick test:"
echo "   kubectl get nodes"
echo "   curl http://image.registry.local:$reg_port/v2/_catalog"
echo ""
#endregion