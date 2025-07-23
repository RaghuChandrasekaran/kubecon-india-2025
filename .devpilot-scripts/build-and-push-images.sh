#!/bin/bash
# Helper Functions
function write_phase() {
  echo -e "\n🚀 $1"
}

function write_step() {
  echo -e "\n📋 $1"
}

function write_progress() {
  echo -e "   $1"
}

function write_success() {
  echo -e "✅ $1"
}

function write_warning() {
  echo -e "⚠️ $1"
}

function write_error() {
  echo -e "❌ $1"
}

# Parse command line arguments
ENVIRONMENT="local"
PARAMS=()

while (( "$#" )); do
  case "$1" in
    --profile|-p)
      if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
        ENVIRONMENT="$2"
        shift 2
      else
        echo -e "❌ Error: Argument for $1 is missing" >&2
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

# Set registry URL based on environment
case "$ENVIRONMENT" in
  "azure")
    # Use Azure Container Registry (replace with your ACR name)
    registry_url=${REGISTRY_URL:-"kubecondemo.azurecr.io"}
    write_progress "Using Azure Container Registry: $registry_url"
    ;;
  "aws")
    # Use AWS ECR (replace with your ECR URI)
    registry_url=${REGISTRY_URL:-"123456789012.dkr.ecr.region.amazonaws.com"}
    write_progress "Using AWS Elastic Container Registry: $registry_url"
    ;;
  *)
    # Default to local registry
    registry_url=${REGISTRY_URL:-"image.registry.local:5001"}
    write_progress "Using local registry: $registry_url"
    ;;
esac

# Get the script directory and project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load service locations from devpilot.json
DEVPILOT_CONFIG="$PROJECT_DIR/.devpilot.json"
if [ ! -f "$DEVPILOT_CONFIG" ]; then
  write_error "DevPilot configuration file not found at $DEVPILOT_CONFIG"
  write_error "Please run 'devpilot init' first to configure your project"
  exit 1
fi

write_phase "Loading service configuration from DevPilot config"
# Use jq if available, otherwise use grep and sed as fallback
if command -v jq &> /dev/null; then
  write_progress "Using jq to parse configuration"
  # Try to extract services from the devpilot.json using jq
  SERVICES_JSON=$(jq -c '.services[]' "$DEVPILOT_CONFIG" 2>/dev/null)
  
  if [ -z "$SERVICES_JSON" ]; then
    write_warning "No services found in DevPilot config or jq command failed"
    write_warning "Falling back to default service detection"
    # Default fallback
    declare -a services=(
      "cart:$PROJECT_DIR/cart-cna-microservice:latest"
      "products:$PROJECT_DIR/products-cna-microservice:latest"
      "search:$PROJECT_DIR/search-cna-microservice:latest"
      "store-ui:$PROJECT_DIR/store-ui:latest"
      "users:$PROJECT_DIR/users-cna-microservice:latest"
    )
  else
    # Parse JSON into services array
    declare -a services=()
    while IFS= read -r service_obj; do
      service_name=$(echo "$service_obj" | jq -r '.name')
      service_location=$(echo "$service_obj" | jq -r '.location')
      # Make relative paths absolute
      if [[ "$service_location" != /* ]]; then
        service_location="$PROJECT_DIR/$service_location"
      fi
      services+=("$service_name:$service_location:latest")
      write_progress "Detected service: $service_name at $service_location"
    done <<< "$SERVICES_JSON"
  fi
else
  write_warning "jq not found, using fallback method to parse configuration"
  # Fallback method using grep and sed if jq is not available
  services_section=$(grep -A 100 '"services":' "$DEVPILOT_CONFIG" | grep -B 100 -m 1 '^\s*\]' || grep -A 100 '"services":' "$DEVPILOT_CONFIG")
  
  declare -a services=()
  while IFS= read -r line; do
    if [[ "$line" =~ \"name\":\ *\"([^\"]+)\" ]]; then
      service_name="${BASH_REMATCH[1]}"
      # Try to get the location from the next few lines
      location_line=$(grep -A 5 "\"name\": \"$service_name\"" "$DEVPILOT_CONFIG" | grep "\"location\"")
      if [[ "$location_line" =~ \"location\":\ *\"([^\"]+)\" ]]; then
        service_location="${BASH_REMATCH[1]}"
        # Make relative paths absolute
        if [[ "$service_location" != /* ]]; then
          service_location="$PROJECT_DIR/$service_location"
        fi
        services+=("$service_name:$service_location:latest")
        write_progress "Detected service: $service_name at $service_location"
      fi
    fi
  done <<< "$services_section"
  
  # If no services detected, use default fallback
  if [ ${#services[@]} -eq 0 ]; then
    write_warning "No services detected in DevPilot config, using default service detection"
    declare -a services=(
      "cart:$PROJECT_DIR/cart-cna-microservice:latest"
      "products:$PROJECT_DIR/products-cna-microservice:latest"
      "search:$PROJECT_DIR/search-cna-microservice:latest"
      "store-ui:$PROJECT_DIR/store-ui:latest"
      "users:$PROJECT_DIR/users-cna-microservice:latest"
    )
  fi
fi

# Check if registry is running - only for local environment
if [ "$ENVIRONMENT" == "local" ]; then
  write_phase "Checking Local Registry"
  # Check for either the old kind-registry or the new dev-harbor container
  registry_container=$(docker ps --filter "name=kind-registry" --format "{{.Names}}")
  harbor_container=$(docker ps --filter "name=dev-harbor" --format "{{.Names}}")

  if [[ -z "$registry_container" && -z "$harbor_container" ]]; then
    write_warning "Local registry is not running! Please run setup-kind.sh first."
    exit 1
  fi

  if [[ -n "$harbor_container" ]]; then
    write_success "Harbor registry is running at $registry_url"
  else
    write_success "Local registry is running at $registry_url"
  fi
else
  write_phase "Using Cloud Registry: $registry_url"
  
  # For Azure, check if logged in to ACR
  if [ "$ENVIRONMENT" == "azure" ]; then
    write_step "Checking Azure Container Registry access..."
    if ! az acr login --name $(echo "$registry_url" | cut -d '.' -f1) 2>/dev/null; then
      write_warning "Not logged in to Azure Container Registry. Attempting to login..."
      if ! az acr login --name $(echo "$registry_url" | cut -d '.' -f1); then
        write_error "Failed to login to Azure Container Registry. Please run 'az login' and 'az acr login --name YOUR_ACR_NAME' first."
        exit 1
      fi
    fi
    write_success "Successfully authenticated with Azure Container Registry"
  fi
  
  # For AWS, check if logged in to ECR
  if [ "$ENVIRONMENT" == "aws" ]; then
    write_step "Checking AWS ECR access..."
    aws_region=$(echo "$registry_url" | cut -d '.' -f4)
    if ! aws ecr get-login-password --region "$aws_region" | docker login --username AWS --password-stdin "$registry_url" 2>/dev/null; then
      write_warning "Not logged in to AWS ECR. Attempting to login..."
      if ! aws ecr get-login-password --region "$aws_region" | docker login --username AWS --password-stdin "$registry_url"; then
        write_error "Failed to login to AWS ECR. Please configure AWS credentials with 'aws configure' first."
        exit 1
      fi
    fi
    write_success "Successfully authenticated with AWS ECR"
  fi
fi

# Process each service
for service_info in "${services[@]}"; do
  # Parse service information
  IFS=: read -r name path tag <<< "$service_info"
  
  write_phase "Processing $name Service"
  
  # Check if directory exists
  if [ ! -d "$path" ]; then
    write_warning "Directory $path does not exist. Skipping $name service."
    continue
  fi
  
  # Check if Dockerfile exists
  if [ ! -f "$path/Dockerfile" ]; then
    write_warning "Dockerfile not found in $path. Skipping $name service."
    continue
  fi
  
  # Build the image
  write_step "Building image for $name..."
  write_progress "Running docker build in $path"
  
  pushd "$path" 2>/dev/null
  if [ $? -ne 0 ]; then
    write_error "Failed to change directory to $path"
    continue
  fi
  
  if docker build -t "$name:$tag" .; then
    write_success "Built $name:$tag"
    
    # Tag the image for local registry
    write_step "Tagging image for local registry..."
    registry_image="$registry_url/$name:$tag"
    docker tag "$name:$tag" "$registry_image"
    write_success "Tagged as $registry_image"
    
    # Push to local registry
    write_step "Pushing to local registry..."
    if docker push "$registry_image"; then
      write_success "Successfully pushed $registry_image"
    else
      write_warning "Failed to push $name: Docker push failed"
    fi
  else
    write_warning "Failed to build $name: Docker build failed"
  fi
  
  # Return to original directory
  popd 2>/dev/null
done

write_phase "Build and Push Summary"
write_success "All services have been processed"
echo -e "\nNext steps:"

# Display environment-specific next steps
case "$ENVIRONMENT" in
  "azure")
    echo "1. You can verify images in the registry using: az acr repository list --name $(echo "$registry_url" | cut -d '.' -f1)"
    echo "2. You can see image tags using: az acr repository show-tags --name $(echo "$registry_url" | cut -d '.' -f1) --repository <image-name>"
    echo "3. To deploy to AKS, update your Kubernetes manifests to use the Azure Container Registry images"
    ;;
  "aws")
    echo "1. You can verify images in the registry using: aws ecr describe-repositories"
    echo "2. You can see image tags using: aws ecr describe-images --repository-name <image-name>"
    echo "3. To deploy to EKS, update your Kubernetes manifests to use the ECR images"
    ;;
  *)
    echo "1. You can verify images in the registry using: docker images"
    echo "2. To see pushed images: curl http://$registry_url/v2/_catalog"
    ;;
esac