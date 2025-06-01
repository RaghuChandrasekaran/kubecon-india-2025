# Infrastructure & Deployment

This project supports both local development using KinD (Kubernetes in Docker) and cloud deployment using Terraform. This guide focuses on local development setup.

## Prerequisites

- Docker Desktop
- kubectl
- KinD (Kubernetes in Docker)
- PowerShell (for Windows)

## Local Development Setup

1. **Setup Local Registry and KinD Cluster**

```powershell
# Run setup-kind.ps1 to create:
# - Local registry at image.registry.local:5001
# - KinD cluster with registry access
./setup-kind.ps1
```

2. **Build and Push Images**

```powershell
# Build all microservices and push to local registry
./build-and-push-images.ps1
```

3. **Deploy Services**

The application uses Kustomize for Kubernetes deployments with environment-specific overlays:

```powershell
# Deploy shared services (Redis, MongoDB, Elasticsearch)
kubectl apply -k k8s/shared-services/overlays/local

# Deploy application services
kubectl apply -k k8s/apps/overlays/local
```

## Configuration

### Registry Configuration

The default container registry is `image.registry.local:5001`. You can customize this by:

1. Updating `REGISTRY_URL` in `build-and-push-images.ps1`
2. Updating image references in Kustomize overlays

### Directory Structure

```
infra/
├── k8s/                    # Kubernetes manifests
│   ├── apps/              # Application services
│   │   ├── base/          # Base configurations
│   │   └── overlays/      # Environment-specific overlays
│   └── shared-services/   # Infrastructure services (Redis, MongoDB, etc.)
│       ├── base/
│       └── overlays/
├── setup-kind.ps1         # KinD cluster setup script
├── build-and-push-images.ps1  # Image build script
└── kind-cluster-config.yaml   # KinD cluster configuration
```

## Monitoring Setup Progress

You can monitor the deployment progress using:

```powershell
# Watch pods coming up
kubectl get pods -A -w

# Check service endpoints
kubectl get svc -A
```

## Cleanup

To clean up your local environment:

```powershell
# Delete KinD cluster
kind delete cluster --name e-commerce-cluster

# Remove local registry
docker rm -f kind-registry
```

        

   