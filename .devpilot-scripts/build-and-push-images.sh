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

# Parse command line arguments
ENVIRONMENT="local"
BUILD_TYPE="both"  # both, prod, dev
SPECIFIC_SERVICES=()  # Array to store specific services to build
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
    --type|-t)
      if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
        BUILD_TYPE="$2"
        shift 2
      else
        echo -e "❌ Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    --service|-s)
      if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
        IFS=',' read -ra SERVICES <<< "$2"
        for service in "${SERVICES[@]}"; do
          SPECIFIC_SERVICES+=("$service")
        done
        shift 2
      else
        echo -e "❌ Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    --dev-only)
      BUILD_TYPE="dev"
      shift
      ;;
    --prod-only)
      BUILD_TYPE="prod"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -p, --profile ENV     Target environment (local, azure, aws) [default: local]"
      echo "  -t, --type TYPE       Build type (both, prod, dev) [default: both]"
      echo "  -s, --service NAMES   Build specific service(s) (comma-separated)"
      echo "  --dev-only           Build only development images (Dockerfile.dev)"
      echo "  --prod-only          Build only production images (Dockerfile)"
      echo "  -h, --help           Show this help message"
      echo ""
      echo "Available services: cart, products, search, store-ui, users"
      echo ""
      echo "Examples:"
      echo "  $0                           # Build both prod and dev images for all services"
      echo "  $0 --dev-only                # Build only dev images for all services"
      echo "  $0 -s cart                   # Build both images for cart service only"
      echo "  $0 -s cart,products --dev-only # Build dev images for cart and products only"
      echo "  $0 -s store-ui -p azure      # Build both images for store-ui in azure"
      echo "  $0 -s cart,users -t prod     # Build only prod images for cart and users"
      exit 0
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

# Validate build type
if [[ "$BUILD_TYPE" != "both" && "$BUILD_TYPE" != "prod" && "$BUILD_TYPE" != "dev" ]]; then
  write_error "Invalid build type: $BUILD_TYPE. Must be 'both', 'prod', or 'dev'"
  exit 1
fi

write_phase "Build Configuration"
write_progress "Environment: $ENVIRONMENT"
write_progress "Build Type: $BUILD_TYPE"
if [ ${#SPECIFIC_SERVICES[@]} -gt 0 ]; then
  write_progress "Specific Services: ${SPECIFIC_SERVICES[*]}"
fi

# Set registry URL based on environment
case "$ENVIRONMENT" in
  "azure")
    registry_url=${REGISTRY_URL:-"kubecon.azurecr.io"}
    write_progress "Using Azure Container Registry: $registry_url"
    ;;
  "aws")
    registry_url=${REGISTRY_URL:-"123456789012.dkr.ecr.region.amazonaws.com"}
    write_progress "Using AWS Elastic Container Registry: $registry_url"
    ;;
  *)
    registry_url=${REGISTRY_URL:-"image.registry.local:5001"}
    write_progress "Using local registry: $registry_url"
    ;;
esac

# Get the script directory and project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default services configuration
declare -a services=(
  "cart:$PROJECT_DIR/cart-cna-microservice"
  "products:$PROJECT_DIR/products-cna-microservice"
  "search:$PROJECT_DIR/search-cna-microservice"
  "store-ui:$PROJECT_DIR/store-ui"
  "users:$PROJECT_DIR/users-cna-microservice"
)

# Function to build and push a single image
build_and_push_image() {
  local name="$1"
  local path="$2"
  local dockerfile="$3"
  local tag_suffix="$4"
  local description="$5"
  
  write_step "Building $description image for $name..."
  write_progress "Using $dockerfile in $path"
  
  # Build the image
  local image_tag="$name:$tag_suffix"
  highlight_boxed_cmd "docker build -f $dockerfile -t $image_tag ."
  
  if docker build -f "$dockerfile" -t "$image_tag" .; then
    write_success "Built $image_tag"
    
    # Tag the image for registry
    local registry_image="$registry_url/$image_tag"
    write_step "Tagging image for registry..."
    highlight_boxed_cmd "docker tag $image_tag $registry_image"
    docker tag "$image_tag" "$registry_image"
    write_success "Tagged as $registry_image"
    
    # Push to registry
    write_step "Pushing to registry..."
    highlight_boxed_cmd "docker push $registry_image"
    if docker push "$registry_image"; then
      write_success "Successfully pushed $registry_image"
      return 0
    else
      write_error "Failed to push $name $description: Docker push failed"
      return 1
    fi
  else
    write_error "Failed to build $name $description: Docker build failed"
    return 1
  fi
}

# Check if registry is running - only for local environment
if [ "$ENVIRONMENT" == "local" ]; then
  write_phase "Checking Local Registry"
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
fi

# Process each service
declare -a build_summary=()
declare -i total_builds=0
declare -i successful_builds=0

for service_info in "${services[@]}"; do
  # Parse service information
  IFS=: read -r name path <<< "$service_info"
  
  # If specific services are defined, check if the current service is in the list
  if [ ${#SPECIFIC_SERVICES[@]} -gt 0 ]; then
    if [[ ! " ${SPECIFIC_SERVICES[@]} " =~ " $name " ]]; then
      write_warning "Skipping $name service (not in specified services list)"
      build_summary+=("$name: SKIPPED (not in specified services)")
      continue
    fi
  fi
  
  write_phase "Processing $name Service"
  
  # Check if directory exists
  if [ ! -d "$path" ]; then
    write_warning "Directory $path does not exist. Skipping $name service."
    build_summary+=("$name: SKIPPED (directory not found)")
    continue
  fi
  
  # Change to service directory
  pushd "$path" 2>/dev/null
  if [ $? -ne 0 ]; then
    write_error "Failed to change directory to $path"
    build_summary+=("$name: FAILED (directory access)")
    continue
  fi
  
  # Build production image if requested
  if [[ "$BUILD_TYPE" == "both" || "$BUILD_TYPE" == "prod" ]]; then
    if [ -f "Dockerfile" ]; then
      ((total_builds++))
      if build_and_push_image "$name" "$path" "Dockerfile" "latest" "production"; then
        ((successful_builds++))
        build_summary+=("$name:latest: SUCCESS (production)")
      else
        build_summary+=("$name:latest: FAILED (production)")
      fi
    else
      write_warning "Dockerfile not found in $path. Skipping production build for $name."
      build_summary+=("$name:latest: SKIPPED (no Dockerfile)")
    fi
  fi
  
  # Build development image if requested
  if [[ "$BUILD_TYPE" == "both" || "$BUILD_TYPE" == "dev" ]]; then
    if [ -f "Dockerfile.dev" ]; then
      ((total_builds++))
      if build_and_push_image "$name" "$path" "Dockerfile.dev" "dev" "development"; then
        ((successful_builds++))
        build_summary+=("$name:dev: SUCCESS (development)")
      else
        build_summary+=("$name:dev: FAILED (development)")
      fi
    else
      write_warning "Dockerfile.dev not found in $path. Skipping development build for $name."
      build_summary+=("$name:dev: SKIPPED (no Dockerfile.dev)")
    fi
  fi
  
  # Return to original directory
  popd 2>/dev/null
done

write_phase "Build and Push Summary"
write_progress "Total builds attempted: $total_builds"
write_progress "Successful builds: $successful_builds"
write_progress "Failed builds: $((total_builds - successful_builds))"

echo -e "\nDetailed Results:"
for result in "${build_summary[@]}"; do
  if [[ "$result" == *"SUCCESS"* ]]; then
    write_success "$result"
  elif [[ "$result" == *"FAILED"* ]]; then
    write_error "$result"
  else
    write_warning "$result"
  fi
done

echo -e "\n🎯 Performance Benefits:"
case "$BUILD_TYPE" in
  "both")
    echo "✅ Production images (latest): Ready for cluster deployment"
    echo "✅ Development images (dev): Ready for devspace dev (prebaked dependencies & builds)"
    echo "⚡ Next 'devspace dev' will be 5-10x faster (no dependency downloads or builds)"
    ;;
  "dev")
    echo "✅ Development images (dev): Ready for devspace dev (prebaked dependencies & builds)"
    echo "⚡ Next 'devspace dev' will be 5-10x faster (no dependency downloads or builds)"
    ;;
  "prod")
    echo "✅ Production images (latest): Ready for cluster deployment"
    ;;
esac

echo -e "\nNext steps:"
echo "1. You can verify images in the registry using: docker images"
echo "2. To see pushed images: curl http://$registry_url/v2/_catalog"
echo "3. To deploy cluster: run your deployment scripts"
if [[ "$BUILD_TYPE" == "both" || "$BUILD_TYPE" == "dev" ]]; then
  echo "4. Run 'devspace dev' for lightning-fast development environment startup"
fi

if [ $successful_builds -eq $total_builds ] && [ $total_builds -gt 0 ]; then
  write_success "All builds completed successfully! 🎉"
  exit 0
else
  write_warning "Some builds failed. Check the summary above for details."
  exit 1
fi