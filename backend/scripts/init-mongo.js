// MongoDB initialization script
// This runs automatically when the MongoDB container starts for the first time

db = db.getSiblingDB('society-booking');

// Create collections with indexes
db.createCollection('users');
db.createCollection('profiles');
db.createCollection('categories');
db.createCollection('services');
db.createCollection('bookings');
db.createCollection('invoices');
db.createCollection('payments');
db.createCollection('ratings');
db.createCollection('notifications');
db.createCollection('notificationsettings');
db.createCollection('refreshtokens');

print('Society Booking Database initialized successfully!');
