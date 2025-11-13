require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Service = require('../models/Service');
const Category = require('../models/Category');
const NotificationSettings = require('../models/NotificationSettings');
const logger = require('./logger');

const seedData = async () => {
  try {
    await connectDatabase();

    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});
    await NotificationSettings.deleteMany({});

    console.log('✅ Cleared existing data\n');

    // Create users
    const users = await User.create([
      {
        phoneNumber: '+919876543210',
        email: 'resident@example.com',
        password: 'password123',
        role: 'resident',
        fullName: 'John Resident',
        isVerified: true,
        isActive: true,
      },
      {
        phoneNumber: '+919876543211',
        email: 'sevak@example.com',
        password: 'password123',
        role: 'sevak',
        fullName: 'Mike Sevak',
        isVerified: true,
        isActive: true,
      },
      {
        phoneNumber: '+919876543212',
        email: 'vendor@example.com',
        password: 'password123',
        role: 'vendor',
        fullName: 'Sarah Vendor',
        isVerified: true,
        isActive: true,
      },
    ]);

    console.log('✅ Created users');
    console.log('   📧 Resident: resident@example.com / password123');
    console.log('   📧 Sevak: sevak@example.com / password123');
    console.log('   📧 Vendor: vendor@example.com / password123\n');

    // Create profiles
    await Profile.create([
      {
        userId: users[0]._id,
        firstName: 'John',
        lastName: 'Resident',
        address: {
          flatNumber: '101',
          building: 'A Block',
          society: 'Green Valley',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        profileCompletionPercentage: 80,
      },
      {
        userId: users[1]._id,
        firstName: 'Mike',
        lastName: 'Sevak',
        skills: ['Cleaning', 'Plumbing', 'Electrical'],
        experience: 5,
        bio: 'Experienced service professional with 5 years of experience',
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          timeSlots: ['09:00-12:00', '14:00-18:00'],
        },
        profileCompletionPercentage: 90,
      },
      {
        userId: users[2]._id,
        firstName: 'Sarah',
        lastName: 'Vendor',
        businessName: 'Clean Pro Services',
        businessType: 'Cleaning Services',
        servicesOffered: ['Deep Cleaning', 'Carpet Cleaning', 'Pest Control'],
        profileCompletionPercentage: 85,
      },
    ]);

    console.log('✅ Created profiles\n');

    // Create notification settings
    await NotificationSettings.create(
      users.map(user => ({ userId: user._id }))
    );

    console.log('✅ Created notification settings\n');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Cleaning',
        icon: 'cleaning-services',
        description: 'Professional cleaning services',
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'Plumbing',
        icon: 'plumbing',
        description: 'Plumbing repair and maintenance',
        isActive: true,
        displayOrder: 2,
      },
      {
        name: 'Electrical',
        icon: 'electrical-services',
        description: 'Electrical services and repairs',
        isActive: true,
        displayOrder: 3,
      },
      {
        name: 'Carpentry',
        icon: 'carpenter',
        description: 'Carpentry and furniture services',
        isActive: true,
        displayOrder: 4,
      },
      {
        name: 'Painting',
        icon: 'format-paint',
        description: 'Painting and decorating services',
        isActive: true,
        displayOrder: 5,
      },
    ]);

    console.log('✅ Created categories\n');

    // Create services
    const services = await Service.create([
      {
        name: 'Home Deep Cleaning',
        description: 'Complete deep cleaning of your home including all rooms, kitchen, and bathrooms',
        category: 'Cleaning',
        basePrice: 1500,
        duration: 180,
        isActive: true,
        tags: ['deep cleaning', 'home cleaning', 'professional'],
        features: [
          'Complete house cleaning',
          'Kitchen deep cleaning',
          'Bathroom sanitization',
          'Dusting and mopping',
        ],
        faqs: [
          {
            question: 'How long does the service take?',
            answer: 'Typically 3-4 hours depending on the size of your home',
          },
          {
            question: 'Do I need to provide cleaning supplies?',
            answer: 'No, we bring all necessary cleaning supplies and equipment',
          },
        ],
        averageRating: 4.5,
        totalRatings: 120,
        bookingCount: 145,
      },
      {
        name: 'Bathroom Cleaning',
        description: 'Professional bathroom cleaning and sanitization service',
        category: 'Cleaning',
        basePrice: 500,
        duration: 60,
        isActive: true,
        tags: ['bathroom', 'sanitization', 'cleaning'],
        features: [
          'Toilet cleaning',
          'Sink and faucet cleaning',
          'Floor cleaning',
          'Mirror and tile cleaning',
        ],
        averageRating: 4.7,
        totalRatings: 85,
        bookingCount: 98,
      },
      {
        name: 'Plumbing Repair',
        description: 'Fix leaky taps, clogged drains, and other plumbing issues',
        category: 'Plumbing',
        basePrice: 800,
        duration: 90,
        isActive: true,
        tags: ['plumbing', 'repair', 'leaks'],
        features: [
          'Leak detection and repair',
          'Drain cleaning',
          'Tap and faucet repair',
          'Pipe repair',
        ],
        averageRating: 4.6,
        totalRatings: 67,
        bookingCount: 78,
      },
      {
        name: 'Electrical Repair',
        description: 'Electrical repairs and installations by certified electricians',
        category: 'Electrical',
        basePrice: 700,
        duration: 90,
        isActive: true,
        tags: ['electrical', 'repair', 'installation'],
        features: [
          'Switch and socket repair',
          'Light fixture installation',
          'Wiring repairs',
          'Circuit breaker fixes',
        ],
        averageRating: 4.8,
        totalRatings: 92,
        bookingCount: 105,
      },
      {
        name: 'Furniture Assembly',
        description: 'Professional furniture assembly and installation service',
        category: 'Carpentry',
        basePrice: 600,
        duration: 120,
        isActive: true,
        tags: ['carpentry', 'furniture', 'assembly'],
        features: [
          'Furniture assembly',
          'Wall mounting',
          'Minor repairs',
          'Tool and hardware included',
        ],
        averageRating: 4.4,
        totalRatings: 54,
        bookingCount: 62,
      },
      {
        name: 'Room Painting',
        description: 'Interior painting service for rooms and walls',
        category: 'Painting',
        basePrice: 2500,
        priceUnit: 'per room',
        duration: 480,
        isActive: true,
        tags: ['painting', 'interior', 'room'],
        features: [
          'Wall preparation',
          'Premium quality paint',
          'Clean finish',
          '1 year warranty',
        ],
        averageRating: 4.6,
        totalRatings: 43,
        bookingCount: 51,
      },
      {
        name: 'Kitchen Deep Cleaning',
        description: 'Specialized kitchen cleaning including appliances and cabinets',
        category: 'Cleaning',
        basePrice: 1200,
        duration: 150,
        isActive: true,
        tags: ['kitchen', 'deep cleaning', 'appliances'],
        features: [
          'Appliance cleaning',
          'Cabinet cleaning',
          'Countertop sanitization',
          'Floor cleaning',
        ],
        averageRating: 4.7,
        totalRatings: 78,
        bookingCount: 89,
      },
      {
        name: 'AC Repair & Service',
        description: 'Air conditioner repair and maintenance service',
        category: 'Electrical',
        basePrice: 900,
        duration: 120,
        isActive: true,
        tags: ['ac', 'repair', 'service', 'maintenance'],
        features: [
          'AC cleaning',
          'Gas refilling',
          'Filter replacement',
          'Cooling check',
        ],
        averageRating: 4.5,
        totalRatings: 112,
        bookingCount: 134,
      },
    ]);

    console.log('✅ Created services\n');

    // Update user profile completion flags
    users[0].isProfileComplete = true;
    users[1].isProfileComplete = true;
    users[2].isProfileComplete = true;
    await Promise.all(users.map(u => u.save()));

    console.log('✅ Updated user profiles\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Services: ${services.length}\n`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();
