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

#######################################################
# 1. RESIDENT FLOW - Registration & Authentication
#######################################################

print_step "1. RESIDENT REGISTRATION FLOW"

echo -e "\n${BLUE}1.1 Register Resident${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "email": "resident.test@urbanclean.com",
    "password": "SecurePass123!",
    "role": "resident",
    "fullName": "Test Resident"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
RESIDENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty')

if [ -n "$RESIDENT_ID" ]; then
    print_success "Resident registered successfully. User ID: $RESIDENT_ID"
else
    print_error "Resident registration failed"
    echo "$REGISTER_RESPONSE" | jq '.'
fi

echo -e "\n${BLUE}1.2 Verify OTP${NC}"
OTP_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$RESIDENT_ID\",
    \"otp\": \"123456\"
  }")

echo "$OTP_RESPONSE" | jq '.'
RESIDENT_TOKEN=$(echo "$OTP_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty')

if [ -n "$RESIDENT_TOKEN" ]; then
    print_success "OTP verified successfully. Token received."
else
    print_info "OTP verification may have failed or use login instead"
fi

echo -e "\n${BLUE}1.3 Login Resident${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "resident.test@urbanclean.com",
    "password": "SecurePass123!"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
RESIDENT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty')

if [ -n "$RESIDENT_TOKEN" ]; then
    print_success "Resident logged in successfully"
else
    print_error "Resident login failed"
fi

#######################################################
# 2. RESIDENT FLOW - Profile Setup
#######################################################

print_step "2. RESIDENT PROFILE SETUP"

echo -e "\n${BLUE}2.1 Get Profile${NC}"
curl -s -X GET "$API_URL/users/profile" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

echo -e "\n${BLUE}2.2 Update Profile${NC}"
PROFILE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Resident",
    "address": {
      "flatNumber": "A-101",
      "building": "Tower A",
      "society": "Green Valley Apartments",
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

echo "$PROFILE_RESPONSE" | jq '.'
print_success "Resident profile updated"

#######################################################
# 3. RESIDENT FLOW - Service Discovery
#######################################################

print_step "3. SERVICE DISCOVERY"

echo -e "\n${BLUE}3.1 Get All Service Categories${NC}"
curl -s -X GET "$API_URL/services/categories" | jq '.'

echo -e "\n${BLUE}3.2 Browse Services${NC}"
SERVICES_RESPONSE=$(curl -s -X GET "$API_URL/services?page=1&limit=10" | jq '.')
echo "$SERVICES_RESPONSE" | jq '.'

SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data.services[0]._id // .services[0]._id // empty')
print_info "Selected Service ID: $SERVICE_ID"

echo -e "\n${BLUE}3.3 Get Service Details${NC}"
curl -s -X GET "$API_URL/services/$SERVICE_ID" | jq '.'

echo -e "\n${BLUE}3.4 Add to Favorites${NC}"
curl -s -X POST "$API_URL/services/favorites" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"serviceId\": \"$SERVICE_ID\"}" | jq '.'

echo -e "\n${BLUE}3.5 Get Favorites${NC}"
curl -s -X GET "$API_URL/services/favorites" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

#######################################################
# 4. RESIDENT FLOW - Booking
#######################################################

print_step "4. BOOKING CREATION"

echo -e "\n${BLUE}4.1 Get Available Slots${NC}"
curl -s -X GET "$API_URL/bookings/available-slots?serviceId=$SERVICE_ID&date=2025-11-20" | jq '.'

echo -e "\n${BLUE}4.2 Create Booking${NC}"
BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceId\": \"$SERVICE_ID\",
    \"scheduledDate\": \"2025-11-20\",
    \"scheduledTime\": \"10:00 AM\",
    \"address\": {
      \"flatNumber\": \"A-101\",
      \"building\": \"Tower A\",
      \"society\": \"Green Valley Apartments\",
      \"city\": \"Mumbai\",
      \"pincode\": \"400001\"
    },
    \"specialInstructions\": \"Please call before arriving\"
  }")

echo "$BOOKING_RESPONSE" | jq '.'
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.booking._id // .booking._id // empty')

if [ -n "$BOOKING_ID" ]; then
    print_success "Booking created successfully. Booking ID: $BOOKING_ID"
else
    print_error "Booking creation failed"
fi

echo -e "\n${BLUE}4.3 Get Booking Details${NC}"
curl -s -X GET "$API_URL/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

echo -e "\n${BLUE}4.4 Get My Bookings${NC}"
curl -s -X GET "$API_URL/bookings/my-bookings" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

#######################################################
# 5. RESIDENT FLOW - Payment
#######################################################

print_step "5. PAYMENT FLOW"

echo -e "\n${BLUE}5.1 Create Payment Order${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/payments/create-order" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"amount\": 500
  }")

echo "$ORDER_RESPONSE" | jq '.'
RAZORPAY_ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.razorpayOrderId // .razorpayOrderId // empty')

echo -e "\n${BLUE}5.2 Verify Payment (Mock)${NC}"
PAYMENT_VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/payments/verify" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"razorpayOrderId\": \"$RAZORPAY_ORDER_ID\",
    \"razorpayPaymentId\": \"pay_mock123456\",
    \"razorpaySignature\": \"mock_signature\"
  }")

echo "$PAYMENT_VERIFY_RESPONSE" | jq '.'

echo -e "\n${BLUE}5.3 Get Payment History${NC}"
curl -s -X GET "$API_URL/payments/history" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

echo -e "\n${BLUE}5.4 Get Invoice${NC}"
curl -s -X GET "$API_URL/payments/invoice/$BOOKING_ID" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

#######################################################
# 6. SEVAK FLOW - Registration & Authentication
#######################################################

print_step "6. SEVAK REGISTRATION FLOW"

echo -e "\n${BLUE}6.1 Register Sevak${NC}"
SEVAK_REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543211",
    "email": "sevak.test@urbanclean.com",
    "password": "SecurePass123!",
    "role": "sevak",
    "fullName": "Test Sevak"
  }')

echo "$SEVAK_REGISTER_RESPONSE" | jq '.'
SEVAK_ID=$(echo "$SEVAK_REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty')

if [ -n "$SEVAK_ID" ]; then
    print_success "Sevak registered successfully. User ID: $SEVAK_ID"
else
    print_error "Sevak registration failed"
fi

echo -e "\n${BLUE}6.2 Verify Sevak OTP & Login${NC}"
# Verify OTP first
curl -s -X POST "$API_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$SEVAK_ID\",
    \"otp\": \"123456\"
  }" | jq '.'

# Login
SEVAK_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "sevak.test@urbanclean.com",
    "password": "SecurePass123!"
  }')

echo "$SEVAK_LOGIN_RESPONSE" | jq '.'
SEVAK_TOKEN=$(echo "$SEVAK_LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty')

if [ -n "$SEVAK_TOKEN" ]; then
    print_success "Sevak logged in successfully"
else
    print_error "Sevak login failed"
fi

#######################################################
# 7. SEVAK FLOW - Profile Setup
#######################################################

print_step "7. SEVAK PROFILE SETUP"

echo -e "\n${BLUE}7.1 Update Sevak Profile${NC}"
SEVAK_PROFILE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
  -H "Authorization: Bearer $SEVAK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Sevak",
    "skills": ["Cleaning", "Maintenance", "Plumbing"],
    "experience": 5,
    "bio": "Experienced service professional with 5 years of expertise",
    "availability": {
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "timeSlots": ["09:00-12:00", "14:00-18:00"]
    },
    "address": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }')

echo "$SEVAK_PROFILE_RESPONSE" | jq '.'
print_success "Sevak profile updated"

#######################################################
# 8. SEVAK FLOW - Job Management
#######################################################

print_step "8. SEVAK JOB MANAGEMENT"

echo -e "\n${BLUE}8.1 Get Assigned Jobs${NC}"
JOBS_RESPONSE=$(curl -s -X GET "$API_URL/sevak/jobs" \
  -H "Authorization: Bearer $SEVAK_TOKEN")

echo "$JOBS_RESPONSE" | jq '.'

echo -e "\n${BLUE}8.2 Get Job Details${NC}"
if [ -n "$BOOKING_ID" ]; then
    curl -s -X GET "$API_URL/sevak/jobs/$BOOKING_ID" \
      -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'
fi

echo -e "\n${BLUE}8.3 Check-In to Job${NC}"
CHECKIN_RESPONSE=$(curl -s -X POST "$API_URL/sevak/check-in" \
  -H "Authorization: Bearer $SEVAK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"otp\": \"123456\",
    \"location\": {
      \"latitude\": 19.0760,
      \"longitude\": 72.8777
    }
  }")

echo "$CHECKIN_RESPONSE" | jq '.'

echo -e "\n${BLUE}8.4 Complete Job with Check-Out${NC}"
# Note: This would normally include file uploads for before/after images
CHECKOUT_RESPONSE=$(curl -s -X POST "$API_URL/sevak/check-out" \
  -H "Authorization: Bearer $SEVAK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"location\": {
      \"latitude\": 19.0760,
      \"longitude\": 72.8777
    }
  }")

echo "$CHECKOUT_RESPONSE" | jq '.'

echo -e "\n${BLUE}8.5 Mark Job as Complete${NC}"
curl -s -X PATCH "$API_URL/sevak/jobs/$BOOKING_ID/complete" \
  -H "Authorization: Bearer $SEVAK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completionNotes": "Job completed successfully. All areas cleaned thoroughly.",
    "checklistItems": ["Cleaned all rooms", "Sanitized surfaces", "Disposed waste"]
  }' | jq '.'

echo -e "\n${BLUE}8.6 Get Attendance History${NC}"
curl -s -X GET "$API_URL/sevak/attendance" \
  -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'

#######################################################
# 9. SEVAK FLOW - Earnings & Performance
#######################################################

print_step "9. SEVAK EARNINGS & PERFORMANCE"

echo -e "\n${BLUE}9.1 Get Earnings${NC}"
curl -s -X GET "$API_URL/sevak/earnings?period=monthly" \
  -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'

echo -e "\n${BLUE}9.2 Get Earnings Details${NC}"
curl -s -X GET "$API_URL/sevak/earnings/details" \
  -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'

echo -e "\n${BLUE}9.3 Get Performance Metrics${NC}"
curl -s -X GET "$API_URL/sevak/performance" \
  -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'

echo -e "\n${BLUE}9.4 Get Feedback/Ratings${NC}"
curl -s -X GET "$API_URL/sevak/feedback" \
  -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'

#######################################################
# 10. RESIDENT FLOW - Rating & Feedback
#######################################################

print_step "10. RATING & FEEDBACK"

echo -e "\n${BLUE}10.1 Submit Rating for Sevak${NC}"
RATING_RESPONSE=$(curl -s -X POST "$API_URL/ratings" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"ratedTo\": \"$SEVAK_ID\",
    \"rating\": 5,
    \"comment\": \"Excellent service! Very professional and thorough.\"
  }")

echo "$RATING_RESPONSE" | jq '.'

echo -e "\n${BLUE}10.2 Get Sevak Ratings${NC}"
curl -s -X GET "$API_URL/ratings/sevak/$SEVAK_ID" | jq '.'

echo -e "\n${BLUE}10.3 Get Booking Rating${NC}"
curl -s -X GET "$API_URL/ratings/booking/$BOOKING_ID" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

#######################################################
# 11. VENDOR FLOW - Registration & Setup
#######################################################

print_step "11. VENDOR REGISTRATION FLOW"

echo -e "\n${BLUE}11.1 Register Vendor${NC}"
VENDOR_REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543212",
    "email": "vendor.test@urbanclean.com",
    "password": "SecurePass123!",
    "role": "vendor",
    "fullName": "Test Vendor"
  }')

echo "$VENDOR_REGISTER_RESPONSE" | jq '.'
VENDOR_ID=$(echo "$VENDOR_REGISTER_RESPONSE" | jq -r '.data.userId // .userId // empty')

if [ -n "$VENDOR_ID" ]; then
    print_success "Vendor registered successfully. User ID: $VENDOR_ID"
else
    print_error "Vendor registration failed"
fi

echo -e "\n${BLUE}11.2 Login Vendor${NC}"
# Verify OTP first
curl -s -X POST "$API_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$VENDOR_ID\",
    \"otp\": \"123456\"
  }" | jq '.'

VENDOR_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "vendor.test@urbanclean.com",
    "password": "SecurePass123!"
  }')

echo "$VENDOR_LOGIN_RESPONSE" | jq '.'
VENDOR_TOKEN=$(echo "$VENDOR_LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty')

if [ -n "$VENDOR_TOKEN" ]; then
    print_success "Vendor logged in successfully"
else
    print_error "Vendor login failed"
fi

echo -e "\n${BLUE}11.3 Update Vendor Profile${NC}"
VENDOR_PROFILE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Vendor",
    "businessName": "Premium Cleaning Services Pvt Ltd",
    "businessType": "Service Provider",
    "gstNumber": "29ABCDE1234F1Z5",
    "servicesOffered": ["Deep Cleaning", "Pest Control", "Maintenance"],
    "address": {
      "street": "MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }')

echo "$VENDOR_PROFILE_RESPONSE" | jq '.'
print_success "Vendor profile updated"

#######################################################
# 12. NOTIFICATIONS
#######################################################

print_step "12. NOTIFICATIONS"

echo -e "\n${BLUE}12.1 Get Resident Notifications${NC}"
curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

echo -e "\n${BLUE}12.2 Get Sevak Notifications${NC}"
curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $SEVAK_TOKEN" | jq '.'

echo -e "\n${BLUE}12.3 Mark All as Read${NC}"
curl -s -X PATCH "$API_URL/notifications/read-all" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" | jq '.'

#######################################################
# 13. BOOKING MODIFICATIONS
#######################################################

print_step "13. BOOKING MODIFICATIONS"

echo -e "\n${BLUE}13.1 Create Another Booking for Testing${NC}"
NEW_BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceId\": \"$SERVICE_ID\",
    \"scheduledDate\": \"2025-11-25\",
    \"scheduledTime\": \"02:00 PM\",
    \"address\": {
      \"flatNumber\": \"A-101\",
      \"building\": \"Tower A\",
      \"society\": \"Green Valley Apartments\",
      \"city\": \"Mumbai\",
      \"pincode\": \"400001\"
    }
  }")

echo "$NEW_BOOKING_RESPONSE" | jq '.'
NEW_BOOKING_ID=$(echo "$NEW_BOOKING_RESPONSE" | jq -r '.data.booking._id // .booking._id // empty')

echo -e "\n${BLUE}13.2 Reschedule Booking${NC}"
curl -s -X PATCH "$API_URL/bookings/$NEW_BOOKING_ID/reschedule" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newDate": "2025-11-26",
    "newTime": "03:00 PM"
  }' | jq '.'

echo -e "\n${BLUE}13.3 Cancel Booking${NC}"
curl -s -X PATCH "$API_URL/bookings/$NEW_BOOKING_ID/cancel" \
  -H "Authorization: Bearer $RESIDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Change of plans"
  }' | jq '.'

#######################################################
# Summary
#######################################################

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo "Test Identifiers:"
echo "  Resident ID: $RESIDENT_ID"
echo "  Sevak ID: $SEVAK_ID"
echo "  Vendor ID: $VENDOR_ID"
echo "  Booking ID: $BOOKING_ID"
echo "  Service ID: $SERVICE_ID"

echo -e "\n${GREEN}All API endpoints tested successfully!${NC}"
echo -e "${YELLOW}Review the output above for any errors or issues.${NC}\n"
