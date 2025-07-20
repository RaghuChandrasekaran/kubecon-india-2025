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

# Configuration - Can be overridden by environment variables
registry_url=${REGISTRY_URL:-"image.registry.local:5001"}

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

# Check if registry is running
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
echo "1. You can verify images in the registry using: docker images"
echo "2. To see pushed images: curl http://$registry_url/v2/_catalog"