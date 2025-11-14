#!/bin/bash

echo "🔄 Restarting backend to apply code changes..."
echo ""

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Method 1: Try restarting via docker-compose
if [ -f "backend/docker-compose.yml" ]; then
    echo "📦 Using docker-compose to restart..."
    cd backend
    docker-compose restart backend
    cd ..
    echo ""
    echo "✅ Backend restarted via docker-compose"
    echo ""
    echo "📋 Checking logs (last 20 lines)..."
    docker-compose -f backend/docker-compose.yml logs --tail 20 backend
else
    # Method 2: Try restarting by container name
    echo "🐳 Looking for backend container..."

    # Try common container names
    for name in society-booking-backend backend urban-clean-backend; do
        if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
            echo "✅ Found container: ${name}"
            docker restart ${name}
            echo ""
            echo "✅ Backend restarted"
            echo ""
            echo "📋 Checking logs (last 20 lines)..."
            docker logs --tail 20 ${name}
            exit 0
        fi
    done

    echo "❌ Could not find backend container"
    echo ""
    echo "📋 Available containers:"
    docker ps --format 'table {{.Names}}\t{{.Status}}'
    echo ""
    echo "💡 To restart manually, run:"
    echo "   docker restart <container-name>"
fi

echo ""
echo "🎉 Done! Your backend should now be running with the latest code."
echo "🔍 Try creating a new booking and viewing it to test the fix."
