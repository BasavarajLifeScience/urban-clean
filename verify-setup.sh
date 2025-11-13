#!/bin/bash

echo "🔍 Society Service Booking App - Setup Verification"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

echo "1. Checking Prerequisites..."
echo "----------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is NOT installed"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: v$NPM_VERSION"
else
    print_error "npm is NOT installed"
    exit 1
fi

# Check MongoDB
echo ""
echo "2. Checking MongoDB..."
echo "----------------------------"

if command_exists mongosh; then
    print_success "mongosh (MongoDB Shell) is installed"

    # Try to connect to MongoDB
    if mongosh --eval "db.version()" --quiet > /dev/null 2>&1; then
        MONGO_VERSION=$(mongosh --eval "db.version()" --quiet)
        print_success "MongoDB is RUNNING (version: $MONGO_VERSION)"
    else
        print_error "MongoDB is installed but NOT RUNNING"
        echo ""
        echo "   To start MongoDB:"
        echo "   - macOS: brew services start mongodb-community"
        echo "   - Linux: sudo systemctl start mongod"
        echo "   - Windows: net start MongoDB"
        echo ""
        exit 1
    fi
elif command_exists mongo; then
    print_success "mongo (legacy MongoDB Shell) is installed"

    if mongo --eval "db.version()" --quiet > /dev/null 2>&1; then
        MONGO_VERSION=$(mongo --eval "db.version()" --quiet)
        print_success "MongoDB is RUNNING (version: $MONGO_VERSION)"
    else
        print_error "MongoDB is installed but NOT RUNNING"
        echo ""
        echo "   To start MongoDB:"
        echo "   - macOS: brew services start mongodb-community"
        echo "   - Linux: sudo systemctl start mongod"
        echo "   - Windows: net start MongoDB"
        echo ""
        exit 1
    fi
else
    print_error "MongoDB Shell is NOT installed"
    echo ""
    echo "   Install MongoDB:"
    echo "   - macOS: brew install mongodb-community"
    echo "   - Linux: See SETUP.md for instructions"
    echo "   - Windows: Download from https://www.mongodb.com/try/download/community"
    echo ""
    exit 1
fi

# Check Git
echo ""
echo "3. Checking Git..."
echo "----------------------------"
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git installed: $GIT_VERSION"
else
    print_warning "Git is NOT installed (optional but recommended)"
fi

# Check Backend Setup
echo ""
echo "4. Checking Backend Setup..."
echo "----------------------------"

if [ -d "backend" ]; then
    print_success "Backend directory exists"

    if [ -d "backend/node_modules" ]; then
        print_success "Backend dependencies installed"
    else
        print_warning "Backend dependencies NOT installed"
        echo "   Run: cd backend && npm install"
    fi

    if [ -f "backend/.env" ]; then
        print_success "Backend .env file exists"
    else
        print_warning "Backend .env file NOT found"
        echo "   Create: cp backend/.env.example backend/.env"
    fi
else
    print_error "Backend directory NOT found"
    exit 1
fi

# Check Frontend Setup
echo ""
echo "5. Checking Frontend Setup..."
echo "----------------------------"

if [ -d "frontend" ]; then
    print_success "Frontend directory exists"

    if [ -d "frontend/node_modules" ]; then
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend dependencies NOT installed"
        echo "   Run: cd frontend && npm install"
    fi
else
    print_error "Frontend directory NOT found"
    exit 1
fi

# Check if backend server is running
echo ""
echo "6. Checking Backend Server..."
echo "----------------------------"

if curl -s http://localhost:5000/api/v1/health > /dev/null 2>&1; then
    print_success "Backend server is RUNNING on http://localhost:5000"
else
    print_warning "Backend server is NOT running"
    echo "   Start: cd backend && npm run dev"
fi

# Database check
echo ""
echo "7. Checking Database..."
echo "----------------------------"

if mongosh --eval "use society-booking; db.getCollectionNames()" --quiet > /dev/null 2>&1; then
    COLLECTIONS=$(mongosh --eval "use society-booking; db.getCollectionNames().length" --quiet 2>/dev/null)
    if [ "$COLLECTIONS" -gt 0 ]; then
        print_success "Database 'society-booking' exists with $COLLECTIONS collections"
    else
        print_warning "Database exists but has no collections"
        echo "   Run seed script: cd backend && npm run seed"
    fi
else
    print_warning "Database 'society-booking' not found"
    echo "   Run seed script: cd backend && npm run seed"
fi

# Summary
echo ""
echo "=================================================="
echo "Summary:"
echo "=================================================="
echo ""

if mongosh --eval "db.version()" --quiet > /dev/null 2>&1 && \
   [ -d "backend/node_modules" ] && \
   [ -d "frontend/node_modules" ]; then
    print_success "System is ready for development!"
    echo ""
    echo "Next steps:"
    echo "  1. Start backend: cd backend && npm run dev"
    echo "  2. Start frontend: cd frontend && npx expo start"
    echo "  3. Open SETUP.md for detailed instructions"
else
    print_warning "Setup is incomplete. Please fix the issues above."
    echo ""
    echo "See SETUP.md for detailed setup instructions."
fi

echo ""
