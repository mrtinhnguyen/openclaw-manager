#!/bin/bash

# OpenClaw Docker Quick Start Script

echo "Starting BlockClaw Manager via Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Pull the latest image
echo "Pulling latest image..."
docker pull blockclaw-manager:latest

# Run the container
echo "Running BlockClaw Manager..."
docker run -d \
  --name blockclaw-manager \
  --restart always \
  -p 3000:3000 \
  -v blockclaw-data:/app/data \
  blockclaw-manager:latest

echo "BlockClaw Manager is running at http://localhost:3000"
echo "To view logs: docker logs -f blockclaw-manager"
