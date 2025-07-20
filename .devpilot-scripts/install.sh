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

while (( "$#" )); do
  case "$1" in
    --infra) MODE="infra"; shift ;;
    --app) MODE="app"; shift ;;
    *) PARAMS+=("$1"); shift ;;
  esac
done

# Restore positional parameters
set -- "${PARAMS[@]}"

# Use current username as default namespace
DEFAULT_NAMESPACE=$(echo "$USER" | tr '.' '-')
USER_NAMESPACE=${1:-$DEFAULT_NAMESPACE}
ENVIRONMENT=${2:-"local"}  # Default to local if not specified

# Create namespace if it doesn't exist
kubectl create namespace $USER_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy infrastructure if requested
if [ "$MODE" == "infra" ] || [ "$MODE" == "both" ]; then
  write_phase "Setting up infrastructure..."
  INFRA_PATH="$BASE_PATH/shared-services/overlays/$ENVIRONMENT"
  
  if [ -d "$INFRA_PATH" ]; then
    write_step "Applying infrastructure from $INFRA_PATH"
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
fi

write_success "Environment setup completed successfully!"
