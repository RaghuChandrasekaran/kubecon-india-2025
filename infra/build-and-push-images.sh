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

# Configuration - Can be overridden by environment variables
registry_url=${REGISTRY_URL:-"image.registry.local:5001"}

# Define services to build and push
declare -a services=(
  "cart:../cart-cna-microservice:latest"
  "products:../products-cna-microservice:latest"
  "search:../search-cna-microservice:latest"
  "store-ui:../store-ui:latest"
  "users:../users-cna-microservice:latest"
)

# Check if registry is running
write_phase "Checking Local Registry"
registry_container=$(docker ps --filter "name=kind-registry" --format "{{.Names}}")
if [[ -z "$registry_container" ]]; then
  write_warning "Local registry is not running! Please run setup-kind.sh first."
  exit 1
fi
write_success "Local registry is running at $registry_url"

# Process each service
for service_info in "${services[@]}"; do
  # Parse service information
  IFS=: read -r name path tag <<< "$service_info"
  
  write_phase "Processing $name Service"
  
  # Build the image
  write_step "Building image for $name..."
  write_progress "Running docker build in $path"
  
  pushd "$path" > /dev/null
  
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
  
  popd > /dev/null
done

write_phase "Build and Push Summary"
write_success "All services have been processed"
echo -e "\nNext steps:"
echo "1. You can verify images in the registry using: docker images"
echo "2. To see pushed images: curl http://$registry_url/v2/_catalog"