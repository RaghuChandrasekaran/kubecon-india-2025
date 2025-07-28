#!/bin/bash
#==============================================================================
# 🚀 Development Environment Setup Script 🚀
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

# Get the script directory and project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Trap SIGINT (Ctrl+C) to handle script interruption gracefully
trap 'echo -e "\n🛑 Script interrupted! Exiting gracefully..."; exit 1' SIGINT

# Function to display elapsed time
function display_time() {
  local T=$1
  local H=$((T/3600))
  local M=$((T%3600/60))
  local S=$((T%60))
  (( $H > 0 )) && printf "%d hours " $H
  (( $M > 0 )) && printf "%d minutes " $M
  (( $H > 0 || $M > 0 )) && printf "and "
  printf "%d seconds\n" $S
}

# Configuration - support both interactive and non-interactive modes
cluster_name="devpilot-cluster"  # Default cluster name

# Check if provided as command line argument
if [[ -n "$1" ]]; then
  cluster_name="$1"
  echo "📛 Using cluster name: $cluster_name"
else
  # Interactive prompt with clear visibility
  echo -e "\n🖥️  \033[1;36mE-Commerce Microservices Development Environment\033[0m 🖥️"
  echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  echo -e "📛 Enter a cluster name (default: 'devpilot-cluster'):"
  echo -n "   > "
  read -r input_cluster_name
  
  # Only update if user provided something
  if [[ -n "$input_cluster_name" ]]; then
    cluster_name="$input_cluster_name"
  fi
  
  echo -e "\n🔠 Using cluster name: \033[1;32m$cluster_name\033[0m"
fi

# Configuration - Using alternative port 9080 instead of 8080 to avoid conflicts
registry_name="kind-registry"
registry_port="5001"        # Registry port
registry_ui_port="9080"     # Changed UI port to avoid conflict with port 8080
kind_config_path="$SCRIPT_DIR/kind-cluster-config.yaml"

echo -e "\n🏗️  \033[1;33mSetting up development environment\033[0m 🏗️"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Set the overall start time for the installation process
overall_start_time=$SECONDS

# Helper Functions
function write_phase() { echo -e "\n\033[1;34m📋 Phase: $1\033[0m\n"; }
function write_step() { echo -e "   \033[1;36m$1\033[0m"; }
function write_progress() { echo -e "   \033[0;36m→ $1\033[0m"; }
function write_success() { echo -e "   \033[0;32m✓ $1\033[0m"; }
function write_warning() { echo -e "   \033[0;33m⚠ $1\033[0m"; }
function write_error() { echo -e "   \033[0;31m❌ $1\033[0m"; }

function start_timer() { start_time=$(date +%s.%N); }
function stop_timer() {
  local end_time=$(date +%s.%N)
  local elapsed=$(echo "$end_time - $start_time" | bc)
  local task_name="$1"
  
  if (( $(echo "$elapsed >= 60" | bc -l) )); then
    local formatted_time=$(echo "scale=1; $elapsed / 60" | bc)
    echo -e "⏱️  \033[0;33m$task_name completed in ${formatted_time} minutes\033[0m\n"
  elif (( $(echo "$elapsed >= 1" | bc -l) )); then
    local formatted_time=$(echo "scale=1; $elapsed" | bc)
    echo -e "⏱️  \033[0;33m$task_name completed in ${formatted_time} seconds\033[0m\n"
  else
    local formatted_time=$(echo "scale=0; $elapsed * 1000" | bc)
    echo -e "⏱️  \033[0;33m$task_name completed in ${formatted_time} milliseconds\033[0m\n"
  fi
}

function write_phase_summary() {
  local phase="$1"
  shift
  local completed_steps=("$@")
  
  echo -e "\n\033[1;32m📍 Phase Summary: $phase\033[0m"
  for step in "${completed_steps[@]}"; do
    echo -e "   \033[0;32m✓ $step\033[0m"
  done
  echo ""
}

NC='\033[0m'           # No Color
BYELLOW='\033[1;33m'   # Bright yellow
BCYAN='\033[1;36m'     # Bright cyan
BWHITE='\033[1;37m'    # Bright white
function highlight_boxed_cmd() {
    local text="$1"
    local color="${2:-$BYELLOW}"
    local width=$(( ${#text} + 4 ))
    
    echo -e "${color}┌$( printf '─%.0s' $(seq 1 $width) )┐${NC}"
    echo -e "${color}│  ${BWHITE}$text${color}  │${NC}"
    echo -e "${color}└$( printf '─%.0s' $(seq 1 $width) )┘${NC}"
}


#region Pre-flight Checks
write_phase "Pre-flight Checks"

write_step "Checking required tools..."
start_timer

tools=("docker:Docker" "kind:Kind" "kubectl:kubectl" "bc:BC Calculator")

for tool_info in "${tools[@]}"; do
  cmd="${tool_info%%:*}"
  name="${tool_info#*:}"
  
  if command -v "$cmd" >/dev/null 2>&1; then
    write_progress "$name is installed"
  else
    write_error "$name is not installed or not in PATH"
    echo -e "\n\033[1;31m⚠️  Required tool missing: $name\033[0m"
    case "$cmd" in
      "docker")
        echo -e "📦 Docker installation guide: \033[0;36mhttps://docs.docker.com/engine/install/ubuntu/\033[0m"
        ;;
      "kind")
        echo -e "📦 Kind installation guide: \033[0;36mhttps://kind.sigs.k8s.io/docs/user/quick-start\033[0m"
        ;;
      "kubectl")
        echo -e "📦 kubectl installation guide: \033[0;36mhttps://kubernetes.io/docs/tasks/tools/install-kubectl-linux/\033[0m"
        ;;
      "bc")
        echo -e "📦 BC installation guide: \033[0;36msudo apt-get install bc\033[0m"
        ;;
    esac
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
  highlight_boxed_cmd "docker volume create registry-data"
  docker volume create registry-data || true
  
  # Pull and run the Docker registry
  write_progress "Starting registry container..."
  
  # Using registry:2 image with CORS enabled
  highlight_boxed_cmd "docker run -d --name $registry_name -p $registry_port:5000 registry:2"
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
  highlight_boxed_cmd "docker run -d --name registry-ui -p $registry_ui_port:80 joxit/docker-registry-ui:latest"
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
    highlight_boxed_cmd "docker start $registry_name"
    docker start "$registry_name"
  fi
  
  # Check for UI container
  ui_exists=$(docker ps -a --format '{{.Names}}' | grep -E "^registry-ui$" || true)
  if [[ -z "$ui_exists" ]]; then
    write_progress "Starting registry UI container..."
    highlight_boxed_cmd "docker run -d --name registry-ui -p $registry_ui_port:80 joxit/docker-registry-ui:latest"
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
      highlight_boxed_cmd "docker start registry-ui"
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
  write_warning "Kind cluster with name '$cluster_name' already exists."
  write_progress "Proceeding with the existing cluster to avoid data loss..."
  
  # Set kubectl context to the existing cluster
  write_progress "Setting kubectl context to the existing cluster..."
  kubectl cluster-info --context kind-$cluster_name
  
  write_success "Using existing cluster: $cluster_name"
else
  write_progress "Cluster ${cluster_name} does not exist. Creating new cluster..."
  
  # Clean up any leftover containers
  write_progress "Cleaning up any leftover containers..."
  highlight_boxed_cmd "docker rm -f ${cluster_name}-control-plane ${cluster_name}-worker"
  docker rm -f "${cluster_name}-control-plane" "${cluster_name}-worker" 2>/dev/null || true
  
  # Give time for cleanup
  sleep 3
  
  write_step "Creating Kubernetes cluster..."
  
  # Create cluster with better error handling
  highlight_boxed_cmd "kind create cluster --name $cluster_name --config $kind_config_path"
  if ! kind create cluster --name "$cluster_name" --config "$kind_config_path"; then
    write_error "Failed to create cluster $cluster_name"
    exit 1
  fi
  
  write_success "Cluster created successfully"
fi

# Quick verification
write_progress "Verifying cluster..."
if kubectl get nodes >/dev/null 2>&1; then
  write_success "Cluster is accessible"
else
  write_warning "Cluster not immediately accessible, waiting..."
  sleep 5
  if kubectl get nodes >/dev/null 2>&1; then
    write_success "Cluster is now accessible after waiting"
  else
    write_error "Cluster is not accessible, there might be an issue with the setup"
    exit 1
  fi
fi

stop_timer "Cluster setup"

write_phase_summary "Cluster Creation" \
  "Cluster status checked" \
  "Using cluster: $cluster_name" \
  "Cluster configuration verified"
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
    highlight_boxed_cmd "docker exec $node mkdir -p $reg_host_dir"
    docker exec "$node" mkdir -p "$reg_host_dir"
    hosts_toml="[host.\"http://image.registry.local:$registry_port\"]"
    echo "$hosts_toml" | docker exec -i "$node" /bin/sh -c "cat > $reg_host_dir/hosts.toml"
    write_success "Node $node configured"
  fi
done

# Connect registry container to kind network
write_progress "Connecting registry to cluster network..."
highlight_boxed_cmd "docker network connect kind $registry_name"
docker network connect "kind" "$registry_name" || true
write_progress "Connecting UI container to cluster network..."
highlight_boxed_cmd "docker network connect kind registry-ui"
docker network connect "kind" "registry-ui" || true
write_success "Networks connected"

stop_timer "Registry integration"

write_phase_summary "Registry Integration" \
  "Registry linked to Kind cluster" \
  "Network connectivity established"
#endregion

#region Phase 4: Final Setup
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

# Set container restart policies
write_step "Setting container restart policies..."

# Get all containers related to the cluster
cluster_containers=("${cluster_name}-control-plane")
if docker ps -a --format '{{.Names}}' | grep -q "${cluster_name}-worker"; then
  cluster_containers+=("${cluster_name}-worker")
fi

# Update restart policy for only Kind cluster containers
for container in "${cluster_containers[@]}"; do
  if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
    write_progress "Setting restart policy for $container to 'no'..."
    docker update --restart=no "$container"
  fi
done

stop_timer "Final configuration"

write_phase_summary "Final Configuration" \
  "Registry ConfigMap created" \
  "Container restart policies set to manual"
#endregion

# Calculate overall elapsed time
overall_end_time=$SECONDS
overall_elapsed_time=$((overall_end_time - overall_start_time))

#region Summary
echo -e "\n\033[1;42m                                                               \033[0m"
echo -e "\033[1;42m  ✨ Development Environment Setup Complete! ✨                  \033[0m"
echo -e "\033[1;42m                                                               \033[0m\n"

echo -e "\033[1;33m🕒 Total installation time: $(display_time $overall_elapsed_time)\033[0m\n"

echo -e "\033[1;34m📌 Cluster Information\033[0m"
echo -e "━━━━━━━━━━━━━━━━━━━━━━"
echo -e "🔸 Cluster name: \033[1;32m$cluster_name\033[0m"
echo -e "🔸 Nodes: \033[1;32m$(kubectl get nodes --no-headers | wc -l)\033[0m"
echo -e "🔸 Status: \033[1;32mRunning\033[0m"

echo -e "\n\033[1;34m📌 Docker Registry Information\033[0m"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "🔸 Registry: \033[1;32mimage.registry.local:$registry_port\033[0m"
echo -e "🔸 Registry UI: \033[1;32mhttp://localhost:$registry_ui_port\033[0m"
echo -e "🔸 Access credentials: \033[1;32mNot required (open access)\033[0m"

echo -e "\n\033[1;34m📌 Container Restart Policy\033[0m"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "🔸 Kind Cluster Containers: \033[1;32mNo auto-restart\033[0m"
echo -e "🔸 Registry Containers: \033[1;32mAlways auto-restart\033[0m"
echo -e "🔸 Note: \033[0;33mKind cluster containers will not auto-start when your computer reboots\033[0m"

echo -e "\n\033[1;34m📌 Usage Instructions\033[0m"
echo -e "━━━━━━━━━━━━━━━━━━━━"
echo -e "🔸 To push images to the registry:"
echo -e "   \033[0;36mdocker tag your-image:tag image.registry.local:$registry_port/your-image:tag\033[0m"
echo -e "   \033[0;36mdocker push image.registry.local:$registry_port/your-image:tag\033[0m"

echo -e "\n🔸 Quick test commands:"
echo -e "   \033[0;36mkubectl get nodes\033[0m"
echo -e "   \033[0;36mcurl http://image.registry.local:$registry_port/v2/_catalog\033[0m"

echo -e "\n\033[1;34m📌 Stopping and Starting\033[0m"
echo -e "━━━━━━━━━━━━━━━━━━━━━━"
echo -e "🔸 To stop the cluster: \033[0;36mdocker stop ${cluster_containers[*]}\033[0m"
echo -e "🔸 To start the cluster: \033[0;36mdocker start ${cluster_containers[*]}\033[0m"

echo -e "\n\033[0;32m💡 Registry data is persisted in Docker volumes. Your registry data will be\033[0m"
echo -e "\033[0;32m   preserved even when you stop or delete your Kubernetes cluster.\033[0m"
#endregion

highlight_boxed_cmd "kind get clusters"
kind get clusters