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
#   ./uninstall.sh [NAMESPACE] [--all|--infra|--app] [--profile|-p PROFILE] [--name|-n NAME]
#
# ARGUMENTS:
#   NAMESPACE   - Kubernetes namespace to remove from (defaults to current username)
#
# OPTIONS:
#   --all       - Delete all resources (both infrastructure and application)
#   --infra     - Delete only shared infrastructure components
#   --app       - Delete only application microservices
#   --profile, -p - Environment profile to use (e.g., local, azure, aws) [default: local]
#   --name, -n    - Name of the cluster [default: None]
#
#==============================================================================

# ANSI color codes for rich formatting with better contrast on dark backgrounds
RED='\033[1;31m'        # Bright Red (bold)
GREEN='\033[1;32m'      # Bright Green (bold)
YELLOW='\033[1;33m'     # Bright Yellow (bold)
BLUE='\033[1;34m'       # Bright Blue (bold)
MAGENTA='\033[1;35m'    # Bright Magenta (bold)
CYAN='\033[1;36m'       # Bright Cyan (bold)
WHITE='\033[1;37m'      # Bright White (bold)
GRAY='\033[1;90m'       # Bright Black (bold gray)
BOLD='\033[1m'
RESET='\033[0m'
NC='\033[0m'           # No Color
BYELLOW='\033[1;33m'   # Bright yellow
BCYAN='\033[1;36m'     # Bright cyan
BWHITE='\033[1;37m'    # Bright white

# Function to highlight important commands in a golden rectangular box
function highlight_boxed_cmd() {
    local text="$1"
    local color="${2:-$BYELLOW}"
    local width=$(( ${#text} + 4 ))
    
    echo -e "${color}┌$( printf '─%.0s' $(seq 1 $width) )┐${NC}"
    echo -e "${color}│  ${BWHITE}$text${color}  │${NC}"
    echo -e "${color}└$( printf '─%.0s' $(seq 1 $width) )┘${NC}"
}

# Helper Functions with high-contrast formatting
function write_phase() { echo -e "\n${BLUE}🚀 $1${RESET}"; }
function write_step() { echo -e "\n${CYAN}📋 $1${RESET}"; }
function write_success() { echo -e "${GREEN}✅ $1${RESET}"; }
function write_warning() { echo -e "${YELLOW}⚠️ $1${RESET}"; }
function write_error() { echo -e "${RED}❌ $1${RESET}"; }
function write_trash() { echo -e "${MAGENTA}🗑️ $1${RESET}"; }
function write_info() { echo -e "${BLUE}ℹ️ $1${RESET}"; }
function write_command() { echo -e "${WHITE}$ $1${RESET}"; }

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
CLUSTER_NAME=""

while (( "$#" )); do
  case "$1" in
    --all) MODE="both"; shift ;;
    --infra) MODE="infra"; shift ;;
    --app) MODE="app"; shift ;;
    --profile|-p)
      if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
        ENVIRONMENT="$2"
        shift 2
      else
        echo -e "${RED}Error: Argument for $1 is missing${RESET}" >&2
        exit 1
      fi
      ;;
    --name|-n)
      if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
        CLUSTER_NAME="$2"
        shift 2
      else
        echo -e "${RED}Error: Argument for $1 is missing${RESET}" >&2
        exit 1
      fi
      ;;
    *) 
      # Check if this might be a profile name without the --profile flag
      if [[ "$1" == "local" || "$1" == "azure" || "$1" == "aws" || "$1" == "dev" ]]; then
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

# Track start time
START_TIME=$(date +%s)

# Display header with uninstallation details
echo -e "\n${MAGENTA}┌─────────────────────────────────────────────────────────┐${RESET}"
echo -e "${MAGENTA}│                                                         │${RESET}"
echo -e "${MAGENTA}│  🗑️  E-Commerce Microservices Uninstallation            │${RESET}"
echo -e "${MAGENTA}│                                                         │${RESET}"
echo -e "${MAGENTA}└─────────────────────────────────────────────────────────┘${RESET}\n"

write_trash "Starting uninstallation from namespace: ${WHITE}$USER_NAMESPACE${RESET}"
write_info "Environment: ${WHITE}$ENVIRONMENT${RESET}"
if [ -n "$CLUSTER_NAME" ]; then
  write_info "Cluster name: ${WHITE}$CLUSTER_NAME${RESET}"
fi

# Mode description
if [ "$MODE" == "both" ]; then
  write_info "Mode: ${WHITE}Complete uninstallation${RESET} (infrastructure and application components)"
elif [ "$MODE" == "app" ]; then
  write_info "Mode: ${WHITE}Application uninstallation only${RESET}"
elif [ "$MODE" == "infra" ]; then
  write_info "Mode: ${WHITE}Infrastructure uninstallation only${RESET}"
fi

# Uninstall application if requested
if [ "$MODE" == "app" ] || [ "$MODE" == "both" ]; then
  write_phase "Uninstalling application components..."
  APP_PATH="$BASE_PATH/apps/overlays/$ENVIRONMENT"
  
  if [ -d "$APP_PATH" ]; then
    # Create a temp directory for namespace substitution
    TEMP_DIR=$(mktemp -d)
    write_step "Created temporary directory: ${WHITE}$TEMP_DIR${RESET}"
    
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
    find "$TEMP_DIR" -name "*.yaml" -exec sed -i "s/e-commerce/$USER_NAMESPACE/g" {} \; 2>/dev/null
    
    # Single command to uninstall all application components
    write_trash "Uninstalling all application components with a single command..."
    highlight_boxed_cmd "kubectl delete -k $TEMP_DIR/apps/overlays/$ENVIRONMENT --ignore-not-found"
    
    # Execute the delete command and capture the output
    DELETE_OUTPUT=$(kubectl delete -k "$TEMP_DIR/apps/overlays/$ENVIRONMENT" --ignore-not-found 2>&1)
    DELETE_STATUS=$?
    
    # Display the output with proper formatting
    if [ -n "$DELETE_OUTPUT" ]; then
      echo -e "${WHITE}$DELETE_OUTPUT${RESET}"
    fi
    
    if [ $DELETE_STATUS -eq 0 ]; then
      write_success "All application components uninstalled"
    else
      write_warning "Some application components may not have been uninstalled completely"
    fi
    
    # Clean up
    rm -rf "$TEMP_DIR"
    write_step "Temporary directory removed"
  else
    write_warning "Application directory not found at: ${WHITE}$APP_PATH${RESET}"
  fi
  
  write_success "Application uninstallation completed"
fi

# Uninstall infrastructure if requested
if [ "$MODE" == "infra" ] || [ "$MODE" == "both" ]; then
  write_phase "Uninstalling shared infrastructure..."
  INFRA_PATH="$BASE_PATH/shared-services/overlays/$ENVIRONMENT"
  
  if [ -d "$INFRA_PATH" ]; then
    write_step "Removing infrastructure from ${WHITE}$INFRA_PATH${RESET}"
    highlight_boxed_cmd "kubectl delete -k $INFRA_PATH --ignore-not-found"
    
    # Execute the delete command and capture the output
    DELETE_OUTPUT=$(kubectl delete -k "$INFRA_PATH" --ignore-not-found 2>&1)
    DELETE_STATUS=$?
    
    # Display the output with proper formatting
    if [ -n "$DELETE_OUTPUT" ]; then
      echo -e "${WHITE}$DELETE_OUTPUT${RESET}"
    fi
    
    if [ $DELETE_STATUS -eq 0 ]; then
      write_success "Infrastructure removed successfully"
    else
      write_error "Failed to remove infrastructure"
    fi
  else
    write_warning "Infrastructure directory not found at: ${WHITE}$INFRA_PATH${RESET}"
  fi
fi

# If app mode or both, remove the namespace
if [ "$MODE" == "app" ] || [ "$MODE" == "both" ]; then
  write_trash "Removing namespace: ${WHITE}$USER_NAMESPACE${RESET}"
  write_command "kubectl delete namespace \"$USER_NAMESPACE\" --ignore-not-found"
  
  # Execute the command and capture output
  NAMESPACE_OUTPUT=$(kubectl delete namespace "$USER_NAMESPACE" --ignore-not-found 2>&1)
  NAMESPACE_STATUS=$?
  
  # Display the output with proper formatting
  if [ -n "$NAMESPACE_OUTPUT" ]; then
    echo -e "${WHITE}$NAMESPACE_OUTPUT${RESET}"
  fi
  
  if [ $NAMESPACE_STATUS -eq 0 ]; then
    write_success "Namespace removed"
  else
    write_warning "Failed to remove namespace"
  fi
fi

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

# Summary section
echo -e "\n${MAGENTA}┌─────────────────────────────────────────────────────────┐${RESET}"
echo -e "${MAGENTA}│                                                         │${RESET}"
echo -e "${MAGENTA}│  📊 Uninstallation Summary                               │${RESET}"
echo -e "${MAGENTA}│                                                         │${RESET}"
echo -e "${MAGENTA}└─────────────────────────────────────────────────────────┘${RESET}\n"

write_success "Uninstallation completed in ${WHITE}${MINUTES}m ${SECONDS}s${RESET}"

if [ "$MODE" == "app" ]; then
  write_info "Only application components were removed"
  write_info "Shared infrastructure is preserved"
  echo -e "${BLUE}🔸 To remove shared infrastructure, run:${RESET}"
  echo -e "   ${WHITE}$0 $USER_NAMESPACE --infra --profile $ENVIRONMENT${RESET}"
elif [ "$MODE" == "infra" ]; then
  write_info "Only shared infrastructure was removed"
  write_info "Application components are preserved"
  echo -e "${BLUE}🔸 To remove application components, run:${RESET}"
  echo -e "   ${WHITE}$0 $USER_NAMESPACE --app --profile $ENVIRONMENT${RESET}"
elif [ "$MODE" == "both" ]; then
  write_success "All resources have been successfully removed"
  write_info "Environment ${WHITE}$ENVIRONMENT${RESET} for namespace ${WHITE}$USER_NAMESPACE${RESET} has been cleaned up"
fi

# Add a clear ending message so the user knows the script is completely done
echo -e "\n${GREEN}┌─────────────────────────────────────────────────────────┐${RESET}"
echo -e "${GREEN}│                                                         │${RESET}"
echo -e "${GREEN}│  ✨ UNINSTALLATION PROCESS COMPLETE                      │${RESET}"
echo -e "${GREEN}│                                                         │${RESET}"
echo -e "${GREEN}└─────────────────────────────────────────────────────────┘${RESET}"

# Explicitly exit with success status
exit 0