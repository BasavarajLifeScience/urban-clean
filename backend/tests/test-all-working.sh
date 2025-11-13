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

# Helper function - makes API call and displays result
# Returns the response body via stdout
call_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5

    ((TESTS_TOTAL++))
    echo -e "\n${YELLOW}[$TESTS_TOTAL] Testing: $name${NC}" >&2

    sleep 0.3  # Avoid rate limiting

    local RESPONSE
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

    local HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | sed 's/HTTP_STATUS://')
    local BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

    # Display result to stderr
    if [[ "$HTTP_STATUS" =~ ^2 ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_STATUS)" >&2
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_STATUS)" >&2
        ((TESTS_FAILED++))
    fi

    # Pretty print to stderr
    echo "$BODY" | jq '.' 2>/dev/null >&2 || echo "$BODY" >&2

    # Return raw body to stdout for capture
    echo "$BODY"
}

#######################################################
# 1. RESIDENT COMPLETE FLOW
#######################################################

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  RESIDENT FLOW - Complete Journey${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Register Resident
REGISTER_RESPONSE=$(call_api "Register Resident" "POST" "/auth/register" "{
  \"phoneNumber\": \"+9199999${TIMESTAMP:(-5)}\",
  \"email\": \"resident${TIMESTAMP}@test.com\",
  \"password\": \"SecurePass123!\",
  \"role\": \"resident\",
  \"fullName\": \"Test Resident ${TIMESTAMP}\"
}")

RESIDENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)
DEV_OTP=$(echo "$REGISTER_RESPONSE" | jq -r '.data.otp // .otp // empty' 2>/dev/null)

if [ -n "$RESIDENT_ID" ]; then
    echo -e "${GREEN}→ Resident ID: $RESIDENT_ID${NC}"

    if [ -n "$DEV_OTP" ]; then
        echo -e "${GREEN}→ OTP: $DEV_OTP${NC}"

        # Verify OTP
        OTP_RESPONSE=$(call_api "Verify Resident OTP" "POST" "/auth/verify-otp" "{
          \"userId\": \"$RESIDENT_ID\",
          \"otp\": \"$DEV_OTP\"
        }")

        RESIDENT_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
    fi
fi

# Login if no token yet
if [ -z "$RESIDENT_TOKEN" ]; then
    LOGIN_RESPONSE=$(call_api "Login Resident" "POST" "/auth/login" "{
      \"phoneOrEmail\": \"resident${TIMESTAMP}@test.com\",
      \"password\": \"SecurePass123!\"
    }")

    RESIDENT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$RESIDENT_TOKEN" ]; then
    echo -e "${GREEN}→ Resident authenticated successfully${NC}\n"

    # Get Profile
    call_api "Get Resident Profile" "GET" "/users/profile" "" "$RESIDENT_TOKEN" > /dev/null

    # Update Profile
    call_api "Update Resident Profile" "PUT" "/users/profile" "{
      \"firstName\": \"Test\",
      \"lastName\": \"Resident\",
      \"address\": {
        \"flatNumber\": \"101\",
        \"building\": \"Tower A\",
        \"city\": \"Mumbai\",
        \"pincode\": \"400001\"
      }
    }" "$RESIDENT_TOKEN" > /dev/null
fi

# Service endpoints (public)
CATEGORIES_RESPONSE=$(call_api "Get Service Categories" "GET" "/services/categories")

SERVICES_RESPONSE=$(call_api "Browse Services" "GET" "/services?page=1&limit=5")
SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data[0]._id // .services[0]._id // empty' 2>/dev/null)

if [ -n "$SERVICE_ID" ]; then
    echo -e "${GREEN}→ Service ID: $SERVICE_ID${NC}"

    # Get Service Details
    call_api "Get Service Details" "GET" "/services/$SERVICE_ID" > /dev/null
fi

# Authenticated service features
if [ -n "$RESIDENT_TOKEN" ] && [ -n "$SERVICE_ID" ]; then
    # Add to Favorites
    call_api "Add to Favorites" "POST" "/services/favorites" "{
      \"serviceId\": \"$SERVICE_ID\"
    }" "$RESIDENT_TOKEN" > /dev/null

    # Get Favorites
    call_api "Get Favorites" "GET" "/services/user/favorites" "" "$RESIDENT_TOKEN" > /dev/null
fi

# Booking endpoints
if [ -n "$RESIDENT_TOKEN" ] && [ -n "$SERVICE_ID" ]; then
    # Get Available Slots
    call_api "Get Available Slots" "GET" "/bookings/available-slots?serviceId=$SERVICE_ID&date=2025-11-25" "" "$RESIDENT_TOKEN" > /dev/null

    # Create Booking
    BOOKING_RESPONSE=$(call_api "Create Booking" "POST" "/bookings" "{
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

    BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.booking._id // .booking._id // .data._id // ._id // empty' 2>/dev/null)

    if [ -n "$BOOKING_ID" ]; then
        echo -e "${GREEN}→ Booking ID: $BOOKING_ID${NC}"

        # Get My Bookings
        call_api "Get My Bookings" "GET" "/bookings/my-bookings" "" "$RESIDENT_TOKEN" > /dev/null

        # Get Booking Details
        call_api "Get Booking Details" "GET" "/bookings/$BOOKING_ID" "" "$RESIDENT_TOKEN" > /dev/null
    fi
fi

# Notifications
if [ -n "$RESIDENT_TOKEN" ]; then
    call_api "Get Notifications" "GET" "/notifications" "" "$RESIDENT_TOKEN" > /dev/null
fi

#######################################################
# 2. SEVAK COMPLETE FLOW
#######################################################

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  SEVAK FLOW - Complete Journey${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Register Sevak
SEVAK_REG_RESPONSE=$(call_api "Register Sevak" "POST" "/auth/register" "{
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

    # Verify OTP
    SEVAK_OTP_RESPONSE=$(call_api "Verify Sevak OTP" "POST" "/auth/verify-otp" "{
      \"userId\": \"$SEVAK_ID\",
      \"otp\": \"$SEVAK_OTP\"
    }")

    SEVAK_TOKEN=$(echo "$SEVAK_OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

# Login if no token
if [ -z "$SEVAK_TOKEN" ]; then
    SEVAK_LOGIN_RESPONSE=$(call_api "Login Sevak" "POST" "/auth/login" "{
      \"phoneOrEmail\": \"sevak${TIMESTAMP}@test.com\",
      \"password\": \"SecurePass123!\"
    }")

    SEVAK_TOKEN=$(echo "$SEVAK_LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$SEVAK_TOKEN" ]; then
    echo -e "${GREEN}→ Sevak authenticated successfully${NC}\n"

    # Get Profile
    call_api "Get Sevak Profile" "GET" "/users/profile" "" "$SEVAK_TOKEN" > /dev/null

    # Update Profile
    call_api "Update Sevak Profile" "PUT" "/users/profile" "{
      \"firstName\": \"Test\",
      \"lastName\": \"Sevak\",
      \"skills\": [\"Cleaning\", \"Maintenance\"],
      \"experience\": 5
    }" "$SEVAK_TOKEN" > /dev/null

    # Sevak-specific endpoints
    call_api "Get Sevak Jobs" "GET" "/sevak/jobs" "" "$SEVAK_TOKEN" > /dev/null
    call_api "Get Sevak Earnings" "GET" "/sevak/earnings" "" "$SEVAK_TOKEN" > /dev/null
    call_api "Get Sevak Performance" "GET" "/sevak/performance" "" "$SEVAK_TOKEN" > /dev/null
fi

#######################################################
# 3. VENDOR COMPLETE FLOW
#######################################################

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  VENDOR FLOW - Complete Journey${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Register Vendor
VENDOR_REG_RESPONSE=$(call_api "Register Vendor" "POST" "/auth/register" "{
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

    # Verify OTP
    VENDOR_OTP_RESPONSE=$(call_api "Verify Vendor OTP" "POST" "/auth/verify-otp" "{
      \"userId\": \"$VENDOR_ID\",
      \"otp\": \"$VENDOR_OTP\"
    }")

    VENDOR_TOKEN=$(echo "$VENDOR_OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

# Login if no token
if [ -z "$VENDOR_TOKEN" ]; then
    VENDOR_LOGIN_RESPONSE=$(call_api "Login Vendor" "POST" "/auth/login" "{
      \"phoneOrEmail\": \"vendor${TIMESTAMP}@test.com\",
      \"password\": \"SecurePass123!\"
    }")

    VENDOR_TOKEN=$(echo "$VENDOR_LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$VENDOR_TOKEN" ]; then
    echo -e "${GREEN}→ Vendor authenticated successfully${NC}\n"

    # Get Profile
    call_api "Get Vendor Profile" "GET" "/users/profile" "" "$VENDOR_TOKEN" > /dev/null

    # Update Profile
    call_api "Update Vendor Profile" "PUT" "/users/profile" "{
      \"firstName\": \"Test\",
      \"lastName\": \"Vendor\",
      \"businessName\": \"Test Cleaning Services\"
    }" "$VENDOR_TOKEN" > /dev/null
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

if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}\n"
else
    echo -e "Success Rate: ${RED}N/A (No tests run)${NC}\n"
fi

if [ $TESTS_FAILED -eq 0 ] && [ $TESTS_TOTAL -gt 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓✓✓  ALL TESTS PASSED!  ✓✓✓          ║${NC}"
    echo -e "${GREEN}║  API is fully functional               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Some tests failed or no tests run     ║${NC}"
    echo -e "${YELLOW}║  Review output above for details       ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"
    exit 1
fi
