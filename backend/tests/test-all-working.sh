#!/bin/bash

#######################################################
# COMPLETE WORKING API TEST SUITE
# Tests all endpoints that have been verified working
#######################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:5001/api/v1"
TIMESTAMP=$(date +%s)

# Test tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Data storage
RESIDENT_TOKEN=""
RESIDENT_ID=""
SEVAK_TOKEN=""
SEVAK_ID=""
VENDOR_TOKEN=""
VENDOR_ID=""
SERVICE_ID=""
BOOKING_ID=""

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  URBAN CLEAN - COMPLETE API TEST      ║${NC}"
echo -e "${BLUE}║  All Verified Working Endpoints        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Helper functions
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5

    ((TESTS_TOTAL++))
    echo -e "\n${YELLOW}[$TESTS_TOTAL] Testing: $name${NC}"

    sleep 0.3  # Avoid rate limiting

    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Authorization: Bearer $token" \
              -H "Content-Type: application/json" \
              -H "Origin: http://localhost:5001" \
              -d "$data")
        else
            RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Authorization: Bearer $token" \
              -H "Origin: http://localhost:5001")
        fi
    else
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Content-Type: application/json" \
              -H "Origin: http://localhost:5001" \
              -d "$data")
        else
            RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$API_URL$endpoint" \
              -H "Origin: http://localhost:5001")
        fi
    fi

    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | sed 's/HTTP_STATUS://')
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

    if [[ "$HTTP_STATUS" =~ ^2 ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_STATUS)"
        ((TESTS_PASSED++))
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_STATUS)"
        ((TESTS_FAILED++))
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi

    echo "$BODY"
}

#######################################################
# 1. RESIDENT COMPLETE FLOW
#######################################################

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  RESIDENT FLOW - Complete Journey${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Register or Login
REGISTER_RESPONSE=$(test_endpoint "Register Resident" "POST" "/auth/register" "{
  \"phoneNumber\": \"+9199999${TIMESTAMP:(-5)}\",
  \"email\": \"resident${TIMESTAMP}@test.com\",
  \"password\": \"SecurePass123!\",
  \"role\": \"resident\",
  \"fullName\": \"Test Resident ${TIMESTAMP}\"
}")

RESIDENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)
DEV_OTP=$(echo "$REGISTER_RESPONSE" | jq -r '.data.otp // .otp // empty' 2>/dev/null)

if [ -n "$RESIDENT_ID" ]; then
    echo -e "${GREEN}→ User ID: $RESIDENT_ID${NC}"
    if [ -n "$DEV_OTP" ]; then
        echo -e "${GREEN}→ OTP: $DEV_OTP${NC}"

        # Verify OTP
        OTP_RESPONSE=$(test_endpoint "Verify OTP" "POST" "/auth/verify-otp" "{
          \"userId\": \"$RESIDENT_ID\",
          \"otp\": \"$DEV_OTP\"
        }")

        RESIDENT_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
    fi
fi

# Login if no token yet
if [ -z "$RESIDENT_TOKEN" ]; then
    LOGIN_RESPONSE=$(test_endpoint "Login Resident" "POST" "/auth/login" "{
      \"phoneOrEmail\": \"resident${TIMESTAMP}@test.com\",
      \"password\": \"SecurePass123!\"
    }")

    RESIDENT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$RESIDENT_TOKEN" ]; then
    echo -e "${GREEN}→ Authenticated successfully${NC}\n"

    # Profile endpoints
    test_endpoint "Get Profile" "GET" "/users/profile" "" "$RESIDENT_TOKEN"

    test_endpoint "Update Profile" "PUT" "/users/profile" "{
      \"firstName\": \"Test\",
      \"lastName\": \"Resident\",
      \"address\": {
        \"flatNumber\": \"101\",
        \"building\": \"Tower A\",
        \"city\": \"Mumbai\",
        \"pincode\": \"400001\"
      }
    }" "$RESIDENT_TOKEN"
fi

# Service endpoints (public)
CATEGORIES_RESPONSE=$(test_endpoint "Get Categories" "GET" "/services/categories")

SERVICES_RESPONSE=$(test_endpoint "Browse Services" "GET" "/services?page=1&limit=5")
SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data[0]._id // empty' 2>/dev/null)

if [ -n "$SERVICE_ID" ]; then
    echo -e "${GREEN}→ Service ID: $SERVICE_ID${NC}"
    test_endpoint "Get Service Details" "GET" "/services/$SERVICE_ID"
fi

# Authenticated service features
if [ -n "$RESIDENT_TOKEN" ] && [ -n "$SERVICE_ID" ]; then
    test_endpoint "Add to Favorites" "POST" "/services/favorites" "{
      \"serviceId\": \"$SERVICE_ID\"
    }" "$RESIDENT_TOKEN"

    test_endpoint "Get Favorites" "GET" "/services/favorites" "" "$RESIDENT_TOKEN"
fi

# Booking endpoints
if [ -n "$RESIDENT_TOKEN" ] && [ -n "$SERVICE_ID" ]; then
    test_endpoint "Get Available Slots" "GET" "/bookings/available-slots?serviceId=$SERVICE_ID&date=2025-11-25" "" "$RESIDENT_TOKEN"

    BOOKING_RESPONSE=$(test_endpoint "Create Booking" "POST" "/bookings" "{
      \"serviceId\": \"$SERVICE_ID\",
      \"scheduledDate\": \"2025-11-25\",
      \"scheduledTime\": \"10:00 AM\",
      \"address\": {
        \"flatNumber\": \"101\",
        \"building\": \"Tower A\",
        \"city\": \"Mumbai\",
        \"pincode\": \"400001\"
      },
      \"specialInstructions\": \"Test booking\"
    }" "$RESIDENT_TOKEN")

    BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.booking._id // .booking._id // empty' 2>/dev/null)

    if [ -n "$BOOKING_ID" ]; then
        echo -e "${GREEN}→ Booking ID: $BOOKING_ID${NC}"

        test_endpoint "Get My Bookings" "GET" "/bookings/my-bookings" "" "$RESIDENT_TOKEN"
        test_endpoint "Get Booking Details" "GET" "/bookings/$BOOKING_ID" "" "$RESIDENT_TOKEN"
    fi
fi

# Notifications
if [ -n "$RESIDENT_TOKEN" ]; then
    test_endpoint "Get Notifications" "GET" "/notifications" "" "$RESIDENT_TOKEN"
fi

#######################################################
# 2. SEVAK COMPLETE FLOW
#######################################################

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SEVAK FLOW - Complete Journey${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

SEVAK_REG_RESPONSE=$(test_endpoint "Register Sevak" "POST" "/auth/register" "{
  \"phoneNumber\": \"+9198888${TIMESTAMP:(-5)}\",
  \"email\": \"sevak${TIMESTAMP}@test.com\",
  \"password\": \"SecurePass123!\",
  \"role\": \"sevak\",
  \"fullName\": \"Test Sevak ${TIMESTAMP}\"
}")

SEVAK_ID=$(echo "$SEVAK_REG_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)
SEVAK_OTP=$(echo "$SEVAK_REG_RESPONSE" | jq -r '.data.otp // .otp // empty' 2>/dev/null)

if [ -n "$SEVAK_ID" ] && [ -n "$SEVAK_OTP" ]; then
    echo -e "${GREEN}→ Sevak ID: $SEVAK_ID${NC}"

    SEVAK_OTP_RESPONSE=$(test_endpoint "Verify Sevak OTP" "POST" "/auth/verify-otp" "{
      \"userId\": \"$SEVAK_ID\",
      \"otp\": \"$SEVAK_OTP\"
    }")

    SEVAK_TOKEN=$(echo "$SEVAK_OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -z "$SEVAK_TOKEN" ]; then
    SEVAK_LOGIN_RESPONSE=$(test_endpoint "Login Sevak" "POST" "/auth/login" "{
      \"phoneOrEmail\": \"sevak${TIMESTAMP}@test.com\",
      \"password\": \"SecurePass123!\"
    }")

    SEVAK_TOKEN=$(echo "$SEVAK_LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$SEVAK_TOKEN" ]; then
    echo -e "${GREEN}→ Sevak authenticated${NC}\n"

    test_endpoint "Get Sevak Profile" "GET" "/users/profile" "" "$SEVAK_TOKEN"

    test_endpoint "Update Sevak Profile" "PUT" "/users/profile" "{
      \"firstName\": \"Test\",
      \"lastName\": \"Sevak\",
      \"skills\": [\"Cleaning\", \"Maintenance\"],
      \"experience\": 5
    }" "$SEVAK_TOKEN"

    test_endpoint "Get Sevak Jobs" "GET" "/sevak/jobs" "" "$SEVAK_TOKEN"
    test_endpoint "Get Sevak Earnings" "GET" "/sevak/earnings" "" "$SEVAK_TOKEN"
    test_endpoint "Get Sevak Performance" "GET" "/sevak/performance" "" "$SEVAK_TOKEN"
fi

#######################################################
# 3. VENDOR COMPLETE FLOW
#######################################################

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  VENDOR FLOW - Complete Journey${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

VENDOR_REG_RESPONSE=$(test_endpoint "Register Vendor" "POST" "/auth/register" "{
  \"phoneNumber\": \"+9197777${TIMESTAMP:(-5)}\",
  \"email\": \"vendor${TIMESTAMP}@test.com\",
  \"password\": \"SecurePass123!\",
  \"role\": \"vendor\",
  \"fullName\": \"Test Vendor ${TIMESTAMP}\"
}")

VENDOR_ID=$(echo "$VENDOR_REG_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)
VENDOR_OTP=$(echo "$VENDOR_REG_RESPONSE" | jq -r '.data.otp // .otp // empty' 2>/dev/null)

if [ -n "$VENDOR_ID" ] && [ -n "$VENDOR_OTP" ]; then
    echo -e "${GREEN}→ Vendor ID: $VENDOR_ID${NC}"

    VENDOR_OTP_RESPONSE=$(test_endpoint "Verify Vendor OTP" "POST" "/auth/verify-otp" "{
      \"userId\": \"$VENDOR_ID\",
      \"otp\": \"$VENDOR_OTP\"
    }")

    VENDOR_TOKEN=$(echo "$VENDOR_OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -z "$VENDOR_TOKEN" ]; then
    VENDOR_LOGIN_RESPONSE=$(test_endpoint "Login Vendor" "POST" "/auth/login" "{
      \"phoneOrEmail\": \"vendor${TIMESTAMP}@test.com\",
      \"password\": \"SecurePass123!\"
    }")

    VENDOR_TOKEN=$(echo "$VENDOR_LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$VENDOR_TOKEN" ]; then
    echo -e "${GREEN}→ Vendor authenticated${NC}\n"

    test_endpoint "Get Vendor Profile" "GET" "/users/profile" "" "$VENDOR_TOKEN"

    test_endpoint "Update Vendor Profile" "PUT" "/users/profile" "{
      \"firstName\": \"Test\",
      \"lastName\": \"Vendor\",
      \"businessName\": \"Test Cleaning Services\"
    }" "$VENDOR_TOKEN"
fi

#######################################################
# FINAL SUMMARY
#######################################################

echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          TEST RESULTS SUMMARY          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "Total Tests: ${BLUE}$TESTS_TOTAL${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}\n"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓✓✓  ALL TESTS PASSED!  ✓✓✓          ║${NC}"
    echo -e "${GREEN}║  API is fully functional               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Some tests failed                     ║${NC}"
    echo -e "${YELLOW}║  Review output above for details       ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"
    exit 1
fi
