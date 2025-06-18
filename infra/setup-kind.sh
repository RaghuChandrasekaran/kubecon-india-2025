#!/bin/bash
# Requires: Docker, Kind, kubectl installed on Linux

# Exit on any error
set -e

# Configuration
echo -e "📛 Enter a cluster name: \c"
read cluster_name
reg_name="kind-registry"
reg_port="5001"  # Explicitly defined as string
kind_config_path="./kind-cluster-config.yaml"

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

stop_timer "Registry setup"

write_phase_summary "Registry Setup" \
  "Registry container status checked" \
  "Registry running on port $reg_port" \
  "Container health verified"
#endregion

#region Phase 2: Cluster Creation
write_phase "Creating Kind Cluster"

write_step "Validating cluster configuration..."
start_timer
stop_timer "Config validation"

write_step "Checking cluster status..."
start_timer
existing_clusters=$(kind get clusters)

# Clean up any existing cluster resources
write_step "Cleaning up any existing resources..."

if echo "$existing_clusters" | grep -q "^${cluster_name}$"; then
  write_progress "Deleting existing Kind cluster..."
  kind delete cluster --name "$cluster_name"
fi

# Clean up all related containers even if cluster delete failed
write_progress "Checking for leftover containers..."
container_patterns=(
  "${cluster_name}-control-plane"
  "${cluster_name}-worker"
  "kind-${cluster_name}-*"
)

for pattern in "${container_patterns[@]}"; do
  stuck_containers=$(docker ps -a --filter "name=$pattern" --format "{{.Names}}" || true)
  if [[ -n "$stuck_containers" ]]; then
    echo "$stuck_containers" | while read container; do
      write_progress "Removing container: $container"
      docker rm -f "$container" 2>/dev/null || true
    done
  fi
done

# Clean up any Kind networks if needed
kind_network=$(docker network ls --filter "name=kind" --format "{{.Name}}" || true)
if [[ -n "$kind_network" ]]; then
  write_progress "Removing old Kind network..."
  docker network rm kind 2>/dev/null || true
fi

# Give some time for resources to be cleaned up
write_progress "Waiting for cleanup to complete..."
sleep 5

write_step "Creating Kubernetes cluster..."

echo # Add some spacing for better readability
# Execute Kind directly to show its beautiful progress output
if ! kind create cluster --name "$cluster_name" --config "$kind_config_path"; then
  echo "Error: Failed to create cluster"
  exit 1
fi

echo # Add spacing after Kind output
write_success "Cluster created successfully"

# Verify cluster access
write_progress "Verifying cluster access..."
if nodes=$(kubectl get nodes -o wide 2>&1); then
  write_success "Cluster is accessible"
  echo -e "\nCluster Nodes:"
  echo "$nodes"
else
  write_warning "Cluster created but might not be fully ready yet"
fi

stop_timer "Cluster check/creation"

write_phase_summary "Cluster Creation" \
  "Old resources cleaned up" \
  "New cluster created: $cluster_name" \
  "Configuration applied from: $kind_config_path"
#endregion

#region Phase 3: Registry Integration
write_phase "Configuring Registry Access"

write_step "Setting up registry access in cluster nodes..."
start_timer
reg_host_dir="/etc/containerd/certs.d/image.registry.local:$reg_port"

# Verify cluster is ready before proceeding
write_progress "Waiting for cluster to be ready..."
retry_count=0
max_retries=30
while true; do
  kind_nodes=$(kind get nodes --name "$cluster_name" 2>/dev/null || true)
  if [[ -n "$kind_nodes" ]]; then
    node_count=$(echo "$kind_nodes" | wc -l)
    write_progress "Found cluster nodes: $node_count node(s)"
    break
  fi
  
  retry_count=$((retry_count + 1))
  if [[ $retry_count -eq $max_retries ]]; then
    echo "Error: Timeout waiting for cluster nodes to be ready"
    exit 1
  fi
  
  write_progress "Waiting for nodes to be ready... (Attempt $retry_count/$max_retries)"
  sleep 2
done

write_progress "Configuring $node_count cluster nodes..."

echo "$kind_nodes" | while read node; do
  write_progress "Setting up registry access on node: $node"
  docker exec "$node" mkdir -p "$reg_host_dir"
  hosts_toml="[host.\"http://$reg_name:5000\"]"
  echo "$hosts_toml" | docker exec -i "$node" /bin/sh -c "cat > $reg_host_dir/hosts.toml"
  write_success "Node $node configured successfully"
done

stop_timer "Registry config to Kind nodes"

write_step "Configuring network connectivity..."
start_timer
connected=$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' "$reg_name" 2>/dev/null || echo "null")
if [[ "$connected" == "null" ]]; then
  docker network connect "kind" "$reg_name"
  echo "✅ Connected registry to kind network."
else
  echo "🔗 Already connected."
fi
stop_timer "Network attachment"

write_phase_summary "Registry Integration" \
  "Registry configured on all nodes" \
  "Network connectivity established" \
  "Node configurations updated"
#endregion

#region Phase 4: Kubernetes Configuration
write_phase "Configuring Kubernetes Settings"

write_step "Creating registry configuration in Kubernetes..."
start_timer

write_step "Waiting for Kubernetes API..."
write_progress "Waiting for Kubernetes API to be ready..."
retry_count=0
max_retries=30
while true; do
  api_status=$(kubectl get --raw='/readyz' 2>/dev/null || echo "")
  if [[ "$api_status" == "ok" ]]; then
    write_progress "Kubernetes API is ready"
    break
  fi
  
  retry_count=$((retry_count + 1))
  if [[ $retry_count -eq $max_retries ]]; then
    echo "Error: Timeout waiting for Kubernetes API to be ready"
    exit 1
  fi
  
  write_progress "Waiting for API to be ready... (Attempt $retry_count/$max_retries)"
  sleep 2
done

# Create the ConfigMap
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

# Ensure kube-public namespace exists
kubectl create namespace kube-public --dry-run=client -o yaml | kubectl apply -f -

# Apply the ConfigMap
echo "$config_map" | kubectl apply -f - --validate=true
echo "✅ Registry ConfigMap created successfully"

stop_timer "Registry documentation setup"

write_phase_summary "Kubernetes Configuration" \
  "Kubernetes API ready" \
  "Registry ConfigMap created" \
  "Namespace configuration complete"
#endregion

#region Final Summary
write_phase "Setup Complete"

echo "✨ Your Kubernetes development environment is ready! ✨"
cat <<EOF

🔸 Environment Details:
   • Cluster Name: $cluster_name
   • Local Registry: image.registry.local:$reg_port
   • Config Path: $kind_config_path

🔸 Verify Setup:
   • Check nodes:    kubectl get nodes
   • Check system:   kubectl get pods -A
   • Check registry: curl http://image.registry.local:$reg_port/v2/_catalog

🔸 Quick Start:
   1. Tag an image:     docker tag myimage:latest image.registry.local:$reg_port/myimage:latest
   2. Push to registry: docker push image.registry.local:$reg_port/myimage:latest
   3. Deploy to K8s:    kubectl apply -f your-deployment.yaml

🔸 Documentation:
   • Kind:             https://kind.sigs.k8s.io/docs/user/quick-start/
   • Local Registry:   https://kind.sigs.k8s.io/docs/user/local-registry/
   • Kubernetes:       https://kubernetes.io/docs/home/
EOF
#endregion