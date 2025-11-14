# Quick Start Guide for Admin Dashboard

## Important: Backend Must Be Running

The admin dashboard REQUIRES the backend API to be running. Here's how to start it:

## Option 1: Using Docker (Recommended - if Docker is available)

```bash
# From project root
docker-compose up -d

# Seed the database (creates admin user)
docker-compose exec backend npm run seed

# Check logs
docker-compose logs -f backend
```

## Option 2: Run Backend Directly (if MongoDB is installed locally)

### Step 1: Create .env file

```bash
cd backend
cp .env.example .env
```

### Step 2: Start MongoDB

Make sure MongoDB is running on localhost:27017

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or run MongoDB manually
mongod --dbpath /path/to/data/directory
```

### Step 3: Install dependencies and seed database

```bash
# In backend directory
npm install

# Seed the database (IMPORTANT - creates the admin user)
npm run seed
```

### Step 4: Start backend

```bash
npm run dev
```

Backend should now be running on http://localhost:5001

## Option 3: If Neither Docker Nor MongoDB Available

You need either:
1. Docker installed, OR
2. MongoDB installed locally

**Install MongoDB:**
- Mac: `brew install mongodb-community`
- Ubuntu: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
- Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/

## Verify Backend is Running

```bash
curl http://localhost:5001/health
```

Should return: `{"success":true,"message":"Server is healthy"}`

## Start Admin Dashboard

Once backend is running:

```bash
cd admin-dashboard
npm install
npm run dev
```

Open http://localhost:3000 and login with:
- Email: superadmin@societybooking.com
- Password: Admin@123
- Admin Code: SA001

## Troubleshooting

### "Cannot connect to backend API"
- Backend is not running → Start backend using steps above
- Wrong port → Backend must be on port 5001

### "Invalid credentials (401 error)"
- Admin user not seeded → Run `npm run seed` in backend directory
- MongoDB not connected → Check MongoDB is running

### "Form keeps refreshing"
- Make sure you're using the latest code
- Clear browser cache
- Check browser console for JavaScript errors
