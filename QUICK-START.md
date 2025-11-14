# Quick Start Guide

## You're Getting These Errors:

1. ❌ `Cannot find module 'babel-plugin-module-resolver'`
2. ❌ `Unable to resolve asset "./assets/icon.png"`

## Why?

You haven't pulled the latest changes from git yet! The fixes are in the repository but not in your local files.

---

## Fix in 5 Steps:

### Step 1: Pull Latest Changes

```bash
cd /Users/basavaraj/Desktop/POC/urban-clean
git pull origin claude/society-booking-app-poc-011CV68b1cAYxr72tyz8xA3n
```

This will download:
- ✅ `babel-plugin-module-resolver` in package.json
- ✅ Docker configuration (port 5001)
- ✅ All other fixes

### Step 2: Install Frontend Dependencies

```bash
cd frontend
rm -rf node_modules
npm install
```

This installs all missing packages including `babel-plugin-module-resolver`.

### Step 3: Create Missing Assets

```bash
cd frontend
npx expo install
```

This creates default icon.png and splash.png files.

### Step 4: Start Backend with Docker

```bash
# Go back to project root
cd ..

# Start Docker services
docker-compose up -d

# Wait 10 seconds, then seed database
docker-compose exec backend npm run seed
```

### Step 5: Start Frontend

```bash
cd frontend
npx expo start -c
```

The `-c` flag clears the cache.

---

## Verify Backend is Running

Open in browser: **http://localhost:5001/api/v1/health**

Should see:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## Test Login

Once Expo shows QR code:
1. Scan with **Expo Go** app
2. Login with: **resident@example.com** / **password123**

---

## Still Having Issues?

### Clear Everything and Start Fresh:

```bash
# Stop Docker
docker-compose down

# Clean frontend
cd frontend
rm -rf node_modules .expo
npm install

# Restart Docker
cd ..
docker-compose up -d
docker-compose exec backend npm run seed

# Start frontend
cd frontend
npx expo start -c
```

---

## Docker Commands

```bash
# View logs
docker-compose logs -f

# Restart backend
docker-compose restart backend

# Stop everything
docker-compose down

# Check status
docker-compose ps
```

---

## The Issue

The error says `Cannot find module 'babel-plugin-module-resolver'` because:

1. Your local `package.json` doesn't have it yet
2. The fix is in git but you haven't pulled it
3. You need to run `git pull` then `npm install`

**Solution: Run Step 1 and Step 2 above!**
