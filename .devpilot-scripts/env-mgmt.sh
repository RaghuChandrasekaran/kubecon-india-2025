#!/bin/bash

# Set up the configuration directory within the project's .devpilot-scripts folder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVPILOT_CONFIG="${SCRIPT_DIR}/.devpilot-config"
LOG_FILE="${SCRIPT_DIR}/.devpilot-logs/env-mgmt.log"

# Create necessary directories
mkdir -p "${DEVPILOT_CONFIG}"
mkdir -p "${SCRIPT_DIR}/.devpilot-logs"
mkdir -p "${SCRIPT_DIR}/.devpilot-backups"

# Log function for consistent logging
log() {
    local message="$1"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo -e "${timestamp} - ${message}" >> "${LOG_FILE}"
}

checkCommandCompatibility(){
    COMMAND=$1
    CURR_CONTEXT=$(kubectl config current-context)
    if [[ $CURR_CONTEXT == kind-* ]]; then
        log "Cluster mode is local"
    elif [[ $CURR_CONTEXT == k8s-* ]]; then        
        echo -e "\n🚀 Current Active cluster is: $CURR_CONTEXT"
        echo -e "\n🌐 This cluster is remote."
        echo -e "\n '$COMMAND' is only applicable for local kind k8s clusters."
        echo -e "\n💡 Local kind k8s cluster names starts with kind-* \n"
        log "Command '$COMMAND' not compatible with remote cluster $CURR_CONTEXT"
        exit 0
    else
        log "Unable to determine cluster type for context: $CURR_CONTEXT"
    fi
}

cluster_exists(){
    CURR_CLUSTER_NAME=$1
   
    DOCKER_CLUSTER=$(docker ps | awk 'NR==2 {print $NF}')
    DOCKER_CLUSTER="${DOCKER_CLUSTER/-control-plane/}"
    if [ "$DOCKER_CLUSTER" == "$CURR_CLUSTER_NAME" ]; then
      echo -e "\n🚀 $CURR_CLUSTER_NAME cluster is already up and running!!\n"
      log "Cluster $CURR_CLUSTER_NAME is already running"
      exit 1
    fi
}

cluster_limit_check() {
    PREV_CONTEXT=$1
    PREV_CLUSTER_NAME=$2
    
    existing_cnt=$(docker ps | grep "control-plane" | wc -l)
    if [ "$existing_cnt" -eq 1 ]; then
      devspace use context $PREV_CONTEXT >> "${LOG_FILE}" #revert
      echo -e "\n❌ Unable to start the cluster"
      echo -e "\nReason:\n"
      echo -e "👉 Only one kind cluster can be active at a time for optimal system performance"
      echo -e "👉 To use a new cluster, kindly stop the existing one and start the new one!!"
      echo -e "\n🛑 Usage: 'devpilot switch-env' to switch to the new cluster."
      
      echo -e "\n🚀 Current Active cluster Name is: $PREV_CLUSTER_NAME \n"
      log "Cluster limit reached. Current active cluster: $PREV_CLUSTER_NAME"
      exit 1
    fi
}

start_cluster(){

    PREV_CONTEXT=$(kubectl config current-context)
    PREV_CLUSTER_NAME="${PREV_CONTEXT/kind-/}"
    
    echo -e "\n\n🌐 Enter the cluster that you want to start?"
    devspace use context
    checkCommandCompatibility "devspace start-cluster"
    CURR_CONTEXT=$(kubectl config current-context)
    CLUSTER_NAME="${CURR_CONTEXT/kind-/}"
    CONTAINER_NAME="${CLUSTER_NAME}-control-plane"

    cluster_exists $CLUSTER_NAME
    cluster_limit_check $PREV_CONTEXT $PREV_CLUSTER_NAME
    
    echo -e "\n🟢 Starting the cluster: $CLUSTER_NAME with container name: $CONTAINER_NAME"
    docker start $CONTAINER_NAME
    echo -e "\n✅ Cluster started successfully!"
}

stop_cluster(){

    checkCommandCompatibility "devspace stop-cluster"
    CURR_CONTEXT=$(kubectl config current-context)
    CLUSTER_NAME="${CURR_CONTEXT/kind-/}"
    echo -e "\n🚀 Current Active cluster Name is: $CLUSTER_NAME\n"
    CONTAINER_NAME="${CLUSTER_NAME}-control-plane"

    read -p "🤔 Are you sure you want to stop the cluster $CLUSTER_NAME? (Yes/No): " stop
    if [[ "$stop" =~ ^[Yy]es$ ]]; then
      echo -e "\n🔴 Stopping the cluster: $CLUSTER_NAME with container name: $CONTAINER_NAME"
      docker stop $CONTAINER_NAME
      echo -e "\n🛑 Cluster is stopped."
    else
      echo -e "\n🔵 Operation cancelled by user, not stopping the cluster $CLUSTER_NAME."
      exit 1
    fi
}

switch_cluster(){

    # Current cluster details
    PREV_CONTEXT=$(kubectl config current-context)
    PREV_CLUSTER_NAME="${PREV_CONTEXT/kind-/}"
    echo -e "\n🚀 Current Active cluster Name is: $PREV_CLUSTER_NAME"

    # Prompt to select the new cluster
    echo -e "\n🔄 Select the cluster to switch to:"
    devspace use context
    checkCommandCompatibility "devspace switch-cluster"
    CURR_CONTEXT=$(kubectl config current-context)
    CURR_CLUSTER_NAME="${CURR_CONTEXT/kind-/}"

    # Check if the selected cluster is already active
    if [ "$PREV_CLUSTER_NAME" == "$CURR_CLUSTER_NAME" ]; then
      echo -e "\n\nℹ️ The Cluster selected is already active, hence not switching!!"
      exit 1
    fi

    # Confirm switch action
    echo -e "\n ⚠️ Warning: Switching will stop the current cluster [[ $PREV_CLUSTER_NAME ]] and will spin up the selected cluster [[ $CURR_CLUSTER_NAME ]]!!\n"
    read -p "🤔 Are you sure you want to switch the cluster? (Yes/No): " switch
    
    if [[ "$switch" =~ ^[Yy]es$ ]]; then
      echo -e "\n🔴 Stopping the cluster: $PREV_CLUSTER_NAME"
      docker stop $PREV_CLUSTER_NAME-control-plane

      echo -e "\n🟢 Starting the cluster: $CURR_CLUSTER_NAME"
      docker start $CURR_CLUSTER_NAME-control-plane
      devspace use context $CURR_CONTEXT >> ~/.devpilot/tmp.log

      echo -e "\n✅ Successfully switched to the cluster $CURR_CLUSTER_NAME."
    else
      # Reverting to previous context if the operation is cancelled
      devspace use context $PREV_CONTEXT >> ~/.devpilot/tmp.log
      echo -e "\n 🔵 Operation cancelled by user, staying in the same cluster $PREV_CLUSTER_NAME."
    fi
}

delete_cluster(){
    
    echo -e "\n🔴 Select the cluster to delete:"
    
    devspace use context
    CURR_CONTEXT=$(kubectl config current-context)
    checkCommandCompatibility "devspace delete-cluster"
    CLUSTER_NAME="${CURR_CONTEXT/kind-/}"
    echo -e "\n🚀 Selected cluster Name is: $CLUSTER_NAME"
    CONTAINER_NAME="${CLUSTER_NAME}-control-plane"

    echo -e "\n⚠️  Warning: This will permanently delete the selected cluster [[ $CLUSTER_NAME ]]!!"
    echo -e "\n🤔 Are you sure you want to delete the cluster $CLUSTER_NAME?"
    echo -e "   Type 'Yes' to confirm, or press Enter to cancel: \c"
    read delete
    
    # Handle empty input (just pressing Enter)
    if [[ -z "$delete" ]]; then
        echo -e "\n🔵 Operation cancelled (no input provided), not deleting the cluster $CLUSTER_NAME."
        log "Delete operation cancelled - no input provided"
        exit 1
    elif [[ "$delete" =~ ^[Yy]es$ ]]; then
        echo -e "\n🔴 Deleting the cluster: $CLUSTER_NAME with container name: $CONTAINER_NAME"
        kind delete cluster --name=$CLUSTER_NAME
        echo -e "\n🛑 Cluster is deleted."
        log "Cluster $CLUSTER_NAME deleted"
        
        # Backup kube config to project-specific location
        cp $HOME/.kube/config "${SCRIPT_DIR}/.devpilot-backups/kube-config-$(date +%Y%m%d%H%M%S).bak"
    else
        echo -e "\n🔵 Operation cancelled by user, not deleting the cluster $CLUSTER_NAME."
        log "Delete operation cancelled by user"
        exit 1
    fi

}

ssh_cluster(){

    checkCommandCompatibility "devspace ssh-cluster"
    echo -e "\n🟢 Entering into the current active cluster..."
    CURR_CONTEXT=$(kubectl config current-context)
    CLUSTER_NAME="${CURR_CONTEXT/kind-/}"
    echo -e "\n🚀 Active cluster Name is: $CLUSTER_NAME\n"
    CONTAINER_NAME="${CLUSTER_NAME}-control-plane"
    docker exec -it $CONTAINER_NAME bash
    exit 0
}

validate_input() {
    if [[ -z $1 ]]; then
        echo "❌ Error: Input cannot be empty."
        exit 1
    fi
}


main(){
    # Debug logging
    log "Received argument: $1"
    
    arg=$1
    if [[ $arg == "--start-cluster" || $arg == "--start" ]];then
        # Accept both --start-cluster and --start for compatibility
        log "Starting cluster..."
        start_cluster
    elif [[ $arg == "--stop-cluster" || $arg == "--stop" ]];then
        # Accept both --stop-cluster and --stop for compatibility
        log "Stopping cluster..."
        stop_cluster
    elif [[ $arg == "--switch-cluster" || $arg == "--switch" ]];then
        # Accept both --switch-cluster and --switch for compatibility
        log "Switching cluster..."
        switch_cluster
    elif [[ $arg == "--delete-cluster" || $arg == "--delete" ]];then
        # Accept both --delete-cluster and --delete for compatibility
        log "Deleting cluster..."
        delete_cluster
    elif [[ $arg == "--ssh-cluster" || $arg == "--ssh" ]];then
        # Accept both --ssh-cluster and --ssh for compatibility
        log "SSH into cluster..."
        ssh_cluster
    else
        echo "❌ Invalid option: $arg" | tee -a "${LOG_FILE}"
        echo "Available options:" | tee -a "${LOG_FILE}"
        echo "  --start, --start-cluster    : Start a cluster" | tee -a "${LOG_FILE}"
        echo "  --stop, --stop-cluster      : Stop a cluster" | tee -a "${LOG_FILE}"
        echo "  --switch, --switch-cluster  : Switch between clusters" | tee -a "${LOG_FILE}"
        echo "  --delete, --delete-cluster  : Delete a cluster" | tee -a "${LOG_FILE}"
        echo "  --ssh, --ssh-cluster        : SSH into a cluster" | tee -a "${LOG_FILE}"
    fi
}

main $@