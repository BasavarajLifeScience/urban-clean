#!/bin/bash

#######################################################
# RESIDENT COMPLETE FLOW TEST
# Tests all resident functionality end-to-end
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
echo -e "${BLUE}RESIDENT FLOW - Complete Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Global variables
RESIDENT_ID=""
RESIDENT_TOKEN=""
SERVICE_ID=""
BOOKING_ID=""
PAYMENT_ORDER_ID=""
RATING_ID=""

#######################################################
# TEST 1: REGISTRATION
#######################################################

print_test "1. Register new resident"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876540001",
    "email": "resident.complete.test@urbanclean.com",
    "password": "SecurePass123!",
    "role": "resident",
    "fullName": "Complete Test Resident"
  }')

RESIDENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)

if [ -n "$RESIDENT_ID" ]; then
    print_success "Resident registered - ID: $RESIDENT_ID"
    echo "$REGISTER_RESPONSE" | jq '.'
else
    print_fail "Registration failed"
    echo "$REGISTER_RESPONSE"
fi

#######################################################
# TEST 2: OTP VERIFICATION
#######################################################

if [ -n "$RESIDENT_ID" ]; then
    print_test "2. Verify OTP"

    OTP_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-otp" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$RESIDENT_ID\",
        \"otp\": \"123456\"
      }")

    TEMP_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

    if [ -n "$TEMP_TOKEN" ]; then
        RESIDENT_TOKEN="$TEMP_TOKEN"
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

print_test "3. Login resident"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "resident.complete.test@urbanclean.com",
    "password": "SecurePass123!"
  }')

if [ -z "$RESIDENT_TOKEN" ]; then
    RESIDENT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$RESIDENT_TOKEN" ]; then
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

print_test "4. Get user profile"

PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/users/profile" \
  -H "Authorization: Bearer $RESIDENT_TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.data // .profile' > /dev/null 2>&1; then
    print_success "Profile retrieved"
    echo "$PROFILE_RESPONSE" | jq '.'
else
    print_fail "Get profile failed"
    echo "$PROFILE_RESPONSE"
fi

#######################################################
# TEST 5: UPDATE PROFILE
#######################################################

print_test "5. Update profile with address"

UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Complete",
    "lastName": "Test",
    "address": {
      "flatNumber": "B-202",
      "building": "Tower B",
      "society": "Test Society",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "phoneNumber": "+919999999999",
      "relationship": "Spouse"
    }
  }')

if echo "$UPDATE_PROFILE_RESPONSE" | jq -e '.data // .profile' > /dev/null 2>&1; then
    print_success "Profile updated"
    echo "$UPDATE_PROFILE_RESPONSE" | jq '.'
else
    print_fail "Profile update failed"
    echo "$UPDATE_PROFILE_RESPONSE"
fi

#######################################################
# TEST 6: GET SERVICE CATEGORIES
#######################################################

print_test "6. Get service categories"

CATEGORIES_RESPONSE=$(curl -s -X GET "$API_URL/services/categories")

if echo "$CATEGORIES_RESPONSE" | jq -e '.data.categories // .categories' > /dev/null 2>&1; then
    print_success "Categories retrieved"
    echo "$CATEGORIES_RESPONSE" | jq '.'
else
    print_fail "Get categories failed"
    echo "$CATEGORIES_RESPONSE"
fi

#######################################################
# TEST 7: BROWSE SERVICES
#######################################################

print_test "7. Browse all services"

SERVICES_RESPONSE=$(curl -s -X GET "$API_URL/services?page=1&limit=10")

SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data.services[0]._id // .services[0]._id // empty' 2>/dev/null)

if [ -n "$SERVICE_ID" ]; then
    print_success "Services retrieved - Selected Service ID: $SERVICE_ID"
    echo "$SERVICES_RESPONSE" | jq '.'
else
    print_fail "No services found - Run: npm run seed"
    echo "$SERVICES_RESPONSE"
fi

#######################################################
# TEST 8: GET SERVICE DETAILS
#######################################################

if [ -n "$SERVICE_ID" ]; then
    print_test "8. Get service details"

    SERVICE_DETAIL_RESPONSE=$(curl -s -X GET "$API_URL/services/$SERVICE_ID")

    if echo "$SERVICE_DETAIL_RESPONSE" | jq -e '.data.service // .service' > /dev/null 2>&1; then
        print_success "Service details retrieved"
        echo "$SERVICE_DETAIL_RESPONSE" | jq '.'
    else
        print_fail "Get service details failed"
        echo "$SERVICE_DETAIL_RESPONSE"
    fi
fi

#######################################################
# TEST 9: ADD TO FAVORITES
#######################################################

if [ -n "$SERVICE_ID" ]; then
    print_test "9. Add service to favorites"

    ADD_FAV_RESPONSE=$(curl -s -X POST "$API_URL/services/favorites" \
      -H "Authorization: Bearer $RESIDENT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"serviceId\": \"$SERVICE_ID\"}")

    if echo "$ADD_FAV_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        print_success "Added to favorites"
        echo "$ADD_FAV_RESPONSE" | jq '.'
    else
        print_fail "Add to favorites failed"
        echo "$ADD_FAV_RESPONSE"
    fi
fi

#######################################################
# TEST 10: GET FAVORITES
#######################################################

print_test "10. Get favorites list"

FAVORITES_RESPONSE=$(curl -s -X GET "$API_URL/services/favorites" \
  -H "Authorization: Bearer $RESIDENT_TOKEN")

if echo "$FAVORITES_RESPONSE" | jq -e '.data // .favorites' > /dev/null 2>&1; then
    print_success "Favorites retrieved"
    echo "$FAVORITES_RESPONSE" | jq '.'
else
    print_fail "Get favorites failed"
    echo "$FAVORITES_RESPONSE"
fi

#######################################################
# TEST 11: GET AVAILABLE SLOTS
#######################################################

if [ -n "$SERVICE_ID" ]; then
    print_test "11. Get available time slots"

    SLOTS_RESPONSE=$(curl -s -X GET "$API_URL/bookings/available-slots?serviceId=$SERVICE_ID&date=2025-11-25")

    if echo "$SLOTS_RESPONSE" | jq -e '.data // .availableSlots' > /dev/null 2>&1; then
        print_success "Available slots retrieved"
        echo "$SLOTS_RESPONSE" | jq '.'
    else
        print_fail "Get slots failed"
        echo "$SLOTS_RESPONSE"
    fi
fi

#######################################################
# TEST 12: CREATE BOOKING
#######################################################

if [ -n "$SERVICE_ID" ]; then
    print_test "12. Create booking"

    BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
      -H "Authorization: Bearer $RESIDENT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"serviceId\": \"$SERVICE_ID\",
        \"scheduledDate\": \"2025-11-25\",
        \"scheduledTime\": \"10:00 AM\",
        \"address\": {
          \"flatNumber\": \"B-202\",
          \"building\": \"Tower B\",
          \"society\": \"Test Society\",
          \"city\": \"Mumbai\",
          \"pincode\": \"400001\"
        },
        \"specialInstructions\": \"Please call before arriving\"
      }")

    BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.booking._id // .booking._id // empty' 2>/dev/null)

    if [ -n "$BOOKING_ID" ]; then
        print_success "Booking created - ID: $BOOKING_ID"
        echo "$BOOKING_RESPONSE" | jq '.'
    else
        print_fail "Booking creation failed"
        echo "$BOOKING_RESPONSE"
    fi
fi

#######################################################
# TEST 13: GET MY BOOKINGS
#######################################################

print_test "13. Get my bookings"

MY_BOOKINGS_RESPONSE=$(curl -s -X GET "$API_URL/bookings/my-bookings" \
  -H "Authorization: Bearer $RESIDENT_TOKEN")

if echo "$MY_BOOKINGS_RESPONSE" | jq -e '.data.bookings // .bookings' > /dev/null 2>&1; then
    print_success "Bookings retrieved"
    echo "$MY_BOOKINGS_RESPONSE" | jq '.'
else
    print_fail "Get bookings failed"
    echo "$MY_BOOKINGS_RESPONSE"
fi

#######################################################
# TEST 14: GET BOOKING DETAILS
#######################################################

if [ -n "$BOOKING_ID" ]; then
    print_test "14. Get booking details"

    BOOKING_DETAIL_RESPONSE=$(curl -s -X GET "$API_URL/bookings/$BOOKING_ID" \
      -H "Authorization: Bearer $RESIDENT_TOKEN")

    if echo "$BOOKING_DETAIL_RESPONSE" | jq -e '.data.booking // .booking' > /dev/null 2>&1; then
        print_success "Booking details retrieved"
        echo "$BOOKING_DETAIL_RESPONSE" | jq '.'
    else
        print_fail "Get booking details failed"
        echo "$BOOKING_DETAIL_RESPONSE"
    fi
fi

#######################################################
# TEST 15: CREATE PAYMENT ORDER
#######################################################

if [ -n "$BOOKING_ID" ]; then
    print_test "15. Create payment order"

    PAYMENT_ORDER_RESPONSE=$(curl -s -X POST "$API_URL/payments/create-order" \
      -H "Authorization: Bearer $RESIDENT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bookingId\": \"$BOOKING_ID\",
        \"amount\": 500
      }")

    PAYMENT_ORDER_ID=$(echo "$PAYMENT_ORDER_RESPONSE" | jq -r '.data.razorpayOrderId // .razorpayOrderId // empty' 2>/dev/null)

    if [ -n "$PAYMENT_ORDER_ID" ]; then
        print_success "Payment order created - ID: $PAYMENT_ORDER_ID"
        echo "$PAYMENT_ORDER_RESPONSE" | jq '.'
    else
        print_fail "Payment order creation failed"
        echo "$PAYMENT_ORDER_RESPONSE"
    fi
fi

#######################################################
# TEST 16: GET PAYMENT HISTORY
#######################################################

print_test "16. Get payment history"

PAYMENT_HISTORY_RESPONSE=$(curl -s -X GET "$API_URL/payments/history" \
  -H "Authorization: Bearer $RESIDENT_TOKEN")

if echo "$PAYMENT_HISTORY_RESPONSE" | jq -e '.data // .payments' > /dev/null 2>&1; then
    print_success "Payment history retrieved"
    echo "$PAYMENT_HISTORY_RESPONSE" | jq '.'
else
    print_fail "Get payment history failed"
    echo "$PAYMENT_HISTORY_RESPONSE"
fi

#######################################################
# TEST 17: GET NOTIFICATIONS
#######################################################

print_test "17. Get notifications"

NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $RESIDENT_TOKEN")

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
echo -e "${BLUE}RESIDENT FLOW TEST SUMMARY${NC}"
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
