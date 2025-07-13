#!/bin/bash

# This script deploys the e-commerce application to a user-specific namespace

# Use current username as default namespace if not provided, but sanitize it for Kubernetes
DEFAULT_NAMESPACE=$(echo "$USER" | tr '.' '-')
USER_NAMESPACE=${1:-$DEFAULT_NAMESPACE}
ENVIRONMENT=${2:-"azure"}  # Default to azure if not specified
BASEDIR=$(dirname "$0")

echo "Deploying to namespace: $USER_NAMESPACE"
echo "Environment: $ENVIRONMENT"

if [ "$ENVIRONMENT" != "azure" ] && [ "$ENVIRONMENT" != "local" ]; then
  echo "Environment must be either 'azure' or 'local'"
  exit 1
fi

# Create a temporary directory for the customized yaml
TEMP_DIR=$(mktemp -d)
echo "Creating temporary files in $TEMP_DIR"

# Copy the kustomization files to the temp directory (both base and overlays)
mkdir -p $TEMP_DIR/base $TEMP_DIR/overlays
cp -r $BASEDIR/apps/base/* $TEMP_DIR/base/
cp -r $BASEDIR/apps/overlays/$ENVIRONMENT $TEMP_DIR/overlays/

# Replace the namespace placeholder in all kustomization.yaml files (both base and overlays)
find $TEMP_DIR -name "kustomization.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \;

# Replace the namespace placeholder in all VirtualService files
find $TEMP_DIR -name "*-vs.yaml" -exec sed -i "s/NAMESPACE_PLACEHOLDER/$USER_NAMESPACE/g" {} \;

# Create the namespace if it doesn't exist
kubectl create namespace $USER_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply the customized kustomization
kubectl apply -k $TEMP_DIR/overlays/$ENVIRONMENT

# If it's Azure environment, handle the Istio Gateway
if [ "$ENVIRONMENT" == "azure" ]; then
  # Check if the Istio Gateway exists in the aks-istio-ingress namespace
  GATEWAY_EXISTS=$(kubectl get gateway -n aks-istio-ingress store-ui-gateway -o name --ignore-not-found)

  if [ -z "$GATEWAY_EXISTS" ]; then
    echo "Creating Istio Gateway in aks-istio-ingress namespace"
    # Apply the Gateway configuration separately since it's in a different namespace
    cp $BASEDIR/apps/overlays/azure/store-ui/store-ui-gateway.yaml $TEMP_DIR/
    kubectl apply -f $TEMP_DIR/store-ui-gateway.yaml
  else
    echo "Istio Gateway already exists in aks-istio-ingress namespace"
  fi
fi

# Clean up
rm -rf $TEMP_DIR

echo "Application deployed to namespace: $USER_NAMESPACE"
if [ "$ENVIRONMENT" == "azure" ]; then
  echo "Access your application through the Istio Gateway"
else
  echo "Access your application through NodePort services"
fi