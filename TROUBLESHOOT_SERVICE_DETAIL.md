# Troubleshooting: Service Detail Data Not Visible

This guide helps you diagnose and fix issues where service detail data is not showing in the frontend.

## 🔍 Diagnosis Steps

### Step 1: Check Console Logs

When you open a service detail screen, you should see these logs in your Expo console:

```
📋 [ServiceDetailScreen] Loading service: <serviceId>
📥 [ServiceDetailScreen] API Response: {...}
✅ [ServiceDetailScreen] Service data: {...}
📋 [ServiceDetailScreen] Service fields: {
  name: "...",
  description: "...",
  category: "...",
  subcategory: "...",
  basePrice: ###,
  priceUnit: "...",
  duration: ###,
  isActive: true/false,
  features: [...],
  faqs: [...],
  tags: [...],
  averageRating: #.#,
  totalRatings: ##,
  bookingCount: ###,
  imageUrl: "..."
}
```

**If you see these logs**: The data is being fetched correctly. Skip to Step 4.

**If you don't see these logs or see error logs**: Continue to Step 2.

### Step 2: Check if Services Exist in Database

Run this command to check if services are populated:

```bash
# Using curl (from your local machine, not inside container)
curl http://localhost:5001/api/v1/services
```

**Expected Response**: JSON with array of services
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [...],
  "pagination": {...}
}
```

**If you get an empty array or no services**:
- The database needs to be seeded
- Go to Step 3

**If you get connection error**:
- Backend is not running
- Check: `docker ps | grep backend`
- Start it: `cd backend && docker-compose up -d`

### Step 3: Populate the Database

**Run the seed script:**

```bash
# Method 1: Using Docker (Recommended)
docker exec -it society-booking-backend npm run seed

# Method 2: Direct execution (if Docker not available)
cd backend
node src/scripts/seed-services.js
```

**Expected Output:**
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

After seeding, **reload your Expo app** (press 'R' or shake device → Reload).

### Step 4: Verify Data is Rendering

If data is being fetched but not visible, check for these rendering issues:

#### 4.1 Check for White Text on White Background

The description text color is `colors.gray[700]`. If you see a blank screen but logs show data, try:

1. Scroll down to see if content is below the fold
2. Check if text is rendering (it might be white on white)

#### 4.2 Check Conditional Rendering

Some sections only show if data exists:
- **Features**: Only shows if `features.length > 0`
- **FAQs**: Only shows if `faqs.length > 0`
- **Tags**: Only shows if `tags.length > 0`
- **Duration**: Only shows if `duration` exists
- **Rating**: Only shows if `averageRating > 0`

Core sections (Name, Price, Description) always show.

#### 4.3 Verify Field Names Match

Check console logs show correct field names:
- `basePrice` (not `price`)
- `priceUnit` (not `pricingModel`)
- `duration` (not `estimatedDuration`)
- `isActive` (not `isAvailable`)

## 🐛 Common Issues & Solutions

### Issue 1: "Service not found" Error

**Symptoms**: Screen shows error message instead of service details

**Cause**: Invalid service ID or service doesn't exist

**Solution**:
1. Check the serviceId in logs
2. Verify service exists: `curl http://localhost:5001/api/v1/services/{serviceId}`
3. Re-seed database if needed

### Issue 2: Loading Screen Never Ends

**Symptoms**: Shows "Loading details..." forever

**Cause**: API call is hanging or failing silently

**Solution**:
1. Check backend logs: `docker logs society-booking-backend`
2. Test API manually: `curl http://localhost:5001/api/v1/services/{serviceId}`
3. Check network connection in Expo
4. Verify API URL in `app.json` is correct (`http://localhost:5001/api/v1`)

### Issue 3: Some Fields Missing

**Symptoms**: Name and price show, but no description/features/FAQs

**Cause**: Service data is incomplete in database

**Solution**:
1. Check console logs to see which fields are `null` or `undefined`
2. Re-run seed script to populate complete data
3. Or manually update the service via API/MongoDB

### Issue 4: Can't See Service Cards in List

**Symptoms**: Services list is empty, can't navigate to detail screen

**Cause**: Services not populated or filter is hiding them

**Solution**:
1. Seed the database (Step 3)
2. Check category filter - try "All" category
3. Clear any search filters

## 📱 Testing Checklist

After making changes, verify:

- [ ] Backend is running (`docker ps`)
- [ ] Database is seeded (18 services exist)
- [ ] Frontend can reach backend (check network)
- [ ] Service list shows all 18 services
- [ ] Clicking a service navigates to detail screen
- [ ] Detail screen shows:
  - [ ] Service name
  - [ ] Category and subcategory badges
  - [ ] Price and price unit
  - [ ] Description
  - [ ] Features (checkmarked list)
  - [ ] FAQs (Q&A format)
  - [ ] Tags (keyword chips)
  - [ ] Duration
  - [ ] Availability status
  - [ ] Rating and review count
  - [ ] Booking count stats
  - [ ] "Book Service" button

## 🔬 Advanced Debugging

### Check Raw API Response

```bash
# Get a list of services first
curl http://localhost:5001/api/v1/services | jq '.data[0]._id'

# Then get details for that specific service
SERVICE_ID="<paste-id-here>"
curl http://localhost:5001/api/v1/services/$SERVICE_ID | jq '.'
```

### Check MongoDB Directly

```bash
# Access MongoDB shell
docker exec -it mongodb mongosh urban_clean

# Count services
db.services.countDocuments()

# View a sample service
db.services.findOne()

# Check specific fields
db.services.findOne({}, {
  name: 1,
  description: 1,
  category: 1,
  basePrice: 1,
  features: 1,
  faqs: 1,
  tags: 1
})
```

### Enable Network Debugging in Expo

1. Shake device or press Cmd+D (iOS) / Cmd+M (Android)
2. Select "Toggle Element Inspector"
3. Check if service data is in React component state

## 💡 Quick Fixes

### Nuclear Option: Reset Everything

```bash
# Stop all containers
cd backend
docker-compose down

# Remove volumes (WARNING: Deletes all data)
docker volume prune -f

# Start fresh
docker-compose up -d

# Seed database
docker exec -it society-booking-backend npm run seed

# Reload frontend
# Press 'R' in Expo terminal
```

## ✅ Expected Behavior

When working correctly:

1. Navigate to Services tab → See list of 18 services
2. Tap any service → Detail screen loads within 1-2 seconds
3. See complete service information:
   - Header with name, category, subcategory
   - Rating badge (4.4-4.9 stars)
   - Stats showing booking count and review count
   - Price card with amount and unit
   - Full description paragraph
   - "What's Included" section with 3-4 bullet points
   - "FAQs" section with 2 questions
   - "Related Keywords" section with 3-4 tags
   - Duration (45-600 minutes)
   - "Available Now" green badge
4. Can click "Book Service" button to create booking

## 📞 Still Having Issues?

Check the console logs and share:
1. The complete `📋 [ServiceDetailScreen] Service fields:` output
2. Any error messages (lines starting with ❌)
3. The result of: `curl http://localhost:5001/api/v1/services`

This will help identify the exact issue!
