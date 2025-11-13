#!/bin/bash

#######################################################
# VENDOR COMPLETE FLOW TEST
# Tests all vendor functionality end-to-end
#######################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:5000/api/v1"

# Results tracking
TESTS_PASSED=0
TESTS_FAILED=0

print_test() {
    echo -e "\n${BLUE}TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VENDOR FLOW - Complete Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Global variables
VENDOR_ID=""
VENDOR_TOKEN=""

#######################################################
# TEST 1: REGISTRATION
#######################################################

print_test "1. Register new vendor"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876540003",
    "email": "vendor.complete.test@urbanclean.com",
    "password": "SecurePass123!",
    "role": "vendor",
    "fullName": "Test Vendor Company"
  }')

VENDOR_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)

if [ -n "$VENDOR_ID" ]; then
    print_success "Vendor registered - ID: $VENDOR_ID"
    echo "$REGISTER_RESPONSE" | jq '.'
else
    print_fail "Registration failed"
    echo "$REGISTER_RESPONSE"
fi

#######################################################
# TEST 2: OTP VERIFICATION
#######################################################

if [ -n "$VENDOR_ID" ]; then
    print_test "2. Verify OTP"

    OTP_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-otp" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$VENDOR_ID\",
        \"otp\": \"123456\"
      }")

    TEMP_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

    if [ -n "$TEMP_TOKEN" ]; then
        VENDOR_TOKEN="$TEMP_TOKEN"
        print_success "OTP verified - Token received"
        echo "$OTP_RESPONSE" | jq '.'
    else
        print_fail "OTP verification failed - will try login"
        echo "$OTP_RESPONSE"
    fi
fi

#######################################################
# TEST 3: LOGIN
#######################################################

print_test "3. Login vendor"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "vendor.complete.test@urbanclean.com",
    "password": "SecurePass123!"
  }')

if [ -z "$VENDOR_TOKEN" ]; then
    VENDOR_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$VENDOR_TOKEN" ]; then
    print_success "Login successful"
    echo "$LOGIN_RESPONSE" | jq '.'
else
    print_fail "Login failed"
    echo "$LOGIN_RESPONSE"
    echo -e "\n${RED}Cannot continue without authentication${NC}\n"
    exit 1
fi

#######################################################
# TEST 4: GET PROFILE
#######################################################

print_test "4. Get vendor profile"

PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/users/profile" \
  -H "Authorization: Bearer $VENDOR_TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.data // .profile' > /dev/null 2>&1; then
    print_success "Profile retrieved"
    echo "$PROFILE_RESPONSE" | jq '.'
else
    print_fail "Get profile failed"
    echo "$PROFILE_RESPONSE"
fi

#######################################################
# TEST 5: UPDATE VENDOR PROFILE
#######################################################

print_test "5. Update vendor business profile"

UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Vendor",
    "businessName": "Premium Cleaning Services Pvt Ltd",
    "businessType": "Service Provider",
    "gstNumber": "29ABCDE1234F1Z5",
    "servicesOffered": [
      "Deep Cleaning",
      "Pest Control",
      "Carpet Cleaning",
      "Window Cleaning",
      "Sanitization Services"
    ],
    "address": {
      "street": "123 MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "landmark": "Near City Mall"
    }
  }')

if echo "$UPDATE_PROFILE_RESPONSE" | jq -e '.data // .profile' > /dev/null 2>&1; then
    print_success "Vendor business profile updated"
    echo "$UPDATE_PROFILE_RESPONSE" | jq '.'
else
    print_fail "Profile update failed"
    echo "$UPDATE_PROFILE_RESPONSE"
fi

#######################################################
# TEST 6: GET UPDATED PROFILE
#######################################################

print_test "6. Verify profile update"

VERIFY_PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/users/profile" \
  -H "Authorization: Bearer $VENDOR_TOKEN")

if echo "$VERIFY_PROFILE_RESPONSE" | jq -e '.data.profile.businessName // .profile.businessName' > /dev/null 2>&1; then
    print_success "Profile verified - Business details saved"
    echo "$VERIFY_PROFILE_RESPONSE" | jq '.'
else
    print_fail "Profile verification failed"
    echo "$VERIFY_PROFILE_RESPONSE"
fi

#######################################################
# TEST 7: GET NOTIFICATIONS
#######################################################

print_test "7. Get vendor notifications"

NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $VENDOR_TOKEN")

if echo "$NOTIFICATIONS_RESPONSE" | jq -e '.data // .notifications' > /dev/null 2>&1; then
    print_success "Notifications retrieved"
    echo "$NOTIFICATIONS_RESPONSE" | jq '.'
else
    print_fail "Get notifications failed"
    echo "$NOTIFICATIONS_RESPONSE"
fi

#######################################################
# SUMMARY
#######################################################

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}VENDOR FLOW TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total Tests: $TOTAL\n"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}\n"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Review output above.${NC}\n"
    exit 1
fi
