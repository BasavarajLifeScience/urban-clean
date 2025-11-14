# Populating Services Data

This guide explains how to populate the database with sample service data.

## 📋 What Gets Created

The seed script creates:
- **6 Categories**: Plumbing, Electrical, Cleaning, Carpentry, Painting, AC & Appliances
- **18 Services** with complete details:
  - Realistic pricing (₹200 to ₹2500)
  - Service durations (45 to 600 minutes)
  - Features and FAQs
  - Ratings (4.4 to 4.9 stars)
  - Booking counts
  - Tags for search functionality

## 🚀 Running the Seed Script

### Method 1: Using Docker (Recommended)

```bash
# Make sure the backend container is running
docker ps | grep society-booking-backend

# Run the seed script inside the container
docker exec -it society-booking-backend npm run seed
```

Expected output:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing services and categories...
✅ Cleared existing data
📂 Inserting categories...
✅ Inserted 6 categories
🛠️  Inserting services...
✅ Inserted 18 services

🎉 Database seeded successfully!

📊 Summary:
   Categories: 6
   Services: 18
```

### Method 2: Direct MongoDB Connection

If you prefer to connect directly:

```bash
cd backend
node src/scripts/seed-services.js
```

## 🔍 Verifying the Data

After running the seed script, verify the data:

### Check Categories
```bash
curl http://localhost:5001/api/v1/services/categories
```

### Check Services
```bash
curl http://localhost:5001/api/v1/services
```

### Check Specific Service
```bash
curl http://localhost:5001/api/v1/services/{serviceId}
```

## 📱 Testing in the App

After seeding:

1. **Reload your frontend app** (press 'R' in Expo)
2. **Login** with a registered account
3. Navigate to **Services** tab
4. You should see:
   - 6 category chips at the top
   - 18 service cards with complete information
   - Search functionality
   - Category filtering

## 🎨 Sample Services Included

### Plumbing (3 services)
- Tap Repair & Installation - ₹250
- Toilet Repair & Maintenance - ₹350
- Pipe Leak Repair - ₹450

### Electrical (3 services)
- Switch & Socket Repair - ₹200
- Fan Installation & Repair - ₹300
- Wiring & Rewiring - ₹150/point

### Cleaning (3 services)
- Deep Home Cleaning - ₹2500
- Bathroom Deep Cleaning - ₹600
- Kitchen Deep Cleaning - ₹800

### Carpentry (2 services)
- Furniture Assembly - ₹500
- Door & Window Repair - ₹350

### Painting (2 services)
- Interior Wall Painting - ₹18/sqft
- Exterior Wall Painting - ₹22/sqft

### AC & Appliances (3 services)
- AC Service & Repair - ₹450
- Washing Machine Repair - ₹350
- Refrigerator Repair - ₹400

## 🔄 Re-seeding

To clear and re-seed the data:

```bash
docker exec -it society-booking-backend npm run seed
```

**Note**: This will delete all existing services and categories before inserting new data.

## 🐛 Troubleshooting

### Container not found
```bash
# Check if container is running
docker ps

# If not running, start it
docker-compose up -d backend
```

### Connection errors
```bash
# Check backend logs
docker logs society-booking-backend

# Verify MongoDB is running
docker ps | grep mongodb
```

### Data not showing in app
1. Clear app cache (shake device → Reload)
2. Check backend logs for errors
3. Verify API endpoint is reachable: `curl http://localhost:5001/api/v1/services`

## ✅ Success Indicators

You'll know the seed was successful when:
- ✅ Console shows "Database seeded successfully"
- ✅ Categories endpoint returns 6 categories
- ✅ Services endpoint returns 18 services
- ✅ Frontend Services screen shows all services with images and details
