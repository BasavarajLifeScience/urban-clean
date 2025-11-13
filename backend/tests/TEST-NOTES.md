# API Test Suite Notes

## Test Coverage Summary
- **28 API endpoints** tested across 6 major flows
- Tests cover all three user roles: Resident, Sevak, Vendor

## Expected Test Behaviors

### Tests That May Fail (Business Logic Constraints)

1. **Create Rating** - May fail with validation error
   - Requires booking status to be "completed"
   - New bookings are in "pending" status
   - This is correct business logic, not a bug

2. **Get Booking Rating** - May return 404
   - Only exists after a rating is created
   - Depends on Create Rating succeeding

3. **Create Payment Order** - May fail with 500
   - Requires Razorpay API keys to be configured
   - Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env

4. **Get Invoice** - May return 404
   - Invoices only created after successful payment
   - Depends on payment flow completion

5. **Get Sevak Ratings** - May return empty array
   - No ratings exist if no sevaks have been rated yet
   - This is expected for fresh test data

## Fixed Issues (Latest Release)

### ObjectId Comparison Bugs (All Fixed)
- ✅ Get Booking Details authorization
- ✅ Reschedule Booking authorization
- ✅ Cancel Booking authorization
- ✅ Create Rating authorization

### Missing Dependencies (All Fixed)
- ✅ Added mongoose import to rating.controller.js
- ✅ Fixed deprecated ObjectId() constructor syntax

## Current Test Pass Rate

**Target:** 21-24 passing out of 28 (75-85%)

**Failures explained:**
- Rating tests: Require completed booking (business logic)
- Payment tests: Require Razorpay configuration (infrastructure)
- Invoice tests: Require completed payments (data dependency)

## Running Tests

```bash
# Ensure backend is running
docker compose ps

# Restart backend to load latest code
docker compose restart backend

# Wait for backend to be ready
sleep 5

# Run comprehensive test suite
cd backend/tests
./test-all-working.sh
```

## Improving Test Coverage

To get 100% pass rate:

1. **For Rating Tests:**
   - Update booking status to "completed" before creating rating
   - Or create a test helper that completes the booking lifecycle

2. **For Payment Tests:**
   - Configure Razorpay test API keys
   - Or mock the Razorpay service in test environment

3. **For Invoice Tests:**
   - Complete full payment flow first
   - Or create invoice test fixtures
