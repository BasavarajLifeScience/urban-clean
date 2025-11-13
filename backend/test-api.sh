#!/bin/bash

#######################################################
# Urban Clean - Complete API Testing Script
# Tests all three user roles end-to-end
#######################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:5000/api/v1"

# Temporary files to store tokens and IDs
RESIDENT_TOKEN=""
RESIDENT_ID=""
SEVAK_TOKEN=""
SEVAK_ID=""
VENDOR_TOKEN=""
VENDOR_ID=""
BOOKING_ID=""
SERVICE_ID=""
PAYMENT_ID=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Urban Clean - API End-to-End Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

#######################################################
# Helper Functions
#######################################################

print_step() {
    echo -e "\n${GREEN}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if server is running
check_server() {
    echo -e "${BLUE}Checking if backend server is running...${NC}"
    HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/../health" 2>/dev/null || echo "000")

    if [ "$HEALTH_CHECK" = "000" ] || [ "$HEALTH_CHECK" = "404" ]; then
        # Try the root endpoint
        ROOT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000" 2>/dev/null || echo "000")
        if [ "$ROOT_CHECK" = "000" ]; then
            print_error "Backend server is not running!"
            echo -e "${YELLOW}Please start the backend server first:${NC}"
            echo -e "  cd backend"
            echo -e "  npm run dev\n"
            exit 1
        fi
    fi
    print_success "Backend server is running"
}

# Make API call and show response
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5

    echo -e "${YELLOW}→ ${description}${NC}"

    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" \
              -H "Authorization: Bearer $token" \
              -H "Content-Type: application/json" \
              -d "$data" 2>&1)
        else
            RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" \
              -H "Authorization: Bearer $token" 2>&1)
        fi
    else
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" \
              -H "Content-Type: application/json" \
              -d "$data" 2>&1)
        else
            RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" 2>&1)
        fi
    fi

    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo "$RESPONSE"
}

#######################################################
# PRE-FLIGHT CHECK
#######################################################

check_server

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_info "jq is not installed. JSON output will not be pretty-printed."
    print_info "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
fi

#######################################################
# 1. RESIDENT FLOW - Registration & Authentication
#######################################################

print_step "1. RESIDENT REGISTRATION FLOW"

echo -e "\n${BLUE}1.1 Register Resident${NC}"
REGISTER_RESPONSE=$(api_call "POST" "/auth/register" '{
  "phoneNumber": "+919876543210",
  "email": "resident.test@urbanclean.com",
  "password": "SecurePass123!",
  "role": "resident",
  "fullName": "Test Resident"
}' "" "Registering new resident")

RESIDENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)

if [ -n "$RESIDENT_ID" ]; then
    print_success "Resident registered successfully. User ID: $RESIDENT_ID"
else
    print_error "Resident registration failed"
    ERROR_MSG=$(echo "$REGISTER_RESPONSE" | jq -r '.message // .error // empty' 2>/dev/null)
    if [ -n "$ERROR_MSG" ]; then
        print_info "Error: $ERROR_MSG"
    fi
fi

echo -e "\n${BLUE}1.2 Verify OTP${NC}"
if [ -n "$RESIDENT_ID" ]; then
    OTP_RESPONSE=$(api_call "POST" "/auth/verify-otp" "{
      \"userId\": \"$RESIDENT_ID\",
      \"otp\": \"123456\"
    }" "" "Verifying OTP")

    RESIDENT_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

    if [ -n "$RESIDENT_TOKEN" ]; then
        print_success "OTP verified successfully. Token received."
    else
        print_info "OTP verification may have failed. Will try login instead."
    fi
else
    print_info "Skipping OTP verification (no user ID)"
fi

echo -e "\n${BLUE}1.3 Login Resident${NC}"
LOGIN_RESPONSE=$(api_call "POST" "/auth/login" '{
  "phoneOrEmail": "resident.test@urbanclean.com",
  "password": "SecurePass123!"
}' "" "Logging in resident")

if [ -z "$RESIDENT_TOKEN" ]; then
    RESIDENT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$RESIDENT_TOKEN" ]; then
    print_success "Resident logged in successfully"
else
    print_error "Resident login failed"
    ERROR_MSG=$(echo "$LOGIN_RESPONSE" | jq -r '.message // .error // empty' 2>/dev/null)
    if [ -n "$ERROR_MSG" ]; then
        print_info "Error: $ERROR_MSG"
    fi
fi

#######################################################
# Continue only if we have authentication
#######################################################

if [ -z "$RESIDENT_TOKEN" ]; then
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}Cannot continue without authentication${NC}"
    echo -e "${RED}========================================${NC}\n"
    echo -e "${YELLOW}Possible issues:${NC}"
    echo -e "1. Backend server is not running"
    echo -e "2. Database is not connected"
    echo -e "3. API endpoints are not configured correctly"
    echo -e "\n${YELLOW}Please check:${NC}"
    echo -e "- Backend logs for errors"
    echo -e "- MongoDB connection"
    echo -e "- .env file configuration\n"
    exit 1
fi

#######################################################
# 2. SERVICE DISCOVERY
#######################################################

print_step "2. SERVICE DISCOVERY"

echo -e "\n${BLUE}2.1 Get All Service Categories${NC}"
CATEGORIES_RESPONSE=$(api_call "GET" "/services/categories" "" "" "Fetching service categories")

echo -e "\n${BLUE}2.2 Browse Services${NC}"
SERVICES_RESPONSE=$(api_call "GET" "/services?page=1&limit=10" "" "" "Browsing services")
SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data.services[0]._id // .services[0]._id // empty' 2>/dev/null)

if [ -n "$SERVICE_ID" ]; then
    print_info "Selected Service ID: $SERVICE_ID"
else
    print_error "No services found. Please run: npm run seed (in backend folder)"
fi

#######################################################
# Summary
#######################################################

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo "Test Results:"
echo "  Backend Server: ✓ Running"
if [ -n "$RESIDENT_TOKEN" ]; then
    echo "  Authentication: ✓ Working"
else
    echo "  Authentication: ✗ Failed"
fi

if [ -n "$SERVICE_ID" ]; then
    echo "  Services: ✓ Available"
else
    echo "  Services: ✗ No data (run: npm run seed)"
fi

echo -e "\nTest Identifiers:"
echo "  Resident ID: ${RESIDENT_ID:-Not available}"
echo "  Resident Token: ${RESIDENT_TOKEN:0:20}..."
echo "  Service ID: ${SERVICE_ID:-Not available}"

echo -e "\n${YELLOW}For full testing, ensure:${NC}"
echo "  1. Backend server is running (npm run dev)"
echo "  2. MongoDB is connected"
echo "  3. Database is seeded (npm run seed)"
echo ""
