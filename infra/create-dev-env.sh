#!/bin/bash
# Bash equivalent of create-dev-env.ps1

# Command line arguments handling
RESET=false
CONTINUE=false
STEP=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--reset)
      RESET=true
      shift
      ;;
    -c|--continue)
      CONTINUE=true
      shift
      ;;
    -s|--step)
      STEP="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--reset] [--continue] [--step <step_name>]"
      echo "Available steps: prerequisites, cluster, images, infrastructure, applications"
      exit 1
      ;;
  esac
done

# Check if step is valid
if [[ -n "$STEP" ]]; then
  valid_steps=("prerequisites" "cluster" "images" "infrastructure" "applications")
  if [[ ! " ${valid_steps[@]} " =~ " ${STEP} " ]]; then
    echo "Invalid step: $STEP"
    echo "Available steps: ${valid_steps[*]}"
    exit 1
  fi
fi

# Helper Functions - Colors and formatting
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Source common styling functions if available
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/build-and-push-images.sh" ]]; then
  source "$SCRIPT_DIR/build-and-push-images.sh"
fi

# State management
STATE_FILE="$SCRIPT_DIR/.dev-env-state"

function get_setup_state() {
  if [[ -f "$STATE_FILE" ]]; then
    cat "$STATE_FILE"
  else
    echo "init"
  fi
}

function update_setup_state() {
  echo "$1" > "$STATE_FILE"
}

function reset_setup_state() {
  if [[ -f "$STATE_FILE" ]]; then
    rm "$STATE_FILE"
  fi
}

function write_phase() {
  echo -e "\n${CYAN}🚀 $1${NC}"
}

function write_step() {
  echo -e "\n${YELLOW}📋 $1${NC}"
}

function write_progress() {
  echo -e "   ${GRAY}$1${NC}"
}

function write_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

function write_warning() {
  echo -e "${RED}⚠️ $1${NC}"
}

function test_command() {
  if command -v "$1" &> /dev/null; then
    return 0
  else
    return 1
  fi
}

function test_prerequisites() {
  write_phase "Checking Prerequisites"
  
  prerequisites=("docker:Docker" "kind:KinD (Kubernetes in Docker)" "kubectl:kubectl")
  
  all_present=true
  for prereq in "${prerequisites[@]}"; do
    cmd="${prereq%%:*}"
    name="${prereq#*:}"
    
    if test_command "$cmd"; then
      write_success "$name is installed"
    else
      write_warning "$name is not installed!"
      all_present=false
    fi
  done
  
  if [[ "$all_present" == "false" ]]; then
    write_warning "Please install missing prerequisites and try again"
    exit 1
  fi
}

function initialize_dev_cluster() {
  write_phase "Setting up KinD Cluster"
  
  # Run the setup-kind script
  bash "$SCRIPT_DIR/setup-kind.sh"
  if [[ $? -ne 0 ]]; then
    write_warning "Failed to setup KinD cluster"
    exit 1
  fi
}

function build_push_images() {
  write_phase "Building and Pushing Images"
  
  # Run the build and push script
  bash "$SCRIPT_DIR/build-and-push-images.sh"
  if [[ $? -ne 0 ]]; then
    write_warning "Failed to build and push images"
    exit 1
  fi
}

function deploy_infrastructure() {
  write_phase "Deploying Shared Infrastructure"
  
  write_step "Deploying shared services (Redis, MongoDB, Elasticsearch)"
  kubectl apply -k "$SCRIPT_DIR/k8s/shared-services/overlays/local"
  if [[ $? -ne 0 ]]; then
    write_warning "Failed to deploy shared services"
    exit 1
  fi
  write_success "Shared services deployed successfully"
  
  # Wait for shared services to be ready
  write_progress "Waiting for shared services to be ready..."
  sleep 10
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=shared-services -n shared-services --timeout=120s
}

function deploy_applications() {
  write_phase "Deploying Application Services"
  
  write_step "Deploying application services"
  kubectl apply -k "$SCRIPT_DIR/k8s/apps/overlays/local"
  if [[ $? -ne 0 ]]; then
    write_warning "Failed to deploy application services"
    exit 1
  fi
  write_success "Application services deployed successfully"
  
  # Wait for applications to be ready
  write_progress "Waiting for application services to be ready..."
  sleep 10
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=application -n e-commerce --timeout=180s
}

function show_environment_info() {
  write_phase "Environment Information"
  
  echo -e "\nAccess your applications:"
  echo "Store UI: http://localhost:80"
  echo "API Endpoints:"
  echo "  - Cart Service:     http://localhost:8080"
  echo "  - Products Service: http://localhost:8081"
  echo "  - Search Service:   http://localhost:8082"
  echo "  - Users Service:    http://localhost:8083"
  
  echo -e "\nUseful commands:"
  echo "  kubectl get pods -A              # List all pods"
  echo "  kubectl get services -A          # List all services"
  echo "  kubectl logs -f <pod-name>       # Follow pod logs"
  echo -e "\nTo clean up the environment:"
  echo "  kind delete cluster --name e-commerce-cluster"
}

# Main execution flow
try_main() {
  echo -e "${CYAN}🚀 Creating Development Environment${NC}"
  
  # Get current state
  current_state=$(get_setup_state)
  
  if [[ "$RESET" == "true" ]]; then
    reset_setup_state
    current_state="init"
    echo -e "${YELLOW}Reset setup state. Starting fresh.${NC}"
  fi
  
  # Define the steps
  declare -a steps=(
    "prerequisites:test_prerequisites:Checking prerequisites"
    "cluster:initialize_dev_cluster:Setting up KinD cluster"
    "images:build_push_images:Building and pushing images"
    "infrastructure:deploy_infrastructure:Deploying infrastructure"
    "applications:deploy_applications:Deploying applications"
  )
  
  # Determine start index
  start_index=0
  
  if [[ -n "$STEP" ]]; then
    for i in "${!steps[@]}"; do
      step_name="${steps[$i]%%:*}"
      if [[ "$step_name" == "$STEP" ]]; then
        start_index=$i
        echo -e "${YELLOW}Starting from ${steps[$i]##*:}${NC}"
        break
      fi
    done
  elif [[ "$CONTINUE" == "true" && "$current_state" != "init" ]]; then
    for i in "${!steps[@]}"; do
      step_name="${steps[$i]%%:*}"
      if [[ "$step_name" == "$current_state" ]]; then
        start_index=$((i + 1))
        if [[ $start_index -lt ${#steps[@]} ]]; then
          echo -e "${YELLOW}Continuing from ${steps[$start_index]##*:}${NC}"
        fi
        break
      fi
    done
  fi
  
  # Execute steps
  for ((i=start_index; i<${#steps[@]}; i++)); do
    step="${steps[$i]}"
    step_name="${step%%:*}"
    step_function="${step#*:}"
    step_function="${step_function%%:*}"
    
    # Execute the function
    $step_function
    
    # Update state
    update_setup_state "$step_name"
  done
  
  show_environment_info
  update_setup_state "complete"
  write_success "Development environment is ready!"
  
  return 0
}

# Execute main function with error handling
try_main || {
  write_warning "Failed to create development environment: $?"
  echo -e "\nTo continue from this point later, run:"
  echo "    ./create-dev-env.sh --continue"
  echo "To start fresh:"
  echo "    ./create-dev-env.sh --reset"
  exit 1
}