#!/bin/bash

# Ensure we exit on error
set -e

echo "Starting deployment..."

# Pull the latest code (assuming you are on the correct branch, e.g., main)
# git pull origin main

# Navigate to the server directory
cd server

# Build and restart docker compose
echo "Building and starting Docker containers..."
docker compose -f docker-compose.production.yml up -d --build

echo "Deployment complete! Services are now running."
echo "You can view logs using: cd server && docker compose -f docker-compose.production.yml logs -f"
