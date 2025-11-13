# Backend API Testing Guide

## Quick Start

### Prerequisites

Before running tests, ensure:

1. **MongoDB is running**:
   ```bash
   # Check if MongoDB is running
   mongod --version

   # Start MongoDB (if not running)
   mongod --dbpath /path/to/data
   ```

2. **Backend server is running**:
   ```bash
   cd backend

   # Install dependencies (first time only)
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URI

   # Seed the database with test data
   npm run seed

   # Start the server
   npm run dev
   ```

3. **Server should be accessible at**: `http://localhost:5000`

### Running Tests

Once the server is running, run the test script:

```bash
cd backend
./test-api.sh
```

## Common Issues & Solutions

### Issue 1: "Backend server is not running!"

**Solution**: Start the backend server first:
```bash
cd backend
npm run dev
```

### Issue 2: "Cannot find module" errors

**Solution**: Install dependencies:
```bash
cd backend
npm install
```

### Issue 3: "Connection refused" or MongoDB errors

**Solution**:
1. Start MongoDB:
   ```bash
   mongod --dbpath /path/to/data
   ```

2. Check your `.env` file has correct MongoDB URI:
   ```env
   MONGODB_URI=mongodb://localhost:27017/society-booking
   ```

### Issue 4: "No services found"

**Solution**: Seed the database:
```bash
cd backend
npm run seed
```

### Issue 5: Registration/Login fails

**Possible causes**:
- Database not connected
- Missing environment variables
- Port 5000 already in use

**Solution**:
1. Check backend logs for errors
2. Verify `.env` file exists and has required variables
3. Check if port 5000 is available:
   ```bash
   lsof -i :5000
   ```

## Test Endpoints Manually

If the script doesn't work, test endpoints manually with curl:

### 1. Check server health:
```bash
curl http://localhost:5000
```

### 2. Register a user:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "resident",
    "fullName": "Test User"
  }'
```

### 3. Login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Get services:
```bash
curl http://localhost:5000/api/v1/services
```

## Understanding Test Output

### Success Indicators:
- ✓ Green checkmarks indicate successful operations
- Service IDs, User IDs, and Tokens are displayed
- HTTP 200/201 responses

### Failure Indicators:
- ✗ Red X marks indicate failures
- Error messages are displayed
- Empty IDs or tokens

### Information Messages:
- → Yellow arrows provide additional context
- Suggest next steps or configuration needed

## Environment Setup

### Minimum .env configuration:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/society-booking

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay (Optional for basic testing)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Test Data

After running `npm run seed`, you'll have:
- 3 test users (one for each role)
- 5 service categories
- 8+ sample services
- Pre-populated ratings

### Test Credentials:
- **Resident**: resident@example.com / password123
- **Sevak**: sevak@example.com / password123
- **Vendor**: vendor@example.com / password123

## Detailed Test Coverage

The test script covers:

1. **Authentication Flow**:
   - User registration
   - OTP verification
   - Login
   - Token generation

2. **Service Discovery**:
   - Browse categories
   - List services
   - Service details
   - Add to favorites

3. **Booking Management**:
   - Create booking
   - View bookings
   - Reschedule
   - Cancel

4. **Payment Processing**:
   - Create order
   - Verify payment
   - Get invoices

5. **Sevak Operations**:
   - View jobs
   - Check-in/out
   - Track earnings

6. **Ratings & Reviews**:
   - Submit ratings
   - View feedback

## Getting Help

If tests continue to fail after following this guide:

1. Check backend logs in `backend/logs/` (if logging is enabled)
2. Review `backend/server.js` startup logs
3. Verify all dependencies are installed
4. Ensure MongoDB is accessible
5. Check firewall settings for ports 5000 and 27017

## Advanced Testing

For comprehensive testing, see `API_TESTING_GUIDE.md` which includes:
- Manual curl commands for all endpoints
- Request/response examples
- Advanced scenarios
- Load testing approaches
