#!/bin/bash

# This script uninstalls the e-commerce application from a user-specific namespace

# Use current username as default namespace if not provided, but sanitize it for Kubernetes
DEFAULT_NAMESPACE=$(echo "$USER" | tr '.' '-')
USER_NAMESPACE=${1:-$DEFAULT_NAMESPACE}
ENVIRONMENT=${2:-"local"}  # Default to local if not specified
REMOVE_SHARED=${3:-"false"}  # Whether to remove shared services too, default is false
BASEDIR=$(dirname "$0")

# Define emojis for better UX
ROCKET="🚀"
CHECK="✅"
WARN="⚠️"
INFO="ℹ️"
ERROR="❌"
TIMER="⏱️"
DATABASE="🗄️"
CLOUD="☁️"
SERVER="🖥️"
CLEANUP="🧹"
TRASH="🗑️"

echo "$TRASH Starting uninstallation from namespace: $USER_NAMESPACE"
echo "$INFO Environment: $ENVIRONMENT"

# Track start time for performance monitoring
START_TIME=$(date +%s)

if [ "$ENVIRONMENT" != "azure" ] && [ "$ENVIRONMENT" != "local" ]; then
  echo "$ERROR Environment must be either 'azure' or 'local'"
  exit 1
fi

# Check for Istio CRDs if using azure environment
if [ "$ENVIRONMENT" == "azure" ]; then
  echo "$INFO Checking for Istio CRDs..."
  if ! kubectl get crd gateways.networking.istio.io &> /dev/null; then
    echo "$WARN Istio CRDs not found. Skipping Istio resource deletion."
    SKIP_ISTIO=true
  else
    echo "$CHECK Istio CRDs found"
    SKIP_ISTIO=false
  fi
fi

# Determine application services list in reverse order for proper removal
SERVICES=("store-ui" "search" "users" "cart" "products")

# Create a temporary directory for the customized yaml
TEMP_DIR=$(mktemp -d)
echo "$INFO Creating temporary files in $TEMP_DIR"

# Copy the kustomization files to the temp directory (both base and overlays)
mkdir -p $TEMP_DIR/base $TEMP_DIR/overlays
cp -r $BASEDIR/apps/base/* $TEMP_DIR/base/
cp -r $BASEDIR/apps/overlays/$ENVIRONMENT $TEMP_DIR/overlays/

# Replace the namespace placeholder in all kustomization.yaml files (both base and overlays)
find $TEMP_DIR -name "kustomization.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \;

# Replace the namespace placeholder in all VirtualService files
find $TEMP_DIR -name "*-vs.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \;

# Replace the namespace placeholder in any other yaml files
find $TEMP_DIR -name "*.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \;

# If Istio CRDs are missing, remove VirtualService and Gateway yamls to avoid errors
if [ "$SKIP_ISTIO" = true ]; then
  echo "$INFO Removing Istio resources from manifests to avoid errors..."
  find $TEMP_DIR -name "*-vs.yaml" -delete
  find $TEMP_DIR -name "*-gateway.yaml" -delete
fi

# Progress tracking
TOTAL=${#SERVICES[@]}
CURRENT=0

# Remove each service separately for better visibility (in reverse order)
for SERVICE in "${SERVICES[@]}"; do
  CURRENT=$((CURRENT+1))
  PROGRESS=$((CURRENT*100/TOTAL))
  echo "$TRASH Uninstalling $SERVICE service... ($CURRENT/$TOTAL - $PROGRESS%)"
  
  if [ -d "$TEMP_DIR/overlays/$ENVIRONMENT/$SERVICE" ]; then
    # For extra safety, explicitly delete deployments and services first
    kubectl delete deployment -n $USER_NAMESPACE -l app=${SERVICE}-deployment --ignore-not-found
    kubectl delete service -n $USER_NAMESPACE ${SERVICE}-service --ignore-not-found
    
    # Then try the kustomize approach for anything else
    kubectl delete -k $TEMP_DIR/overlays/$ENVIRONMENT/$SERVICE --ignore-not-found
    
    echo "$CHECK $SERVICE uninstalled"
  else
    echo "$WARN $SERVICE directory not found in $ENVIRONMENT overlay"
  fi
done

# If it's Azure environment, handle the Istio Gateway if needed
if [ "$ENVIRONMENT" == "azure" ] && [ "$SKIP_ISTIO" = false ]; then
  # We generally don't delete the shared Istio Gateway unless explicitly requested
  if [ "$REMOVE_SHARED" == "true" ]; then
    echo "$INFO Removing Istio Gateway from aks-istio-ingress namespace"
    GATEWAY_FILE="$BASEDIR/apps/overlays/azure/store-ui/store-ui-gateway.yaml"
    if [ -f "$GATEWAY_FILE" ]; then
      kubectl delete -f "$GATEWAY_FILE" --ignore-not-found
      echo "$CHECK Gateway removed"
    fi
  fi
fi

# Remove shared services if explicitly requested
if [ "$REMOVE_SHARED" == "true" ]; then
  echo "$DATABASE Removing shared services..."
  kubectl delete -k $BASEDIR/shared-services/overlays/$ENVIRONMENT --ignore-not-found
  echo "$CHECK Shared services removed"
fi

# Remove the namespace itself
echo "$TRASH Removing namespace: $USER_NAMESPACE"
kubectl delete namespace $USER_NAMESPACE --ignore-not-found
echo "$CHECK Namespace removed"

# Clean up
rm -rf $TEMP_DIR
echo "$CLEANUP Temporary files cleaned up"

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

echo "$ROCKET Application successfully uninstalled from namespace: $USER_NAMESPACE"
echo "$TIMER Uninstallation completed in ${MINUTES}m ${SECONDS}s"

if [ "$REMOVE_SHARED" == "true" ]; then
  echo "$DATABASE Shared services have also been removed"
else
  echo "$INFO Shared services were preserved"
  echo "$INFO To remove shared services, run with: $0 $USER_NAMESPACE $ENVIRONMENT true"
fi