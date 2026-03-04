#!/bin/bash

# ip="10.1.37.28"
ip="localhost"
# vol_dir="/home/orion/code/rawal/se"
vol_dir="/home/rawal/code/College/sem2/SE/project3-vols"

# Function to start an existing container or run a new one
start_or_run_container() {
    local container_name="$1"
    shift # Remove the container_name from arguments
    local docker_command=("$@") # The rest of the arguments are the docker run command or start command

    echo "Checking for container: $container_name..."

    if docker inspect "$container_name" &> /dev/null; then
        # Container exists, check its state
        local status=$(docker inspect -f '{{.State.Status}}' "$container_name")
        if [ "$status" == "running" ]; then
            echo "Container '$container_name' is already running."
            return 0 # Indicate success (container is in desired state)
        elif [ "$status" == "exited" ]; then
            echo "Container '$container_name' exists but is stopped. Starting it..."
            if docker start "$container_name"; then
                echo "Container '$container_name' started successfully."
                return 0 # Indicate success
            else
                echo "Failed to start container '$container_name'."
                return 1 # Indicate failure
            fi
        else
            # Handle other states like "paused", "restarting", etc.
            echo "Container '$container_name' is in state '$status'. Cannot start/run."
            return 1 # Indicate skipping or failure
        fi
    else
        # Container does not exist, run it
        echo "Container '$container_name' not found. Running a new one..."
        # Execute the full docker run command passed as arguments
        if "${docker_command[@]}"; then
             echo "Container '$container_name' created and started successfully."
             return 0 # Indicate success
        else
             echo "Failed to run new container '$container_name'."
             return 1 # Indicate failure
        fi
    fi
}

# Function to run PostgreSQL
run_postgres() {
    local container_name="postgres_container"
    start_or_run_container "$container_name" docker run --name "$container_name" -p 5432:5432 -e POSTGRES_PASSWORD=sepr3 -v $vol_dir/postgres_data:/var/lib/postgresql/data -d postgres
}

# Function to run MinIO
run_minio() {
    local container_name="minio"
    start_or_run_container "$container_name" docker run -p 9000:9000 -p 9001:9001 --name "$container_name" -d -v $vol_dir/minio_data:/data minio/minio server /data --console-address ":9001"
}

# Function to run MongoDB
run_mongodb() {
    local container_name="mongo_container"
    start_or_run_container "$container_name" docker run -d -p 27017:27017 -v $vol_dir/mongodb_data:/data/db --name="$container_name" mongo:latest
}

# Function to run Kafka (using the provided environment variables)
run_kafka() {
    local container_name="kafka_container" # Giving it a name for easier management
    start_or_run_container "$container_name" docker run -d -p 9092:9092 \
        --name "$container_name" \
        -e KAFKA_NODE_ID=1 \
        -e KAFKA_PROCESS_ROLES=broker,controller \
        -e KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
        -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$ip:9092 \
        -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
        -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
        -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
        -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
        -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
        -e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
        -e KAFKA_NUM_PARTITIONS=1 \
        apache/kafka:4.0.0
}

# Function to run Elasticsearch
run_elasticsearch() {
    local container_name="elasticsearch"
    # Note: Elasticsearch 9.x is likely a pre-release. Using 7.x or 8.x is generally recommended
    # for stability unless specifically needed. The original command is used as requested.
    start_or_run_container "$container_name" docker run -d --name "$container_name" -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "network.host=0" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:9.0.0
}

# Function to run Consul (development mode)
run_consul() {
    local container_name="dev-consul"
    start_or_run_container "$container_name" docker run -d -p 8500:8500 --name="$container_name" hashicorp/consul
}

# --- Main script logic ---

# Define an associative array mapping service names to function names
declare -A services
services["postgres"]="run_postgres"
services["minio"]="run_minio"
services["mongodb"]="run_mongodb"
services["kafka"]="run_kafka"
services["elasticsearch"]="run_elasticsearch"
services["consul"]="run_consul"

# If no arguments are provided, run all services
if [ $# -eq 0 ]; then
    echo "No specific services requested. Attempting to start/run all services..."
    for service_name in "${!services[@]}"; do
        ${services[$service_name]}
        echo "--------------------"
    done
else
    # Iterate through provided arguments and run the corresponding service function
    for arg in "$@"; do
        service_name=$(echo "$arg" | tr '[:upper:]' '[:lower:]') # Convert argument to lowercase
        if [[ -v services[$service_name] ]]; then
            echo "Processing service: $service_name..."
            ${services[$service_name]}
            echo "--------------------"
        else
            echo "Error: Unknown service '$arg'."
            echo "Available services: ${!services[@]}"
            echo "--------------------"
        fi
    done
fi

echo "Script finished."
