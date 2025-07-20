#!/bin/bash
# DevPilot Server Management Script for Linux/macOS
# Handles all dev server lifecycle operations

DEVPILOT_CONFIG="$HOME/.config/devpilot/"

checkDevSpaceInstalled(){
    if ! command -v devspace >/dev/null 2>&1; then
        echo "❌ 'devspace' command not found. Please install DevSpace CLI first."
        echo "💡 Install from: https://devspace.sh/cli/docs/getting-started/installation"
        exit 1
    fi
}

setup_server(){
    echo "🛠️ Setting up dev server..."
    
    checkDevSpaceInstalled
    
    # TODO: Complex logic - implement manually
    # This should run devspace init and handle the interactive setup
    
    echo "⚠️  Setup-server command not yet implemented - placeholder only"
    echo "📋 This command will run 'devspace init' to generate devspace.yaml"
    echo "💡 For now, run 'devspace init' manually in your project directory"
}

run_server(){
    echo "🚀 Starting dev server..."
    
    local profile=""
    local namespace=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                profile="$2"
                shift 2
                ;;
            --namespace)
                namespace="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    checkDevSpaceInstalled
    
    local cmd="devspace run dev"
    
    if [[ -n "$profile" ]]; then
        cmd="$cmd --profile $profile"
        echo "📋 Using profile: $profile"
    fi
    
    if [[ -n "$namespace" ]]; then
        cmd="$cmd --namespace $namespace"
        echo "🎯 Target namespace: $namespace"
    fi
    
    echo "🔄 Executing: $cmd"
    
    # Execute the command and handle interruption
    trap 'echo -e "\n👋 Dev server stopped"; exit 0' SIGINT
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        echo "❌ Dev server failed to start"
        exit $exit_code
    fi
}

debug_server(){
    echo "🐛 Starting dev server in debug mode..."
    
    local profile=""
    local namespace=""
    local debug_port=""
    local verbose_output=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            "--profile")
                profile="$2"
                shift 2
                ;;
            "--namespace")
                namespace="$2"
                shift 2
                ;;
            "--debug-port")
                debug_port="$2"
                shift 2
                ;;
            "--verbose-output")
                verbose_output=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    checkDevSpaceInstalled
    
    local cmd="devspace run dev"
    
    if [[ -n "$profile" ]]; then
        cmd="$cmd --profile $profile"
        echo "📋 Using profile: $profile"
    fi
    
    if [[ -n "$namespace" ]]; then
        cmd="$cmd --namespace $namespace"
        echo "🎯 Target namespace: $namespace"
    fi
    
    if [[ -n "$debug_port" ]]; then
        cmd="$cmd --port-forwarding localhost:$debug_port:$debug_port"
        echo "🔍 Debug port forwarding: $debug_port"
    fi
    
    if [[ "$verbose_output" == "true" ]]; then
        cmd="$cmd --verbose"
        echo "📝 Verbose logging enabled"
    fi
    
    echo "🔄 Executing: $cmd"
    
    # Execute the command and handle interruption
    trap 'echo -e "\n👋 Debug server stopped"; exit 0' SIGINT
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        echo "❌ Debug server failed to start"
        exit $exit_code
    fi
}

build_server(){
    echo "🔨 Building server images..."
    
    local profile=""
    local tag=""
    local skip_push=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                profile="$2"
                shift 2
                ;;
            --tag)
                tag="$2"
                shift 2
                ;;
            --skip-push)
                skip_push=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    checkDevSpaceInstalled
    
    local cmd="devspace run build"
    
    if [[ -n "$profile" ]]; then
        cmd="$cmd --profile $profile"
        echo "📋 Using profile: $profile"
    fi
    
    if [[ -n "$tag" ]]; then
        cmd="$cmd --tag $tag"
        echo "🏷️  Using tag: $tag"
    fi
    
    if [[ "$skip_push" == "true" ]]; then
        cmd="$cmd --skip-push"
        echo "📦 Skipping image push"
    fi
    
    echo "🔄 Executing: $cmd"
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ Server images built successfully"
    else
        echo "❌ Server image build failed"
        exit $exit_code
    fi
}

deploy_server(){
    echo "🚀 Deploying server to cluster..."
    
    local profile=""
    local namespace=""
    local skip_build=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                profile="$2"
                shift 2
                ;;
            --namespace)
                namespace="$2"
                shift 2
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    checkDevSpaceInstalled
    
    local cmd="devspace run deploy"
    
    if [[ -n "$profile" ]]; then
        cmd="$cmd --profile $profile"
        echo "📋 Using profile: $profile"
    fi
    
    if [[ -n "$namespace" ]]; then
        cmd="$cmd --namespace $namespace"
        echo "🎯 Target namespace: $namespace"
    fi
    
    if [[ "$skip_build" == "true" ]]; then
        cmd="$cmd --skip-build"
        echo "📦 Skipping image build"
    fi
    
    echo "🔄 Executing: $cmd"
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ Server deployed successfully"
    else
        echo "❌ Server deployment failed"
        exit $exit_code
    fi
}

test_server(){
    echo "🧪 Testing server..."
    
    local profile=""
    local pipeline="test-server"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                profile="$2"
                shift 2
                ;;
            --pipeline)
                pipeline="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    if [[ -n "$profile" ]]; then
        echo "📋 Using profile: $profile"
    fi
    
    echo "🔬 Test pipeline: $pipeline"
    
    # TODO: Complex logic - implement manually
    # This should run custom devspace pipelines for testing
    
    echo "⚠️  Test-server command not yet implemented - placeholder only"
    echo "📋 This command will run custom devspace test pipelines"
    echo "💡 For now, run 'devspace run test-server' manually"
}

get_logs(){
    echo "📋 Getting server logs..."
    
    local service=""
    local follow=false
    local lines=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --service)
                service="$2"
                shift 2
                ;;
            --follow)
                follow=true
                shift
                ;;
            --lines)
                lines="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    checkDevSpaceInstalled
    
    local cmd="devspace logs"
    
    if [[ -n "$service" ]]; then
        cmd="$cmd --container $service"
        echo "🎯 Service: $service"
    fi
    
    if [[ "$follow" == "true" ]]; then
        cmd="$cmd --follow"
        echo "👁️  Following logs..."
    fi
    
    if [[ -n "$lines" ]]; then
        cmd="$cmd --lines $lines"
        echo "📏 Showing $lines lines"
    fi
    
    # Execute the command and handle interruption
    trap 'echo -e "\n👋 Stopped following logs"; exit 0' SIGINT
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        echo "❌ Failed to get logs"
        exit $exit_code
    fi
}

open_shell(){
    echo "🐚 Opening shell in server container..."
    
    local service=""
    local container=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --service)
                service="$2"
                shift 2
                ;;
            --container)
                container="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    checkDevSpaceInstalled
    
    local cmd="devspace enter"
    
    if [[ -n "$service" ]]; then
        cmd="$cmd --container $service"
        echo "🎯 Service: $service"
    fi
    
    if [[ -n "$container" ]]; then
        cmd="$cmd --container $container"
        echo "📦 Container: $container"
    fi
    
    # Execute the command and handle interruption
    trap 'echo -e "\n👋 Exited shell"; exit 0' SIGINT
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        echo "❌ Failed to open shell"
        exit $exit_code
    fi
}

get_status(){
    echo "📊 Checking server status..."
    
    checkDevSpaceInstalled
    
    local cmd="devspace list deployments"
    eval $cmd
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ Server status retrieved"
    else
        echo "❌ Failed to get server status"
        exit $exit_code
    fi
}

# Main execution logic
main(){
    local action=$1
    shift  # Remove action from arguments
    
    case $action in
        "--setup-server")
            setup_server "$@"
            ;;
        "--run-server")
            run_server "$@"
            ;;
        "--debug-server")
            debug_server "$@"
            ;;
        "--build-server")
            build_server "$@"
            ;;
        "--deploy-server")
            deploy_server "$@"
            ;;
        "--test-server")
            test_server "$@"
            ;;
        "--logs")
            get_logs "$@"
            ;;
        "--shell")
            open_shell "$@"
            ;;
        "--status")
            get_status "$@"
            ;;
        *)
            echo "Invalid option: $action"
            echo "Available options: --setup-server, --run-server, --debug-server, --build-server, --deploy-server, --test-server, --logs, --shell, --status"
            exit 1
            ;;
    esac
}

main "$@"