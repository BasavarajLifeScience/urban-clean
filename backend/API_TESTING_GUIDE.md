# Urban Clean - Comprehensive API Testing Guide

This guide provides complete end-to-end testing instructions for all user roles and features in the Urban Clean Society Service Booking Application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Testing Flows](#testing-flows)
4. [Manual Testing](#manual-testing)
5. [Expected Results](#expected-results)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Software Requirements
- **Node.js**: v20+ LTS
- **MongoDB**: v7+ (running)
- **curl**: For API testing
- **jq**: JSON processor (optional, for pretty printing)

### Setup Steps

1. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/data
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

4. **Seed Database** (Optional):
   ```bash
   npm run seed
   ```

5. **Start Backend Server**:
   ```bash
   npm run dev
   ```

   Server should be running on `http://localhost:5000`

---

## Quick Start

### Automated Testing

Run the comprehensive test script that tests all roles end-to-end:

```bash
cd backend
./test-api.sh
```

This script will:
- ✅ Register and authenticate all three user roles (Resident, Sevak, Vendor)
- ✅ Test profile setup for each role
- ✅ Test service discovery and favorites
- ✅ Create and manage bookings
- ✅ Process payments
- ✅ Test Sevak job management (check-in/out)
- ✅ Test ratings and feedback
- ✅ Test notifications
- ✅ Test booking modifications (reschedule/cancel)

### Manual Testing

If you prefer manual testing with curl commands, see the [Manual Testing](#manual-testing) section below.

---

## Testing Flows

### Flow 1: Resident Journey

```
Register → Verify OTP → Login → Setup Profile → Browse Services →
Add to Favorites → Create Booking → Make Payment → Rate Service
```

### Flow 2: Sevak Journey

```
Register → Verify OTP → Login → Setup Profile → View Jobs →
Check-In → Complete Work → Check-Out → Upload Photos →
Track Earnings → View Ratings
```

### Flow 3: Vendor Journey

```
Register → Verify OTP → Login → Setup Business Profile →
Manage Services → View Analytics
```

---

## Manual Testing

### 1. Resident Registration & Authentication

#### 1.1 Register Resident

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "email": "resident@example.com",
    "password": "SecurePass123!",
    "role": "resident",
    "fullName": "John Doe"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "message": "OTP sent to your phone"
  }
}
```

#### 1.2 Verify OTP

```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "otp": "123456"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "resident@example.com",
      "role": "resident"
    }
  }
}
```

#### 1.3 Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "resident@example.com",
    "password": "SecurePass123!"
  }'
```

---

### 2. Resident Profile Setup

#### 2.1 Update Profile

```bash
curl -X PUT http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "address": {
      "flatNumber": "A-101",
      "building": "Tower A",
      "society": "Green Valley Apartments",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "phoneNumber": "+919999999999",
      "relationship": "Spouse"
    }
  }'
```

---

### 3. Service Discovery

#### 3.1 Get All Categories

```bash
curl -X GET http://localhost:5000/api/v1/services/categories
```

#### 3.2 Browse Services

```bash
curl -X GET "http://localhost:5000/api/v1/services?page=1&limit=10"
```

#### 3.3 Get Service Details

```bash
curl -X GET http://localhost:5000/api/v1/services/SERVICE_ID
```

#### 3.4 Add to Favorites

```bash
curl -X POST http://localhost:5000/api/v1/services/favorites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "SERVICE_ID"
  }'
```

#### 3.5 Get Favorites

```bash
curl -X GET http://localhost:5000/api/v1/services/favorites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Booking Creation

#### 4.1 Get Available Slots

```bash
curl -X GET "http://localhost:5000/api/v1/bookings/available-slots?serviceId=SERVICE_ID&date=2025-11-20"
```

#### 4.2 Create Booking

```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "SERVICE_ID",
    "scheduledDate": "2025-11-20",
    "scheduledTime": "10:00 AM",
    "address": {
      "flatNumber": "A-101",
      "building": "Tower A",
      "society": "Green Valley Apartments",
      "city": "Mumbai",
      "pincode": "400001"
    },
    "specialInstructions": "Please call before arriving"
  }'
```

#### 4.3 Get My Bookings

```bash
curl -X GET http://localhost:5000/api/v1/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4.4 Get Booking Details

```bash
curl -X GET http://localhost:5000/api/v1/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4.5 Reschedule Booking

```bash
curl -X PATCH http://localhost:5000/api/v1/bookings/BOOKING_ID/reschedule \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newDate": "2025-11-21",
    "newTime": "02:00 PM"
  }'
```

#### 4.6 Cancel Booking

```bash
curl -X PATCH http://localhost:5000/api/v1/bookings/BOOKING_ID/cancel \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Change of plans"
  }'
```

---

### 5. Payment Integration

#### 5.1 Create Payment Order

```bash
curl -X POST http://localhost:5000/api/v1/payments/create-order \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "amount": 500
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_ID",
    "razorpayOrderId": "order_xxx",
    "amount": 500,
    "currency": "INR"
  }
}
```

#### 5.2 Verify Payment

```bash
curl -X POST http://localhost:5000/api/v1/payments/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "razorpaySignature": "signature_xxx"
  }'
```

#### 5.3 Get Payment History

```bash
curl -X GET http://localhost:5000/api/v1/payments/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5.4 Get Invoice

```bash
curl -X GET http://localhost:5000/api/v1/payments/invoice/BOOKING_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Sevak Registration & Authentication

#### 6.1 Register Sevak

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543211",
    "email": "sevak@example.com",
    "password": "SecurePass123!",
    "role": "sevak",
    "fullName": "Ramesh Kumar"
  }'
```

#### 6.2 Update Sevak Profile

```bash
curl -X PUT http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "skills": ["Cleaning", "Maintenance", "Plumbing"],
    "experience": 5,
    "bio": "Experienced service professional with 5 years of expertise",
    "availability": {
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "timeSlots": ["09:00-12:00", "14:00-18:00"]
    }
  }'
```

---

### 7. Sevak Job Management

#### 7.1 Get Assigned Jobs

```bash
curl -X GET http://localhost:5000/api/v1/sevak/jobs \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

#### 7.2 Get Job Details

```bash
curl -X GET http://localhost:5000/api/v1/sevak/jobs/BOOKING_ID \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

#### 7.3 Check-In to Job

```bash
curl -X POST http://localhost:5000/api/v1/sevak/check-in \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "otp": "123456",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  }'
```

#### 7.4 Check-Out from Job

```bash
curl -X POST http://localhost:5000/api/v1/sevak/check-out \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  }'
```

#### 7.5 Complete Job with Notes

```bash
curl -X PATCH http://localhost:5000/api/v1/sevak/jobs/BOOKING_ID/complete \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completionNotes": "Job completed successfully. All areas cleaned thoroughly.",
    "checklistItems": ["Cleaned all rooms", "Sanitized surfaces", "Disposed waste"]
  }'
```

#### 7.6 Report Issue

```bash
curl -X POST http://localhost:5000/api/v1/sevak/jobs/BOOKING_ID/report-issue \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "issueType": "damage",
    "description": "Found pre-existing water damage in bathroom"
  }'
```

#### 7.7 Get Attendance History

```bash
curl -X GET "http://localhost:5000/api/v1/sevak/attendance?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

---

### 8. Sevak Earnings & Performance

#### 8.1 Get Earnings

```bash
curl -X GET "http://localhost:5000/api/v1/sevak/earnings?period=monthly" \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

#### 8.2 Get Earnings Details

```bash
curl -X GET http://localhost:5000/api/v1/sevak/earnings/details \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

#### 8.3 Get Performance Metrics

```bash
curl -X GET http://localhost:5000/api/v1/sevak/performance \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalRatings": 25,
    "completionRate": 98,
    "onTimePercentage": 95,
    "totalJobs": 50
  }
}
```

#### 8.4 Get Feedback/Reviews

```bash
curl -X GET http://localhost:5000/api/v1/sevak/feedback \
  -H "Authorization: Bearer SEVAK_ACCESS_TOKEN"
```

---

### 9. Rating & Feedback

#### 9.1 Submit Rating

```bash
curl -X POST http://localhost:5000/api/v1/ratings \
  -H "Authorization: Bearer RESIDENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "ratedTo": "SEVAK_ID",
    "rating": 5,
    "comment": "Excellent service! Very professional and thorough."
  }'
```

#### 9.2 Get Sevak Ratings

```bash
curl -X GET "http://localhost:5000/api/v1/ratings/sevak/SEVAK_ID?page=1&limit=10"
```

#### 9.3 Get Booking Rating

```bash
curl -X GET http://localhost:5000/api/v1/ratings/booking/BOOKING_ID \
  -H "Authorization: Bearer RESIDENT_ACCESS_TOKEN"
```

#### 9.4 Update Rating

```bash
curl -X PUT http://localhost:5000/api/v1/ratings/RATING_ID \
  -H "Authorization: Bearer RESIDENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated: Good service overall."
  }'
```

---

### 10. Vendor Registration & Setup

#### 10.1 Register Vendor

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543212",
    "email": "vendor@example.com",
    "password": "SecurePass123!",
    "role": "vendor",
    "fullName": "Clean Pro Services"
  }'
```

#### 10.2 Update Vendor Profile

```bash
curl -X PUT http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer VENDOR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

### 11. Notifications

#### 11.1 Get Notifications

```bash
curl -X GET "http://localhost:5000/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 11.2 Mark Notification as Read

```bash
curl -X PATCH http://localhost:5000/api/v1/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 11.3 Mark All as Read

```bash
curl -X PATCH http://localhost:5000/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 11.4 Update Notification Settings

```bash
curl -X PUT http://localhost:5000/api/v1/notifications/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pushEnabled": true,
    "emailEnabled": true,
    "smsEnabled": false,
    "types": {
      "booking": true,
      "payment": true,
      "rating": true,
      "offer": false
    }
  }'
```

---

## Expected Results

### Successful Test Indicators

✅ **All requests return 200/201 status codes**
✅ **JWT tokens are generated and accepted**
✅ **Database records are created correctly**
✅ **Bookings progress through status flow**: pending → assigned → in-progress → completed
✅ **Payments are processed and verified**
✅ **Ratings are submitted and reflected in averages**
✅ **Notifications are generated for key events**

### Key Metrics to Verify

- User registration and authentication work for all three roles
- Profile completion updates `isProfileComplete` flag
- Services can be browsed, searched, and favorited
- Bookings can be created, modified, and cancelled
- Sevaks can check-in/out with OTP verification
- Earnings are tracked correctly for Sevaks
- Ratings affect overall Sevak score
- All timestamps are recorded accurately

---

## Troubleshooting

### Common Issues

#### 1. Server Not Running
```
Error: Connection refused
```
**Solution**: Start the backend server with `npm run dev`

#### 2. MongoDB Connection Error
```
Error: MongoNetworkError
```
**Solution**: Ensure MongoDB is running and check connection string in `.env`

#### 3. Invalid Token
```
Error: 401 Unauthorized
```
**Solution**: Use a fresh access token from login response

#### 4. Missing Data
```
Error: 404 Not Found
```
**Solution**: Run `npm run seed` to populate database with test data

#### 5. Validation Errors
```
Error: 400 Bad Request - Validation failed
```
**Solution**: Check request body matches the expected schema

---

## Testing Best Practices

1. **Test in Order**: Follow the flows sequentially as they build on each other
2. **Save Tokens**: Store access tokens for reuse across requests
3. **Note IDs**: Keep track of user IDs, booking IDs, service IDs for dependent requests
4. **Check Database**: Verify records in MongoDB after each operation
5. **Monitor Logs**: Watch server logs for errors and debugging info
6. **Use jq**: Pretty print JSON responses with `| jq '.'`

---

## Advanced Testing

### Load Testing

Test concurrent bookings:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/bookings \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ ... }' &
done
wait
```

### Security Testing

Test rate limiting:
```bash
for i in {1..20}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{ "phoneOrEmail": "test@example.com", "password": "wrong" }'
done
```

---

## Support

For issues or questions:
1. Check server logs in `backend/logs/`
2. Review API documentation
3. Verify environment configuration
4. Check MongoDB connection and data

---

**Happy Testing! 🚀**
