#!/bin/bash

# This script installs the e-commerce application to a user-specific namespace

# Use current username as default namespace if not provided, but sanitize it for Kubernetes
DEFAULT_NAMESPACE=$(echo "$USER" | tr '.' '-')
USER_NAMESPACE=${1:-$DEFAULT_NAMESPACE}
ENVIRONMENT=${2:-"local"}  # Default to local if not specified
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

echo "$ROCKET Starting installation to namespace: $USER_NAMESPACE"
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
    echo "$WARN Istio CRDs not found. Some Istio features may not work properly."
    echo "$INFO You may need to install Istio: https://istio.io/latest/docs/setup/getting-started/"
  else
    echo "$CHECK Istio CRDs found"
  fi
fi

# Determine application services list
SERVICES=("store-ui" "products" "cart" "users" "search")

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

# Create the namespace if it doesn't exist
echo "$INFO Creating namespace: $USER_NAMESPACE"
kubectl create namespace $USER_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
echo "$CHECK Namespace ready"

# Create shared services first
echo "$DATABASE Setting up shared services..."
kubectl apply -k $BASEDIR/shared-services/overlays/$ENVIRONMENT --wait

# Wait for shared services to be ready
echo "$TIMER Waiting for shared services to become ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n shared-services --timeout=120s && echo "$CHECK MongoDB ready" || echo "$WARN MongoDB may not be ready yet"
kubectl wait --for=condition=ready pod -l app=redis -n shared-services --timeout=120s && echo "$CHECK Redis ready" || echo "$WARN Redis may not be ready yet"
kubectl wait --for=condition=ready pod -l app=elasticsearch -n shared-services --timeout=120s && echo "$CHECK Elasticsearch ready" || echo "$WARN Elasticsearch may not be ready yet"

# Progress tracking
TOTAL=${#SERVICES[@]}
CURRENT=0

# Apply each service separately for better visibility
for SERVICE in "${SERVICES[@]}"; do
  CURRENT=$((CURRENT+1))
  PROGRESS=$((CURRENT*100/TOTAL))
  echo "$SERVER Installing $SERVICE service... ($CURRENT/$TOTAL - $PROGRESS%)"
  if [ -d "$TEMP_DIR/overlays/$ENVIRONMENT/$SERVICE" ]; then
    # Use --server-side to avoid client-side validation issues
    kubectl apply -k $TEMP_DIR/overlays/$ENVIRONMENT/$SERVICE --server-side || echo "$WARN Some resources for $SERVICE might not have been applied successfully"
    echo "$CHECK $SERVICE installed"
  else
    echo "$WARN $SERVICE directory not found in $ENVIRONMENT overlay"
  fi
done

# If it's Azure environment, handle the Istio Gateway
if [ "$ENVIRONMENT" == "azure" ]; then
  # Check if the Istio Gateway exists in the aks-istio-ingress namespace
  GATEWAY_EXISTS=$(kubectl get gateway -n aks-istio-ingress store-ui-gateway -o name --ignore-not-found)

  if [ -z "$GATEWAY_EXISTS" ]; then
    echo "$INFO Creating Istio Gateway in aks-istio-ingress namespace"
    # Apply the Gateway configuration separately since it's in a different namespace
    cp $BASEDIR/apps/overlays/azure/store-ui/store-ui-gateway.yaml $TEMP_DIR/
    # Use --server-side to avoid client-side validation issues
    kubectl apply -f $TEMP_DIR/store-ui-gateway.yaml --server-side || echo "$WARN Gateway might not have been applied successfully"
    echo "$CHECK Gateway installed"
  else
    echo "$INFO Istio Gateway already exists in aks-istio-ingress namespace"
  fi
fi

# Clean up
rm -rf $TEMP_DIR
echo "$CLEANUP Temporary files cleaned up"

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

echo "$ROCKET Application successfully installed to namespace: $USER_NAMESPACE"
echo "$TIMER Installation completed in ${MINUTES}m ${SECONDS}s"

if [ "$ENVIRONMENT" == "azure" ]; then
  echo "$CLOUD Access your application through the Istio Gateway"
  
  # Get Istio ingress IP for convenience
  INGRESS_IP=$(kubectl get svc -n aks-istio-ingress aks-istio-ingressgateway-external -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  if [ ! -z "$INGRESS_IP" ]; then
    echo "$INFO Istio Gateway IP: $INGRESS_IP"
    echo "$INFO You can access the application at: http://$INGRESS_IP/"
  fi
else
  echo "$SERVER Access your application through NodePort services"
  
  # Get NodePort for store-ui for convenience
  NODE_PORT=$(kubectl get svc -n $USER_NAMESPACE store-ui-service -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
  if [ ! -z "$NODE_PORT" ]; then
    echo "$INFO Store UI NodePort: $NODE_PORT"
    echo "$INFO You can access the application at: http://localhost:$NODE_PORT/"
  fi
fi