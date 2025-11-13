#!/bin/bash

# Quick endpoint tester - shows actual responses
API_URL="http://localhost:5001/api/v1"

echo "========================================="
echo "Testing Registration Endpoint"
echo "========================================="

curl -v -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5001" \
  -d '{
    "phoneNumber": "+919999999999",
    "email": "quicktest@urbanclean.com",
    "password": "SecurePass123!",
    "role": "resident",
    "fullName": "Quick Test User"
  }' 2>&1 | grep -A 50 "< HTTP"

echo ""
echo "========================================="
echo "Testing Login Endpoint"
echo "========================================="

curl -v -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5001" \
  -d '{
    "phoneOrEmail": "quicktest@urbanclean.com",
    "password": "SecurePass123!"
  }' 2>&1 | grep -A 50 "< HTTP"
