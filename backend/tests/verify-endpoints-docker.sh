#!/bin/bash

#######################################################
# ENDPOINT VERIFICATION SCRIPT FOR DOCKER
# Tests each API endpoint with Docker configuration
#######################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Docker uses port 5001
API_URL="http://localhost:5001/api/v1"

# Create log file
LOG_FILE="endpoint-test-results.log"
echo "Urban Clean API Endpoint Verification (Docker)" > $LOG_FILE
echo "Started at: $(date)" >> $LOG_FILE
echo "API URL: $API_URL" >> $LOG_FILE
echo "========================================" >> $LOG_FILE
echo "" >> $LOG_FILE

print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo "" >> $LOG_FILE
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $LOG_FILE
    echo "$1" >> $LOG_FILE
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $LOG_FILE
    echo "" >> $LOG_FILE
}

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local token=$5

    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Testing: $description" >> $LOG_FILE
    echo "Endpoint: $method $API_URL$endpoint" >> $LOG_FILE

    if [ -n "$data" ]; then
        echo "Request Data:" >> $LOG_FILE
        echo "$data" | jq '.' >> $LOG_FILE 2>/dev/null || echo "$data" >> $LOG_FILE
    fi

    echo "Response:" >> $LOG_FILE

    # Add delay to avoid rate limiting
    sleep 0.5

    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Authorization: Bearer $token" \
              -H "Content-Type: application/json" \
              -H "Origin: http://localhost:5001" \
              -d "$data")
        else
            RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Authorization: Bearer $token" \
              -H "Origin: http://localhost:5001")
        fi
    else
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Content-Type: application/json" \
              -H "Origin: http://localhost:5001" \
              -d "$data")
        else
            RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Origin: http://localhost:5001")
        fi
    fi

    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | sed 's/HTTP_CODE://')
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo "$BODY" | jq '.' >> $LOG_FILE 2>/dev/null || echo "$BODY" >> $LOG_FILE
    echo "HTTP Status: $HTTP_CODE" >> $LOG_FILE

    if [[ "$HTTP_CODE" =~ ^2 ]]; then
        echo -e "${GREEN}✓ SUCCESS (HTTP $HTTP_CODE)${NC}\n"
        echo "STATUS: SUCCESS" >> $LOG_FILE
    else
        echo -e "${RED}✗ FAILED (HTTP $HTTP_CODE)${NC}\n"
        echo "STATUS: FAILED" >> $LOG_FILE
    fi

    echo "" >> $LOG_FILE
    echo "$BODY"
}

#######################################################
# START TESTING
#######################################################

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   API ENDPOINT VERIFICATION (DOCKER)   ║${NC}"
echo -e "${BLUE}║   Port: 5001                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

#######################################################
# 1. TEST SERVER CONNECTIVITY
#######################################################

print_section "1. SERVER CONNECTIVITY TESTS"

echo -e "${YELLOW}Checking if Docker backend is running...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗ Server is NOT running!${NC}\n"
    echo "Server is NOT running" >> $LOG_FILE
    echo -e "${YELLOW}Please start Docker:${NC}"
    echo "  docker-compose up -d\n"
    exit 1
else
    echo -e "${GREEN}✓ Server is running (HTTP $HTTP_CODE)${NC}\n"
    echo "Server is running (HTTP $HTTP_CODE)" >> $LOG_FILE
fi

test_endpoint "GET" "/" "" "Root endpoint (via port 5001)"
test_endpoint "GET" "/health" "" "Health check"

#######################################################
# 2. TEST AUTH ENDPOINTS
#######################################################

print_section "2. AUTHENTICATION ENDPOINTS"

# Test registration
REGISTER_DATA='{
  "phoneNumber": "+919999999001",
  "email": "test.docker@urbanclean.com",
  "password": "SecurePass123!",
  "role": "resident",
  "fullName": "Docker Test User"
}'

REGISTER_RESPONSE=$(test_endpoint "POST" "/auth/register" "$REGISTER_DATA" "User Registration")
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)
DEV_OTP=$(echo "$REGISTER_RESPONSE" | jq -r '.data.otp // .otp // empty' 2>/dev/null)

if [ -n "$USER_ID" ]; then
    echo -e "${GREEN}✓ User ID captured: $USER_ID${NC}"
    echo "User ID: $USER_ID" >> $LOG_FILE

    if [ -n "$DEV_OTP" ]; then
        echo -e "${GREEN}✓ OTP (dev mode): $DEV_OTP${NC}"
        echo "OTP: $DEV_OTP" >> $LOG_FILE
    fi
else
    echo -e "${RED}✗ Could not get User ID from registration${NC}"
    echo -e "${YELLOW}Possible issues:${NC}"
    echo "  - CORS blocking (check ALLOWED_ORIGINS in docker-compose.yml)"
    echo "  - Rate limiting (wait and try again)"
    echo "  - MongoDB not connected"
fi

# Test OTP verification if we have user ID
if [ -n "$USER_ID" ]; then
    sleep 1  # Avoid rate limiting

    OTP_DATA="{
      \"userId\": \"$USER_ID\",
      \"otp\": \"${DEV_OTP:-123456}\"
    }"

    OTP_RESPONSE=$(test_endpoint "POST" "/auth/verify-otp" "$OTP_DATA" "OTP Verification")
    ACCESS_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

    if [ -n "$ACCESS_TOKEN" ]; then
        echo -e "${GREEN}✓ Access Token captured${NC}"
        echo "Access Token: ${ACCESS_TOKEN:0:50}..." >> $LOG_FILE
    fi
fi

# Test login
sleep 1  # Avoid rate limiting

LOGIN_DATA='{
  "phoneOrEmail": "test.docker@urbanclean.com",
  "password": "SecurePass123!"
}'

LOGIN_RESPONSE=$(test_endpoint "POST" "/auth/login" "$LOGIN_DATA" "User Login")

if [ -z "$ACCESS_TOKEN" ]; then
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Authentication successful!${NC}\n"
else
    echo -e "${RED}✗ Authentication failed${NC}\n"
fi

#######################################################
# 3. TEST USER ENDPOINTS (Requires Auth)
#######################################################

print_section "3. USER ENDPOINTS (Authenticated)"

if [ -n "$ACCESS_TOKEN" ]; then
    sleep 1
    test_endpoint "GET" "/users/profile" "" "Get User Profile" "$ACCESS_TOKEN"

    sleep 1
    UPDATE_PROFILE_DATA='{
      "firstName": "Docker",
      "lastName": "Test",
      "address": {
        "flatNumber": "101",
        "building": "Tower A",
        "city": "Mumbai",
        "pincode": "400001"
      }
    }'

    test_endpoint "PUT" "/users/profile" "$UPDATE_PROFILE_DATA" "Update User Profile" "$ACCESS_TOKEN"
else
    echo -e "${RED}Skipping user endpoints - No access token${NC}\n"
    echo "Skipped - No access token" >> $LOG_FILE
fi

#######################################################
# 4. TEST SERVICE ENDPOINTS
#######################################################

print_section "4. SERVICE ENDPOINTS (Public)"

sleep 1
test_endpoint "GET" "/services/categories" "" "Get Service Categories"

sleep 1
test_endpoint "GET" "/services?page=1&limit=5" "" "Browse Services"

# Get a service ID if available
sleep 1
SERVICES_RESPONSE=$(curl -s -H "Origin: http://localhost:5001" "$API_URL/services?page=1&limit=1")
SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data.services[0]._id // .services[0]._id // empty' 2>/dev/null)

if [ -n "$SERVICE_ID" ]; then
    echo -e "${GREEN}✓ Service ID captured: $SERVICE_ID${NC}"
    echo "Service ID: $SERVICE_ID" >> $LOG_FILE

    sleep 1
    test_endpoint "GET" "/services/$SERVICE_ID" "" "Get Service Details"
else
    echo -e "${YELLOW}⚠ No services found. Run: docker-compose exec backend npm run seed${NC}"
fi

#######################################################
# 5. TEST NOTIFICATIONS
#######################################################

print_section "5. NOTIFICATION ENDPOINTS (Authenticated)"

if [ -n "$ACCESS_TOKEN" ]; then
    sleep 1
    test_endpoint "GET" "/notifications" "" "Get Notifications" "$ACCESS_TOKEN"
else
    echo -e "${RED}Skipping notification endpoints - No access token${NC}\n"
fi

#######################################################
# SUMMARY
#######################################################

echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        VERIFICATION COMPLETE           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✓ Results saved to: $LOG_FILE${NC}"
echo -e "${YELLOW}→ Review the log file for detailed responses${NC}\n"

echo "Captured IDs for further testing:"
echo "  User ID: ${USER_ID:-Not available}"
echo "  Access Token: ${ACCESS_TOKEN:+Available (check log)}"
echo "  Service ID: ${SERVICE_ID:-Not available (run seed)}"

echo -e "\n${YELLOW}If tests failed:${NC}"
echo "1. Check docker-compose.yml ALLOWED_ORIGINS includes http://localhost:5001"
echo "2. Restart Docker: docker-compose restart backend"
echo "3. Seed database: docker-compose exec backend npm run seed"
echo "4. Check backend logs: docker-compose logs backend"
echo ""
