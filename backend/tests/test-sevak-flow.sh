#!/bin/bash

#######################################################
# SEVAK COMPLETE FLOW TEST
# Tests all sevak functionality end-to-end
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
echo -e "${BLUE}SEVAK FLOW - Complete Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Global variables
SEVAK_ID=""
SEVAK_TOKEN=""
JOB_ID=""

#######################################################
# TEST 1: REGISTRATION
#######################################################

print_test "1. Register new sevak"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876540002",
    "email": "sevak.complete.test@urbanclean.com",
    "password": "SecurePass123!",
    "role": "sevak",
    "fullName": "Complete Test Sevak"
  }')

SEVAK_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty' 2>/dev/null)

if [ -n "$SEVAK_ID" ]; then
    print_success "Sevak registered - ID: $SEVAK_ID"
    echo "$REGISTER_RESPONSE" | jq '.'
else
    print_fail "Registration failed"
    echo "$REGISTER_RESPONSE"
fi

#######################################################
# TEST 2: OTP VERIFICATION
#######################################################

if [ -n "$SEVAK_ID" ]; then
    print_test "2. Verify OTP"

    OTP_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-otp" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$SEVAK_ID\",
        \"otp\": \"123456\"
      }")

    TEMP_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

    if [ -n "$TEMP_TOKEN" ]; then
        SEVAK_TOKEN="$TEMP_TOKEN"
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

print_test "3. Login sevak"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "sevak.complete.test@urbanclean.com",
    "password": "SecurePass123!"
  }')

if [ -z "$SEVAK_TOKEN" ]; then
    SEVAK_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -n "$SEVAK_TOKEN" ]; then
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

print_test "4. Get sevak profile"

PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/users/profile" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.data // .profile' > /dev/null 2>&1; then
    print_success "Profile retrieved"
    echo "$PROFILE_RESPONSE" | jq '.'
else
    print_fail "Get profile failed"
    echo "$PROFILE_RESPONSE"
fi

#######################################################
# TEST 5: UPDATE SEVAK PROFILE
#######################################################

print_test "5. Update sevak profile with skills"

UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
  -H "Authorization: Bearer $SEVAK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Sevak",
    "skills": ["Cleaning", "Maintenance", "Plumbing", "Electrical"],
    "experience": 5,
    "bio": "Experienced service professional with 5+ years in cleaning and maintenance",
    "availability": {
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "timeSlots": ["09:00-12:00", "14:00-18:00", "18:00-21:00"]
    },
    "address": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }')

if echo "$UPDATE_PROFILE_RESPONSE" | jq -e '.data // .profile' > /dev/null 2>&1; then
    print_success "Sevak profile updated with skills and availability"
    echo "$UPDATE_PROFILE_RESPONSE" | jq '.'
else
    print_fail "Profile update failed"
    echo "$UPDATE_PROFILE_RESPONSE"
fi

#######################################################
# TEST 6: GET ASSIGNED JOBS
#######################################################

print_test "6. Get assigned jobs"

JOBS_RESPONSE=$(curl -s -X GET "$API_URL/sevak/jobs" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

JOB_ID=$(echo "$JOBS_RESPONSE" | jq -r '.data.jobs[0]._id // .jobs[0]._id // empty' 2>/dev/null)

if echo "$JOBS_RESPONSE" | jq -e '.data // .jobs' > /dev/null 2>&1; then
    print_success "Jobs retrieved"
    echo "$JOBS_RESPONSE" | jq '.'
    if [ -n "$JOB_ID" ]; then
        echo -e "${YELLOW}Found job ID: $JOB_ID${NC}"
    else
        echo -e "${YELLOW}No jobs assigned yet${NC}"
    fi
else
    print_fail "Get jobs failed"
    echo "$JOBS_RESPONSE"
fi

#######################################################
# TEST 7: GET JOB DETAILS
#######################################################

if [ -n "$JOB_ID" ]; then
    print_test "7. Get job details"

    JOB_DETAIL_RESPONSE=$(curl -s -X GET "$API_URL/sevak/jobs/$JOB_ID" \
      -H "Authorization: Bearer $SEVAK_TOKEN")

    if echo "$JOB_DETAIL_RESPONSE" | jq -e '.data // .job' > /dev/null 2>&1; then
        print_success "Job details retrieved"
        echo "$JOB_DETAIL_RESPONSE" | jq '.'
    else
        print_fail "Get job details failed"
        echo "$JOB_DETAIL_RESPONSE"
    fi
fi

#######################################################
# TEST 8: CHECK-IN TO JOB
#######################################################

if [ -n "$JOB_ID" ]; then
    print_test "8. Check-in to job"

    CHECKIN_RESPONSE=$(curl -s -X POST "$API_URL/sevak/check-in" \
      -H "Authorization: Bearer $SEVAK_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bookingId\": \"$JOB_ID\",
        \"otp\": \"123456\",
        \"location\": {
          \"latitude\": 19.0760,
          \"longitude\": 72.8777
        }
      }")

    if echo "$CHECKIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        print_success "Checked in successfully"
        echo "$CHECKIN_RESPONSE" | jq '.'
    else
        print_fail "Check-in failed (expected if no OTP available)"
        echo "$CHECKIN_RESPONSE"
    fi
fi

#######################################################
# TEST 9: CHECK-OUT FROM JOB
#######################################################

if [ -n "$JOB_ID" ]; then
    print_test "9. Check-out from job"

    CHECKOUT_RESPONSE=$(curl -s -X POST "$API_URL/sevak/check-out" \
      -H "Authorization: Bearer $SEVAK_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bookingId\": \"$JOB_ID\",
        \"location\": {
          \"latitude\": 19.0760,
          \"longitude\": 72.8777
        }
      }")

    if echo "$CHECKOUT_RESPONSE" | jq -e '.success // .data' > /dev/null 2>&1; then
        print_success "Checked out successfully"
        echo "$CHECKOUT_RESPONSE" | jq '.'
    else
        print_fail "Check-out failed (expected if not checked in)"
        echo "$CHECKOUT_RESPONSE"
    fi
fi

#######################################################
# TEST 10: GET ATTENDANCE HISTORY
#######################################################

print_test "10. Get attendance history"

ATTENDANCE_RESPONSE=$(curl -s -X GET "$API_URL/sevak/attendance?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

if echo "$ATTENDANCE_RESPONSE" | jq -e '.data // .attendance' > /dev/null 2>&1; then
    print_success "Attendance history retrieved"
    echo "$ATTENDANCE_RESPONSE" | jq '.'
else
    print_fail "Get attendance failed"
    echo "$ATTENDANCE_RESPONSE"
fi

#######################################################
# TEST 11: GET EARNINGS
#######################################################

print_test "11. Get earnings summary"

EARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/sevak/earnings?period=monthly" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

if echo "$EARNINGS_RESPONSE" | jq -e '.data // .earnings' > /dev/null 2>&1; then
    print_success "Earnings retrieved"
    echo "$EARNINGS_RESPONSE" | jq '.'
else
    print_fail "Get earnings failed"
    echo "$EARNINGS_RESPONSE"
fi

#######################################################
# TEST 12: GET EARNINGS DETAILS
#######################################################

print_test "12. Get detailed earnings"

EARNINGS_DETAIL_RESPONSE=$(curl -s -X GET "$API_URL/sevak/earnings/details" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

if echo "$EARNINGS_DETAIL_RESPONSE" | jq -e '.data // .earnings' > /dev/null 2>&1; then
    print_success "Detailed earnings retrieved"
    echo "$EARNINGS_DETAIL_RESPONSE" | jq '.'
else
    print_fail "Get earnings details failed"
    echo "$EARNINGS_DETAIL_RESPONSE"
fi

#######################################################
# TEST 13: GET PERFORMANCE METRICS
#######################################################

print_test "13. Get performance metrics"

PERFORMANCE_RESPONSE=$(curl -s -X GET "$API_URL/sevak/performance" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

if echo "$PERFORMANCE_RESPONSE" | jq -e '.data // .performance' > /dev/null 2>&1; then
    print_success "Performance metrics retrieved"
    echo "$PERFORMANCE_RESPONSE" | jq '.'
else
    print_fail "Get performance failed"
    echo "$PERFORMANCE_RESPONSE"
fi

#######################################################
# TEST 14: GET FEEDBACK/RATINGS
#######################################################

print_test "14. Get feedback and ratings"

FEEDBACK_RESPONSE=$(curl -s -X GET "$API_URL/sevak/feedback" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

if echo "$FEEDBACK_RESPONSE" | jq -e '.data // .feedback' > /dev/null 2>&1; then
    print_success "Feedback retrieved"
    echo "$FEEDBACK_RESPONSE" | jq '.'
else
    print_fail "Get feedback failed"
    echo "$FEEDBACK_RESPONSE"
fi

#######################################################
# SUMMARY
#######################################################

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}SEVAK FLOW TEST SUMMARY${NC}"
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
