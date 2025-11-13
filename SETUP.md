# Society Service Booking App - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20 or higher ([Download](https://nodejs.org/))
- **MongoDB** v7 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))
- **Expo CLI** (will be installed with project)
- **iOS/Android device** or emulator for testing mobile app

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" setup
4. Install MongoDB as a service
5. MongoDB will start automatically

#### Verify MongoDB Installation
```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell
# Type 'exit' to quit
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier available)
4. Get your connection string
5. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/society-booking?retryWrites=true&w=majority
   ```

---

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/society-booking

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19001,http://localhost:19002

# File Upload
MAX_FILE_SIZE=5242880
```

### 4. Seed Database (Optional but Recommended)

Seed the database with test data:

```bash
npm run seed
```

This creates:
- 3 Test users (resident, sevak, vendor)
- 5 Service categories
- 8 Sample services

**Test Credentials:**
- Resident: `resident@example.com` / `password123`
- Sevak: `sevak@example.com` / `password123`
- Vendor: `vendor@example.com` / `password123`

### 5. Start Backend Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

**Server will run on:** `http://localhost:5000`

**Check Health:** `http://localhost:5000/api/v1/health`

---

## 📱 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Expo CLI Globally (if not already installed)

```bash
npm install -g expo-cli
```

### 4. Environment Configuration

The app is pre-configured to connect to `http://localhost:5000`

If your backend is running on a different host/port, update:
- `frontend/src/services/api/axios.config.ts`
- Change `API_URL` constant

### 5. Start Expo Development Server

```bash
npx expo start
```

Or use npm scripts:

```bash
# Start Expo dev server
npm start

# Start on Android
npm run android

# Start on iOS
npm run ios

# Start on Web
npm run web
```

### 6. Run on Device/Emulator

#### Option 1: Physical Device (Recommended)
1. Install **Expo Go** app from:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code shown in terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

#### Option 2: iOS Simulator (macOS only)
1. Install Xcode from App Store
2. Press `i` in Expo terminal to open iOS simulator

#### Option 3: Android Emulator
1. Install [Android Studio](https://developer.android.com/studio)
2. Create an AVD (Android Virtual Device)
3. Press `a` in Expo terminal to open Android emulator

---

## 🔍 Verification Steps

### 1. Check MongoDB Connection

```bash
# In a new terminal
mongosh

# List databases
show dbs

# You should see 'society-booking' database
use society-booking

# Check collections
show collections
```

### 2. Test Backend API

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}

# Register a test user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phoneNumber": "+919999999999",
    "email": "test@example.com",
    "password": "password123",
    "role": "resident"
  }'
```

### 3. Test Frontend

1. Open Expo Go app on your device
2. Scan QR code from terminal
3. App should load with Welcome screen
4. Try logging in with test credentials:
   - Email: `resident@example.com`
   - Password: `password123`

---

## 🚨 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Backend Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
PORT=5001
```

### Expo Metro Bundler Issues

**Error:** `Metro bundler not starting`

**Solutions:**
```bash
# Clear cache and restart
npx expo start -c

# Or reset all
rm -rf node_modules
rm -rf .expo
npm install
npx expo start
```

### Network Connection Issues (Device can't connect to backend)

**Problem:** Frontend can't reach backend API

**Solutions:**

1. **Find your computer's local IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. **Update API_URL in frontend:**
   - Edit `frontend/src/services/api/axios.config.ts`
   - Change `http://localhost:5000` to `http://YOUR_IP:5000`
   - Example: `http://192.168.1.100:5000`

3. **Update CORS in backend:**
   - Edit `backend/.env`
   - Add your device IP to `ALLOWED_ORIGINS`

### Duplicate Index Warnings

If you see Mongoose warnings about duplicate indexes, they're harmless but can be fixed by dropping and recreating indexes:

```bash
mongosh
use society-booking
db.users.dropIndexes()
db.users.createIndex({ phoneNumber: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## 📦 Project Structure

```
urban-clean/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── uploads/             # File uploads
│   ├── logs/                # Application logs
│   ├── .env                 # Environment variables
│   ├── server.js            # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── contexts/        # React contexts
    │   ├── hooks/           # Custom hooks
    │   ├── navigation/      # Navigation config
    │   ├── screens/         # Screen components
    │   ├── services/        # API services
    │   ├── theme/           # Theme config
    │   ├── types/           # TypeScript types
    │   └── utils/           # Utility functions
    ├── App.tsx              # Root component
    └── package.json
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT for Production:**

1. **Change all secrets in `.env`**
   - Generate strong JWT secrets
   - Use production Razorpay keys
   - Set NODE_ENV to 'production'

2. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Configure reverse proxy (nginx/Apache)

3. **Database Security**
   - Use MongoDB Atlas with IP whitelisting
   - Enable authentication
   - Regular backups

4. **Rate Limiting**
   - Already configured in backend
   - Adjust limits based on needs

---

## 🎯 Next Steps

### For Development:
1. Explore the API documentation at `http://localhost:5000/api/v1`
2. Check backend README: `backend/README.md`
3. Check frontend README: `frontend/README.md`
4. Review the codebase structure
5. Start building additional features!

### For Production:
1. Set up production MongoDB cluster
2. Configure production environment variables
3. Set up CI/CD pipeline
4. Deploy backend to cloud (AWS, Azure, DigitalOcean)
5. Build and publish mobile apps to App Store/Play Store

---

## 📞 Support

For issues or questions:
- Check existing documentation
- Review error logs in `backend/logs/`
- Open an issue on GitHub
- Contact the development team

---

## ✅ Success Checklist

Before considering setup complete, verify:

- [ ] MongoDB is running and accessible
- [ ] Backend server starts without errors
- [ ] Health endpoint responds: `http://localhost:5000/api/v1/health`
- [ ] Database has seed data (users, categories, services)
- [ ] Frontend Expo server starts successfully
- [ ] Mobile app loads on device/emulator
- [ ] Can login with test credentials
- [ ] Can browse services
- [ ] Can view profile

---

## 🎉 You're Ready!

The app is now set up and ready for development or testing. Happy coding! 🚀
