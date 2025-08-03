# E-Commerce Microservices Sample - KubeCon 2025 DevSpace Demo

<div align="center">
  <img src="https://github.com/cncf/artwork/blob/main/other/kubecon-cloudnativecon/2025-india/color/kccnc-india-2025-color.png?raw=true" alt="KubeCon + CloudNativeCon India 2025" width="400"/>
</div>

A comprehensive e-commerce microservices application showcasing modern cloud-native development practices with Kubernetes, DevSpace, and debugging capabilities.

## 📝 Attribution

> **Original Project**: This demo is based on the excellent work from [venkataravuri/e-commerce-microservices-sample](https://github.com/venkataravuri/e-commerce-microservices-sample)  
> **Author**: [@venkataravuri](https://github.com/venkataravuri)  
> **Description**: A fictitious cloud-native e-commerce application using microservices architecture powered by polyglot languages & databases, deployable to Kubernetes & AWS  
> **Stars**: ⭐ 298+ | **Forks**: 🍴 205+  
>
> This KubeCon 2025 demo extends the original project with DevSpace integration, debugging capabilities, and conference-specific enhancements.

## 🏗️ Architecture Overview

This application demonstrates a complete microservices architecture with the following components:

### Microservices
- **Cart Service** (Java/Spring Boot) - Shopping cart management with Redis
- **Products Service** (Node.js) - Product catalog management with MongoDB  
- **Search Service** (Node.js) - Product search functionality with Elasticsearch
- **Users Service** (Python/FastAPI) - User management with MongoDB
- **Store UI** (React) - Frontend web application

### Infrastructure
- **Redis** - Cart data storage and caching
- **MongoDB** - Product and user data persistence
- **Elasticsearch** - Search indexing and querying
- **Kibana** - Elasticsearch monitoring and visualization

![Architecture](architecture.png)

## 🚀 Demo Workflow - KubeCon + CloudNativeCon India 2025

<div align="center">
  <strong>🎯 Official KubeCon 2025 DevSpace Demo</strong><br/>
  <em>Showcasing Cloud-Native Development Best Practices</em>
</div>

<br/>

This demo showcases cloud-native development workflows using DevSpace for rapid Kubernetes development and debugging.

### Prerequisites

Ensure you have the following tools installed:

```bash
# Required tools
- Docker Desktop
- kubectl  
- kind (Kubernetes in Docker)
- DevSpace CLI
- Git
```

### Step 1: Create Kind Cluster

Create a local Kubernetes cluster using the provided kind configuration:

```bash
# Create the kubecon-2025 cluster with port mappings
kind create cluster --config kind.yaml
```

The cluster exposes services on these ports:
- **Cart Service**: http://localhost:8080  
- **Products Service**: http://localhost:8081
- **Search Service**: http://localhost:8082
- **Users Service**: http://localhost:8083
- **Store UI**: http://localhost:8084
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601

### Step 2: Initialize DevSpace

Initialize DevSpace for the microservices project:

```bash
# Initialize DevSpace in the project
devspace init
```

During initialization:
- Add dependencies for shared services
- Change image names as needed
- Add build stages for development

### Step 3: Configure DevSpace Context

Set up the DevSpace context to use the kind cluster:

```bash
# Use the kubecon-2025 kind cluster context
devspace use context kind-kubecon-2025

# Set the e-commerce namespace
devspace use namespace e-commerce
```

### Step 4: Deploy and Develop

Deploy the entire application stack:

```bash
# Deploy infrastructure and all microservices
devspace dev
```

This command will:
1. Deploy shared services (Redis, MongoDB, Elasticsearch)
2. Build and deploy all microservices
3. Start development mode with hot reloading
4. Set up port forwarding for all services

### Step 5: Debug Cart Service

The cart service includes debugging capabilities built into the DevSpace configuration:

```bash
# Run the debug pipeline specifically for cart service
devspace run-pipeline debug
```

The debug mode provides:
- **Hot Reloading**: Automatic code sync and restart
- **Port Forwarding**: Direct access to service endpoints
- **Log Streaming**: Real-time application logs
- **Interactive Debugging**: Attach debugger to running containers

## 🛠️ Development Workflow

### Project Structure

```
e-commerce-microservices-sample/
├── cart-cna-microservice/          # Java/Spring Boot cart service
├── products-cna-microservice/      # Node.js products service  
├── search-cna-microservice/        # Node.js search service
├── users-cna-microservice/         # Python/FastAPI users service
├── store-ui/                       # React frontend application
├── infra/                          # Kubernetes manifests and Terraform
│   ├── k8s/apps/                   # Application deployments
│   ├── k8s/shared-services/        # Infrastructure services
│   └── terraform/                  # Cloud infrastructure
├── devspace-common/                # Shared DevSpace configuration
└── kind.yaml                       # Local cluster configuration
```

### DevSpace Configuration

Each microservice includes:
- **devspace.yaml** - Service-specific DevSpace configuration
- **Dockerfile.dev** - Development-optimized container images
- **Debug pipelines** - Integrated debugging workflows

### Cart Service Debugging Features

The cart service showcases advanced debugging capabilities:

1. **Service Architecture**:
   ```java
   @Service
   public class CartService {
       // Redis-based cart operations
       // Tax calculation integration
       // Shipping cost calculation
   }
   ```

2. **Debug Endpoints**:
   - `GET /api/cart/{customerId}` - Retrieve cart data
   - `POST /api/cart` - Add/modify cart items
   - `DELETE /api/cart/{customerId}` - Clear cart

3. **Integration Testing**:
   ```bash
   # Run cart service tests
   cd cart-cna-microservice
   ./gradlew test
   ```

## 🔧 Troubleshooting & Tips

### Common Issues

1. **Port Conflicts**: Ensure ports 80, 8080-8084, 27017, 6379, 9200, 5601 are available
2. **Docker Resources**: Allocate sufficient CPU/memory to Docker Desktop
3. **Image Builds**: Use `devspace build` to rebuild images manually if needed

### Useful Commands

```bash
# Check cluster status
kubectl get pods -A

# View service logs
devspace logs

# Reset development environment  
devspace reset pods

# Clean up resources
devspace purge
```

## 🎯 Demo Highlights

<div align="center">
  
### ⚡ What You'll Experience in This Demo

</div>

| Feature | Description | Technology |
|---------|-------------|------------|
| 🚀 **Rapid Local Development** | Complete microservices stack running locally | Kind + DevSpace |
| 🔥 **Hot Reloading** | Real-time code changes without rebuilds | DevSpace Live Sync |
| 🐛 **Integrated Debugging** | Seamless debugging experience in Kubernetes | DevSpace Debug Mode |
| 📊 **Production-like Environment** | Full observability and monitoring stack | Elasticsearch + Kibana |
| 🌐 **Multi-language Support** | Java, Node.js, Python, and React applications | Cloud-Native Stack |

## 🤝 Contributing

This project demonstrates modern cloud-native development practices. Feel free to explore the codebase and experiment with the debugging capabilities!

### Original Project
This KubeCon 2025 demo builds upon the fantastic foundation provided by [@venkataravuri](https://github.com/venkataravuri)'s [e-commerce-microservices-sample](https://github.com/venkataravuri/e-commerce-microservices-sample). We encourage you to check out the original repository for additional features and deployment options.

---

<div align="center">

### 🌟 KubeCon + CloudNativeCon India 2025 Official Demo

**Showcasing Cloud-Native Development with DevSpace and Kubernetes**

<img src="https://img.shields.io/badge/Event-KubeCon%202025-blue?style=for-the-badge" alt="KubeCon 2025"/>
<img src="https://img.shields.io/badge/Technology-DevSpace-green?style=for-the-badge" alt="DevSpace"/>
<img src="https://img.shields.io/badge/Platform-Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes"/>

*Learn more about [KubeCon + CloudNativeCon India 2025](https://events.linuxfoundation.org/kubecon-cloudnativecon-india/)*

</div>
