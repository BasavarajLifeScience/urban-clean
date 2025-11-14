# Society Booking Admin Dashboard

Admin dashboard for managing the Society Booking Application.

## Getting Started

### Prerequisites
- Node.js 20+ LTS
- Backend API running on port 5001

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the admin-dashboard directory:

```bash
cp .env.example .env.local
```

The default configuration connects to the backend API at `http://localhost:5001/api/v1`. Update if your backend runs on a different port.

### Running the Backend

The admin dashboard requires the backend API to be running. From the project root:

```bash
# Using Docker (recommended)
docker-compose up -d

# Or run the backend directly
cd backend
npm install
npm run dev
```

Make sure to run the seed script to create the admin user:

```bash
cd backend
npm run seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the admin dashboard.

### Login Credentials

```
Email: superadmin@societybooking.com
Password: Admin@123
Admin Code: SA001
```

## Features

- 📊 Dashboard with real-time statistics
- 👥 User management (Sevaks, Residents, Vendors)
- 📝 Booking management and assignment
- 📈 Analytics and reporting
- ⚙️ Platform settings
- 🎁 Offers and promotions
- 📢 Broadcast notifications

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - API client
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Troubleshooting

### Login Issues

**Screen refreshes on login:**
- Check browser console (F12) for error messages
- Verify the backend API is running on port 5001
- Ensure the admin user was created via the seed script
- Check network tab for failed API requests

**"Network Error" or "Failed to fetch":**
- Make sure the backend is running: `docker-compose ps` or check `http://localhost:5001/health`
- Verify CORS is enabled in backend (should be enabled by default in development)
- Check that the API URL in `.env.local` matches your backend configuration

**Invalid credentials (401 error):**
- **Most common cause**: Admin user not seeded in database
  - Solution: Run `cd backend && npm run seed` to create the admin user
- Ensure you're using the correct demo credentials (see Login Credentials above)
- Verify the backend is connected to MongoDB
- Check admin code is uppercase (SA001)
- If using Docker: Make sure to run seed inside the container: `docker-compose exec backend npm run seed`

### API Endpoints

All frontend API calls connect to the following backend endpoints:

- **Auth**: `POST /api/v1/auth/admin-login`
- **Dashboard**: `GET /api/v1/admin/dashboard/overview`
- **Sevaks**: `GET /api/v1/admin/sevaks`
- **Bookings**: `GET /api/v1/admin/bookings`
- **Analytics**: `GET /api/v1/admin/analytics/revenue`
- **Settings**: `GET /api/v1/admin/settings`
- **Offers**: `GET /api/v1/admin/offers`

All endpoints (except login) require authentication via JWT token in the `Authorization: Bearer <token>` header.
