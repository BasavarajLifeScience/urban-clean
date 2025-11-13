## Urban Clean - Comprehensive API Testing Suite

Complete end-to-end testing for all three user roles with role-based authentication and workflows.

## 📋 Test Suites

### 1. Resident Flow Test (`test-resident-flow.sh`)
Tests all resident functionality:
- ✅ Registration & Authentication
- ✅ Profile Management
- ✅ Service Discovery & Search
- ✅ Favorites Management
- ✅ Booking Creation & Management
- ✅ Payment Processing
- ✅ Notifications

**Total Tests**: 17 comprehensive tests

### 2. Sevak Flow Test (`test-sevak-flow.sh`)
Tests all sevak functionality:
- ✅ Registration & Authentication
- ✅ Profile Setup with Skills
- ✅ Job Assignment & Management
- ✅ Check-in/Check-out System
- ✅ Attendance Tracking
- ✅ Earnings & Performance Metrics
- ✅ Feedback & Ratings

**Total Tests**: 14 comprehensive tests

### 3. Vendor Flow Test (`test-vendor-flow.sh`)
Tests all vendor functionality:
- ✅ Registration & Authentication
- ✅ Business Profile Setup
- ✅ GST & Business Details
- ✅ Services Offered Management
- ✅ Notifications

**Total Tests**: 7 comprehensive tests

## 🚀 Quick Start

### Prerequisites

1. **Backend server running**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **MongoDB connected and seeded**:
   ```bash
   cd backend
   npm run seed
   ```

### Running Tests

#### Run All Tests (Recommended)
```bash
cd backend/tests
./run-all-tests.sh
```

#### Run Individual Test Suites
```bash
# Test only Resident flow
./run-all-tests.sh resident

# Test only Sevak flow
./run-all-tests.sh sevak

# Test only Vendor flow
./run-all-tests.sh vendor
```

#### Run Specific Flow
```bash
# Run resident tests directly
./test-resident-flow.sh

# Run sevak tests directly
./test-sevak-flow.sh

# Run vendor tests directly
./test-vendor-flow.sh
```

## 📊 Understanding Test Output

### Success Indicators ✓
```
✓ PASS: Resident registered - ID: 507f1f77bcf86cd799439011
✓ PASS: Login successful
✓ PASS: Booking created - ID: 507f1f77bcf86cd799439012
```

### Failure Indicators ✗
```
✗ FAIL: Registration failed
✗ FAIL: Payment order creation failed
```

### Test Summary
```
========================================
RESIDENT FLOW TEST SUMMARY
========================================

Tests Passed: 15
Tests Failed: 2
Total Tests: 17
```

## 🔧 Test Features

### Automatic Token Management
- Tests automatically handle authentication tokens
- Tokens are reused across requests in the same session
- Fallback to login if OTP verification fails

### ID Tracking
- User IDs, Booking IDs, Service IDs tracked automatically
- Used for dependent tests (e.g., create booking → payment)

### Error Handling
- Clear error messages with context
- JSON output for debugging
- Exit codes: 0 (success), 1 (failure)

### Pretty Output
- Color-coded test results
- Progress indicators
- Structured summaries

## 📝 Test Data

Tests create unique data to avoid conflicts:

### Resident Test User
- Email: `resident.complete.test@urbanclean.com`
- Phone: `+919876540001`
- Password: `SecurePass123!`

### Sevak Test User
- Email: `sevak.complete.test@urbanclean.com`
- Phone: `+919876540002`
- Password: `SecurePass123!`

### Vendor Test User
- Email: `vendor.complete.test@urbanclean.com`
- Phone: `+919876540003`
- Password: `SecurePass123!`

## 🐛 Troubleshooting

### "Backend server is not running"
**Solution**: Start the backend server
```bash
cd backend
npm run dev
```

### "No services found"
**Solution**: Seed the database
```bash
cd backend
npm run seed
```

### "Login failed"
**Solution**: Check if MongoDB is running and connected
```bash
# Check MongoDB
mongod --version

# Check backend logs for errors
```

### "Cannot continue without authentication"
**Cause**: Registration or login endpoint failed

**Solution**:
1. Check backend logs
2. Verify MongoDB connection
3. Check `.env` file configuration
4. Test endpoints manually:
   ```bash
   curl http://localhost:5000/api/v1/services
   ```

### Tests hang or timeout
**Cause**: Backend server not responding

**Solution**:
1. Check if server is actually running
2. Verify port 5000 is not blocked
3. Check backend console for errors

## 📈 Advanced Usage

### Save Test Results
```bash
./run-all-tests.sh > test-results.log 2>&1
```

### Run Tests with Timestamps
```bash
./run-all-tests.sh | ts '[%Y-%m-%d %H:%M:%S]'
```

### Extract Only Failures
```bash
./run-all-tests.sh 2>&1 | grep "✗ FAIL"
```

### CI/CD Integration
```bash
# Exit code 0 = all passed, 1 = some failed
./run-all-tests.sh
echo "Exit code: $?"
```

## 🎯 What's Tested

### Authentication & Authorization
- Registration with all three roles
- OTP verification
- Login with email/phone
- JWT token generation
- Token refresh
- Role-based access control

### Resident Features
- Complete profile setup
- Service browsing and filtering
- Favorites management
- Booking creation with scheduling
- Payment order creation
- Payment history
- Notifications
- Booking details retrieval

### Sevak Features
- Skills and experience setup
- Availability management
- Job listing and details
- Check-in with OTP verification
- Check-out with location
- Attendance history
- Earnings calculation
- Performance metrics
- Feedback and ratings

### Vendor Features
- Business profile creation
- GST registration
- Services offered
- Contact details
- Address management

## 📚 API Endpoints Covered

### Auth Endpoints
- `POST /auth/register`
- `POST /auth/verify-otp`
- `POST /auth/login`
- `POST /auth/refresh-token`

### User Endpoints
- `GET /users/profile`
- `PUT /users/profile`

### Service Endpoints
- `GET /services/categories`
- `GET /services`
- `GET /services/:id`
- `POST /services/favorites`
- `GET /services/favorites`

### Booking Endpoints
- `POST /bookings`
- `GET /bookings/my-bookings`
- `GET /bookings/:id`
- `GET /bookings/available-slots`

### Payment Endpoints
- `POST /payments/create-order`
- `GET /payments/history`
- `GET /payments/invoice/:bookingId`

### Sevak Endpoints
- `GET /sevak/jobs`
- `GET /sevak/jobs/:id`
- `POST /sevak/check-in`
- `POST /sevak/check-out`
- `GET /sevak/attendance`
- `GET /sevak/earnings`
- `GET /sevak/earnings/details`
- `GET /sevak/performance`
- `GET /sevak/feedback`

### Notification Endpoints
- `GET /notifications`

## 🎉 Success Criteria

All tests pass when:
- ✅ Backend server is running on port 5000
- ✅ MongoDB is connected and accessible
- ✅ Database is seeded with test data
- ✅ All API endpoints are functioning correctly
- ✅ Authentication and authorization working
- ✅ Role-based access control enforced
- ✅ Data validation and error handling proper

## 📞 Support

If tests fail after following troubleshooting:
1. Check `backend/logs/` for errors
2. Review backend console output
3. Test endpoints manually with curl
4. Verify environment variables in `.env`
5. Check MongoDB connection string

---

**Happy Testing! 🚀**
