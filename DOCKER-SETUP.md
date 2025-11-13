# Docker Setup Guide

This guide will help you run the Society Booking Application using Docker.

## Prerequisites

- **Docker Desktop** installed on your machine
  - macOS: https://docs.docker.com/desktop/install/mac-install/
  - Windows: https://docs.docker.com/desktop/install/windows-install/
  - Linux: https://docs.docker.com/desktop/install/linux-install/

- **Docker Compose** (included with Docker Desktop)

## Quick Start

### 1. Start the Application

From the project root directory:

```bash
docker-compose up -d
```

This will:
- ✅ Pull MongoDB 7 image
- ✅ Pull Node.js 20 image
- ✅ Build the backend application
- ✅ Start MongoDB on port 27017
- ✅ Start Backend on port 5000
- ✅ Create persistent volumes for data

### 2. Check Services Status

```bash
docker-compose ps
```

Expected output:
```
NAME                         STATUS        PORTS
society-booking-backend      Up (healthy)  0.0.0.0:5000->5000/tcp
society-booking-mongodb      Up (healthy)  0.0.0.0:27017->27017/tcp
```

### 3. View Logs

**Backend logs:**
```bash
docker-compose logs -f backend
```

**MongoDB logs:**
```bash
docker-compose logs -f mongodb
```

**All logs:**
```bash
docker-compose logs -f
```

### 4. Seed the Database

```bash
docker-compose exec backend npm run seed
```

Expected output:
```
Database seeding started...
MongoDB connected successfully
✓ Categories seeded (6 categories)
✓ Admin user created
✓ Sample users created (12 users)
✓ Services seeded (18 services)
✓ Sample bookings created (10 bookings)
Database seeding completed successfully!
```

### 5. Verify Backend is Running

Open browser: http://localhost:5000/api/v1/health

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "uptime": 123.456,
  "database": "connected"
}
```

API Documentation: http://localhost:5000/api/v1

---

## Docker Commands Reference

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services

```bash
# Stop services (keeps data)
docker-compose stop

# Stop and remove containers (keeps data in volumes)
docker-compose down

# Stop and remove everything including volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs

# Follow logs (live tail)
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs mongodb

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands in Containers

```bash
# Run npm commands in backend
docker-compose exec backend npm run seed
docker-compose exec backend npm test
docker-compose exec backend npm run lint

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Access backend shell
docker-compose exec backend sh
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart mongodb
```

### View Container Status

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats
```

---

## MongoDB Access

### Connection Details

- **Host:** localhost
- **Port:** 27017
- **Database:** society-booking
- **Username:** admin
- **Password:** admin123
- **Auth Database:** admin

### Connection String

```
mongodb://admin:admin123@localhost:27017/society-booking?authSource=admin
```

### Using MongoDB Compass

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Open Compass
3. Enter connection string:
   ```
   mongodb://admin:admin123@localhost:27017/society-booking?authSource=admin
   ```
4. Click "Connect"

### Using mongosh (MongoDB Shell)

```bash
# From your host machine
mongosh "mongodb://admin:admin123@localhost:27017/society-booking?authSource=admin"

# From within the container
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

---

## Troubleshooting

### Port Already in Use

**Error:** `port is already allocated`

**Solution:**
```bash
# Check what's using the port
lsof -i :5000  # For backend
lsof -i :27017 # For MongoDB

# Kill the process or change ports in docker-compose.yml
```

### MongoDB Not Starting

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Backend Can't Connect to MongoDB

```bash
# Check if MongoDB is healthy
docker-compose ps

# Restart services in order
docker-compose restart mongodb
docker-compose restart backend
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all -v

# Start fresh
docker-compose up --build -d
```

### View Detailed Container Info

```bash
# Inspect container
docker inspect society-booking-backend
docker inspect society-booking-mongodb

# Check health status
docker inspect --format='{{.State.Health.Status}}' society-booking-backend
```

---

## Development Workflow

### Hot Reload

The backend uses nodemon for hot reloading. Your code changes will automatically restart the server.

```bash
# Edit files in backend/
# Watch logs to see restart
docker-compose logs -f backend
```

### Install New Dependencies

```bash
# Install new package
docker-compose exec backend npm install <package-name>

# Rebuild container to persist changes
docker-compose up -d --build backend
```

### Run Tests

```bash
docker-compose exec backend npm test
```

### Database Backup

```bash
# Backup
docker-compose exec mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/society-booking?authSource=admin" --out=/backup

# Restore
docker-compose exec mongodb mongorestore --uri="mongodb://admin:admin123@localhost:27017/society-booking?authSource=admin" /backup/society-booking
```

---

## Production Deployment

For production, update `docker-compose.yml`:

1. **Change MongoDB credentials**
2. **Use production JWT secrets**
3. **Add real Razorpay keys**
4. **Set NODE_ENV=production**
5. **Configure proper volumes**
6. **Add reverse proxy (nginx)**
7. **Enable SSL/TLS**

Example production compose file: `docker-compose.prod.yml`

---

## Frontend Setup

The frontend runs separately with Expo:

```bash
# In a new terminal
cd frontend
npm install
npx expo start
```

Make sure to update `frontend/src/services/api.ts` to point to:
```typescript
const API_BASE_URL = 'http://localhost:5000/api/v1';
```

---

## Cleanup

### Remove All Docker Resources

```bash
# Stop all containers
docker-compose down

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Nuclear option: remove everything
docker system prune -a --volumes
```

---

## Support

- Backend API Docs: http://localhost:5000/api/v1
- Health Check: http://localhost:5000/api/v1/health
- MongoDB: http://localhost:27017

For issues, check logs:
```bash
docker-compose logs -f
```
