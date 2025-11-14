# API Configuration Guide

## Overview

This document explains the API configuration for the Urban Clean application, including how the frontend connects to the backend API across different platforms and environments.

## Architecture

```
Frontend (Expo/React Native)
    ↓
    API Client (Axios)
    ↓
Backend API (Express.js - Port 5001 on host, 5000 in container)
    ↓
MongoDB (Port 27017)
```

## Port Configuration

### Docker Setup

The backend runs in a Docker container with the following port mapping:

- **Container Internal Port**: 5000
- **Host Machine Port**: 5001 (mapped via Docker)
- **MongoDB Port**: 27017

```yaml
# docker-compose.yml
backend:
  ports:
    - "5001:5000"  # Host:Container
```

### Why Port 5001?

The backend is configured to run on port 5000 **inside** the Docker container, but it's **exposed** on port 5001 on the host machine to avoid conflicts with other services that might use port 5000.

## API URL Configuration

### File: `frontend/app.json`

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:5001/api/v1"
    }
  }
}
```

**✅ Correct Port**: 5001 (connects to Docker host port)

### File: `frontend/src/services/api/axios.config.ts`

The axios configuration automatically detects the platform and uses the appropriate URL:

```typescript
const getApiUrl = () => {
  // Use app.json config if available
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }

  // Platform-specific defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api/v1';  // Android emulator special IP
  }

  return 'http://localhost:5001/api/v1';  // iOS simulator & web
};
```

## Platform-Specific Considerations

### 📱 iOS Simulator
- **URL**: `http://localhost:5001/api/v1`
- **Reason**: iOS simulator shares the same network as the host machine
- **Works**: ✅ Direct localhost connection

### 📱 Android Emulator
- **URL**: `http://10.0.2.2:5001/api/v1`
- **Reason**: Android emulator uses a special IP `10.0.2.2` to access the host machine's localhost
- **Works**: ✅ With special IP mapping

### 💻 Expo Web
- **URL**: `http://localhost:5001/api/v1`
- **Reason**: Runs in browser on the same machine
- **Works**: ✅ Direct localhost connection

### 📲 Physical Device
- **URL**: `http://<YOUR_LOCAL_IP>:5001/api/v1`
- **Example**: `http://192.168.1.100:5001/api/v1`
- **Setup**:
  1. Find your machine's local IP address
  2. Update `app.json` with your IP address
  3. Ensure device is on the same Wi-Fi network
  4. Update CORS settings in `docker-compose.yml`

## CORS Configuration

The backend is configured to allow requests from Expo dev servers:

```yaml
# docker-compose.yml
ALLOWED_ORIGINS: http://localhost:19000,http://localhost:19001,http://localhost:19002,http://localhost:8081,http://10.0.2.2:19000,http://10.0.2.2:19001
```

### Expo Dev Server Ports:
- **19000**: Expo Metro bundler (default)
- **19001**: Expo DevTools
- **19002**: Alternative port
- **8081**: Alternative Metro port

## API Endpoints

### Base URL
```
http://localhost:5001/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "phoneNumber": "+919876543210",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "resident"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "60d5ec49f1b2c72b8c8e4f1a",
    "otp": "123456"  // Only in development
  }
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "userId": "60d5ec49f1b2c72b8c8e4f1a",
  "otp": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "phoneOrEmail": "john@example.com",
  "password": "SecurePassword123!"
}
```

## Troubleshooting

### 1. "Network Error" or "Request Failed"

**Symptoms:**
- Cannot reach API
- Registration fails immediately
- Network request timeout

**Solutions:**

✅ **Check Docker is running:**
```bash
docker ps
```
You should see `society-booking-backend` and `society-booking-mongodb`

✅ **Check backend health:**
```bash
curl http://localhost:5001/api/v1/health
```
Should return: `{"success":true,"message":"API is running"}`

✅ **Verify port configuration:**
- `app.json`: Port 5001
- `docker-compose.yml`: `5001:5000` mapping
- Backend is listening on port 5000 inside container

✅ **Check backend logs:**
```bash
docker logs society-booking-backend
```

### 2. CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" error
- Request blocked by CORS policy

**Solutions:**

✅ **Update ALLOWED_ORIGINS in docker-compose.yml:**
```yaml
ALLOWED_ORIGINS: http://localhost:19000,http://localhost:19001,http://localhost:19002,http://localhost:8081,http://10.0.2.2:19000,http://10.0.2.2:19001
```

✅ **For physical devices, add your local IP:**
```yaml
ALLOWED_ORIGINS: ...,http://192.168.1.100:19000
```

✅ **Restart Docker after changes:**
```bash
docker-compose down
docker-compose up -d
```

### 3. Android Emulator Cannot Connect

**Symptoms:**
- Works on iOS/Web but fails on Android
- "Network request failed" on Android only

**Solutions:**

✅ **Use special IP in axios.config.ts:**
```typescript
if (Platform.OS === 'android') {
  return 'http://10.0.2.2:5001/api/v1';
}
```

✅ **Add Android emulator IP to CORS:**
```yaml
ALLOWED_ORIGINS: ...,http://10.0.2.2:19000,http://10.0.2.2:19001
```

### 4. Token/Authentication Issues

**Symptoms:**
- Login works but subsequent requests fail
- 401 Unauthorized errors

**Solutions:**

✅ **Check token storage:**
```typescript
// In frontend
const token = await SecureStore.getItemAsync('accessToken');
console.log('Token:', token);
```

✅ **Verify JWT secrets match:**
- Check `docker-compose.yml` JWT secrets
- Ensure they match backend configuration

### 5. Registration OTP Issues

**Development Mode:**
- OTP is set to `123456` (configured in `docker-compose.yml` as `DEV_OTP`)
- Check backend logs to see the OTP generated

**Production Mode:**
- Configure SMS gateway (Twilio) or Email service (SendGrid)
- Update environment variables in `.env`

## Starting the Application

### 1. Start Backend (Docker)
```bash
# From project root
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### 2. Start Frontend (Expo)
```bash
# From frontend directory
cd frontend
npm install
npx expo start

# Or specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

### 3. Verify Connection
Open Expo app and check console logs:
```
🔗 API URL configured: http://localhost:5001/api/v1 | Platform: ios
```

## Testing API Calls

### Using cURL

```bash
# Health check
curl http://localhost:5001/api/v1/health

# Register user
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phoneNumber": "+919876543210",
    "email": "test@example.com",
    "password": "Test12345!",
    "role": "resident"
  }'
```

### Using Postman/Insomnia

1. **Base URL**: `http://localhost:5001/api/v1`
2. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>` (for protected routes)
3. **Test Registration**: POST to `/auth/register`

## Environment Variables Reference

### Frontend (`app.json`)
```json
{
  "extra": {
    "apiUrl": "http://localhost:5001/api/v1"
  }
}
```

### Backend (`docker-compose.yml`)
```yaml
PORT: 5000                    # Internal container port
MONGODB_URI: mongodb://...    # MongoDB connection string
JWT_ACCESS_SECRET: ...        # JWT signing secret
JWT_REFRESH_SECRET: ...       # Refresh token secret
ALLOWED_ORIGINS: ...          # CORS allowed origins
DEV_OTP: 123456              # Development OTP
```

## Quick Reference

| Component | Port | URL |
|-----------|------|-----|
| Backend (container) | 5000 | http://localhost:5000 (internal) |
| Backend (host) | 5001 | http://localhost:5001 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Expo Dev Server | 19000 | http://localhost:19000 |
| Expo DevTools | 19001 | http://localhost:19001 |

## Support

If you continue to experience issues:

1. Check all console logs (Expo Metro bundler)
2. Check backend logs (`docker logs society-booking-backend`)
3. Verify network connectivity
4. Ensure all environment variables are set correctly
5. Try restarting Docker and Expo dev server

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
