#!/bin/bash
#==============================================================================
# E-Commerce Microservices Deployment Script
#==============================================================================
# 
# DESCRIPTION:
#   Simple script to deploy the e-commerce microservices to a Kubernetes cluster
#   with namespace substitution while maintaining proper directory structure
#   for kustomize to resolve base references correctly.
#
#==============================================================================

# Helper Functions
function write_phase() { echo -e "\n🚀 $1"; }
function write_step() { echo -e "\n📋 $1"; }
function write_success() { echo -e "✅ $1"; }
function write_warning() { echo -e "⚠️ $1"; }
function write_error() { echo -e "❌ $1"; }

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

# Get base path from devpilot.json
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEVPILOT_CONFIG="$PROJECT_DIR/.devpilot.json"

# Set default base path
BASE_PATH="$PROJECT_DIR/infra/k8s"

# Get base path from devpilot.json if available
if [ -f "$DEVPILOT_CONFIG" ] && command -v jq &> /dev/null; then
  CUSTOM_PATH=$(jq -r '.deployment_manifests_location // ""' "$DEVPILOT_CONFIG")
  if [ -n "$CUSTOM_PATH" ]; then
    # Make path absolute if relative
    if [[ "$CUSTOM_PATH" != /* ]]; then
      BASE_PATH="$PROJECT_DIR/$CUSTOM_PATH"
    else
      BASE_PATH="$CUSTOM_PATH"
    fi
  fi
fi

# Parse command line arguments
MODE="both"
PARAMS=()
ENVIRONMENT="local"  # Default environment

while (( "$#" )); do
  case "$1" in
    --infra) MODE="infra"; shift ;;
    --app) MODE="app"; shift ;;
    --profile) 
      if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
        ENVIRONMENT="$2"
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    *) 
      # Check if this might be a profile name without the --profile flag
      if [[ "$1" == "local" || "$1" == "azure" || "$1" == "dev" ]]; then
        ENVIRONMENT="$1"
        shift
      else
        PARAMS+=("$1")
        shift
      fi
      ;;
  esac
done

# Restore positional parameters
set -- "${PARAMS[@]}"

# Use current username as default namespace
DEFAULT_NAMESPACE=$(echo "$USER" | tr '.' '-')
USER_NAMESPACE=${1:-$DEFAULT_NAMESPACE}
# ENVIRONMENT is now set from the --profile argument or positional parameter

quickstart(){
  # Generate environment-specific endpoints
  if [ "$ENVIRONMENT" == "azure" ]; then
    # For Azure environment, we'll use the external IP/hostname
    write_step "Getting AKS ingress information..."
    
    # Try to get the ingress IP or hostname
    INGRESS_IP=$(kubectl -n $USER_NAMESPACE get svc store-ui-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    INGRESS_HOSTNAME=$(kubectl -n $USER_NAMESPACE get svc store-ui-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    
    # Use IP if available, otherwise hostname, or default to placeholder
    if [ -n "$INGRESS_IP" ]; then
      BASE_URL="http://$INGRESS_IP"
      write_success "Found AKS LoadBalancer IP: $INGRESS_IP"
    elif [ -n "$INGRESS_HOSTNAME" ]; then
      BASE_URL="http://$INGRESS_HOSTNAME"
      write_success "Found AKS LoadBalancer hostname: $INGRESS_HOSTNAME"
    else
      BASE_URL="http://<AKS-EXTERNAL-IP>"
      write_warning "Could not determine AKS external IP. Using placeholder. Check 'kubectl get svc -n $USER_NAMESPACE' for actual values."
    fi
    
    # Define Azure environment URLs
    STORE_URL="$BASE_URL"
    USERS_URL="$BASE_URL/users/docs"
    PRODUCTS_URL="$BASE_URL/products/api-docs/"
    CART_URL="$BASE_URL/cart/swagger-ui.html"
    SEARCH_URL="$BASE_URL/search/api/docs"
    
    ACCESS_NOTE="Use 'kubectl get svc -n $USER_NAMESPACE' to see service external IPs/hostnames if placeholders are shown."
  else
    # For local environment, use localhost with specific ports
    STORE_URL="http://localhost:8084"
    USERS_URL="http://localhost:9090/docs"
    PRODUCTS_URL="http://localhost:8081/api-docs/"
    CART_URL="http://localhost:8080/swagger-ui.html"
    SEARCH_URL="http://localhost:8082/api/docs"
    
    ACCESS_NOTE="These services will be available after you deploy the applications to the cluster or start them individually using their respective devspace_start.sh scripts."
  fi

  # Display header with environment
  echo -e "\n\033[1;45m                                                               \033[0m"
  echo -e "\033[1;45m  🌐 E-Commerce Application Services ($ENVIRONMENT environment)  \033[0m"
  echo -e "\033[1;45m                                                               \033[0m\n"

  echo -e "\033[1;36m🛍️  Storefront UI:\033[0m"
  echo -e "   \033[1;92m$STORE_URL\033[0m"
  echo -e "   \033[0;90m└─ The main user interface for the e-commerce platform\033[0m"

  echo -e "\n\033[1;36m👤 Users Service API:\033[0m"
  echo -e "   \033[1;92m$USERS_URL\033[0m"
  echo -e "   \033[0;90m└─ User management, authentication and profiles\033[0m"

  echo -e "\n\033[1;36m📦 Products Service API:\033[0m"
  echo -e "   \033[1;92m$PRODUCTS_URL\033[0m"
  echo -e "   \033[0;90m└─ Product catalog, inventory and pricing\033[0m"

  echo -e "\n\033[1;36m🛒 Cart Service API:\033[0m"
  echo -e "   \033[1;92m$CART_URL\033[0m"
  echo -e "   \033[0;90m└─ Shopping cart management and checkout process\033[0m"

  echo -e "\n\033[1;36m🔍 Search Service API:\033[0m"
  echo -e "   \033[1;92m$SEARCH_URL\033[0m"
  echo -e "   \033[0;90m└─ Product search and filtering functionality\033[0m"

  echo -e "\n\033[1;33m📝 Note:\033[0m $ACCESS_NOTE"

  # Add environment-specific notes
  if [ "$ENVIRONMENT" == "azure" ]; then
    echo -e "\n\033[1;34m🔹 Azure Deployment:\033[0m Services are exposed through an Ingress controller"
    echo -e "   Run the following command to check service status:"
    echo -e "   \033[0;37mkubectl get pods,svc -n $USER_NAMESPACE\033[0m"
  fi
}


# Create namespace if it doesn't exist
highlight_boxed_cmd "kubectl create namespace $USER_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -"
kubectl create namespace $USER_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy infrastructure if requested
if [ "$MODE" == "infra" ] || [ "$MODE" == "both" ]; then
  write_phase "Setting up infrastructure..."
  INFRA_PATH="$BASE_PATH/shared-services/overlays/$ENVIRONMENT"
  
  if [ -d "$INFRA_PATH" ]; then
    write_step "Applying infrastructure from $INFRA_PATH"
    highlight_boxed_cmd "kubectl apply -k $INFRA_PATH"
    kubectl apply -k "$INFRA_PATH" && write_success "Infrastructure deployed successfully" || write_error "Failed to deploy infrastructure"
  else
    write_warning "Infrastructure directory not found at: $INFRA_PATH"
  fi
fi

# Deploy application if requested
if [ "$MODE" == "app" ] || [ "$MODE" == "both" ]; then
  write_phase "Setting up application..."
  APP_OVERLAY_PATH="$BASE_PATH/apps/overlays/$ENVIRONMENT"
  APP_BASE_PATH="$BASE_PATH/apps/base"
  
  if [ -d "$APP_OVERLAY_PATH" ]; then
    # Create a temp directory that preserves the directory structure
    TEMP_DIR=$(mktemp -d)
    write_step "Created temporary directory: $TEMP_DIR"
    
    # Create the proper directory structure in the temp directory
    mkdir -p "$TEMP_DIR/apps/overlays/$ENVIRONMENT"
    mkdir -p "$TEMP_DIR/apps/base"
    
    # Copy the overlay and base directories
    cp -r "$APP_OVERLAY_PATH"/* "$TEMP_DIR/apps/overlays/$ENVIRONMENT/"
    if [ -d "$APP_BASE_PATH" ]; then
      cp -r "$APP_BASE_PATH"/* "$TEMP_DIR/apps/base/"
    fi
    
    # Replace namespace placeholder in all yaml files
    find "$TEMP_DIR" -name "*.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \;
    
    # Apply with kustomize
    write_step "Applying application manifests with kustomize..."
    highlight_boxed_cmd "kubectl apply -k $TEMP_DIR/apps/overlays/$ENVIRONMENT"
    kubectl apply -k "$TEMP_DIR/apps/overlays/$ENVIRONMENT" && write_success "Application deployed successfully with kustomize" || {
      write_warning "Kustomize failed, applying YAML files directly"
      find "$TEMP_DIR/apps/overlays/$ENVIRONMENT" -name "*.yaml" ! -name "kustomization.yaml" -exec kubectl apply -f {} \;
    }
    
    # Clean up
    rm -rf "$TEMP_DIR"
  else
    write_warning "Application directory not found at: $APP_OVERLAY_PATH"
  fi
  
  write_success "Application setup completed"
  quickstart $@
fi

write_success "Environment setup completed successfully!"