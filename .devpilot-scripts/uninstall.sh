#!/bin/bash
#==============================================================================
# E-Commerce Microservices Uninstall Script
#==============================================================================
# 
# DESCRIPTION:
#   Simple script to uninstall the e-commerce microservices from a Kubernetes 
#   cluster with a single command approach.
#
# USAGE:
#   ./uninstall.sh [NAMESPACE] [ENVIRONMENT] [--infra|--app]
#
# ARGUMENTS:
#   NAMESPACE   - Kubernetes namespace to remove from (defaults to current username)
#   ENVIRONMENT - Target environment (local, dev, prod, etc.) (defaults to "local")
#
# OPTIONS:
#   --infra     - Remove only shared infrastructure components
#   --app       - Remove only application microservices
#
#==============================================================================

# Helper Functions
function write_phase() { echo -e "\n🚀 $1"; }
function write_step() { echo -e "\n📋 $1"; }
function write_success() { echo -e "✅ $1"; }
function write_warning() { echo -e "⚠️ $1"; }
function write_error() { echo -e "❌ $1"; }
function write_trash() { echo -e "🗑️ $1"; }
function write_info() { echo -e "ℹ️ $1"; }

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

# Track start time
START_TIME=$(date +%s)

write_trash "Starting uninstallation from namespace: $USER_NAMESPACE"
write_info "Environment: $ENVIRONMENT"

# Uninstall application if requested
if [ "$MODE" == "app" ] || [ "$MODE" == "both" ]; then
  write_phase "Uninstalling application components..."
  APP_PATH="$BASE_PATH/apps/overlays/$ENVIRONMENT"
  
  if [ -d "$APP_PATH" ]; then
    # Create a temp directory for namespace substitution
    TEMP_DIR=$(mktemp -d)
    write_step "Created temporary directory: $TEMP_DIR"
    
    # Create the proper directory structure in the temp directory
    mkdir -p "$TEMP_DIR/apps/overlays/$ENVIRONMENT"
    mkdir -p "$TEMP_DIR/apps/base"
    
    # Copy the overlay and base directories
    cp -r "$APP_PATH"/* "$TEMP_DIR/apps/overlays/$ENVIRONMENT/" 2>/dev/null
    
    APP_BASE_PATH="$BASE_PATH/apps/base"
    if [ -d "$APP_BASE_PATH" ]; then
      cp -r "$APP_BASE_PATH"/* "$TEMP_DIR/apps/base/" 2>/dev/null
    fi
    
    # Replace namespace placeholder in all yaml files
    find "$TEMP_DIR" -name "*.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \; 2>/dev/null
    
    # Single command to uninstall all application components
    write_trash "Uninstalling all application components with a single command..."
    kubectl delete -k "$TEMP_DIR/apps/overlays/$ENVIRONMENT" --ignore-not-found && 
      write_success "All application components uninstalled" || 
      write_warning "Some application components may not have been uninstalled completely"
    
    # Clean up
    rm -rf "$TEMP_DIR"
  else
    write_warning "Application directory not found at: $APP_PATH"
  fi
  
  write_success "Application uninstallation completed"
fi

# Uninstall infrastructure if requested
if [ "$MODE" == "infra" ] || [ "$MODE" == "both" ]; then
  write_phase "Uninstalling shared infrastructure..."
  INFRA_PATH="$BASE_PATH/shared-services/overlays/$ENVIRONMENT"
  
  if [ -d "$INFRA_PATH" ]; then
    write_step "Removing infrastructure from $INFRA_PATH"
    kubectl delete -k "$INFRA_PATH" --ignore-not-found && 
      write_success "Infrastructure removed" || 
      write_error "Failed to remove infrastructure"
  else
    write_warning "Infrastructure directory not found at: $INFRA_PATH"
  fi
fi

# If app mode or both, remove the namespace
if [ "$MODE" == "app" ] || [ "$MODE" == "both" ]; then
  write_trash "Removing namespace: $USER_NAMESPACE"
  kubectl delete namespace "$USER_NAMESPACE" --ignore-not-found
  write_success "Namespace removed"
fi

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

write_success "Uninstallation completed in ${MINUTES}m ${SECONDS}s"

if [ "$MODE" == "app" ]; then
  write_info "Only application components were removed"
  write_info "Shared infrastructure is preserved"
  write_info "To remove shared infrastructure, run with: $0 $USER_NAMESPACE $ENVIRONMENT --infra"
elif [ "$MODE" == "infra" ]; then
  write_info "Only shared infrastructure was removed"
  write_info "To remove application components, run with: $0 $USER_NAMESPACE $ENVIRONMENT --app"
fi