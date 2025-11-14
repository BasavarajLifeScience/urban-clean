const mongoose = require('mongoose');
const Service = require('../models/Service');
const Category = require('../models/Category');
require('dotenv').config();

// Sample Categories
const categories = [
  {
    name: 'Plumbing',
    icon: 'wrench',
    description: 'Professional plumbing services for your home',
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Electrical',
    icon: 'flash',
    description: 'Licensed electrical services and repairs',
    isActive: true,
    displayOrder: 2,
  },
  {
    name: 'Cleaning',
    icon: 'broom',
    description: 'Complete home and office cleaning solutions',
    isActive: true,
    displayOrder: 3,
  },
  {
    name: 'Carpentry',
    icon: 'hammer',
    description: 'Custom carpentry and furniture repair',
    isActive: true,
    displayOrder: 4,
  },
  {
    name: 'Painting',
    icon: 'brush',
    description: 'Interior and exterior painting services',
    isActive: true,
    displayOrder: 5,
  },
  {
    name: 'AC & Appliances',
    icon: 'snowflake',
    description: 'AC installation, repair and appliance maintenance',
    isActive: true,
    displayOrder: 6,
  },
];

// Sample Services
const services = [
  // Plumbing Services
  {
    name: 'Tap Repair & Installation',
    description: 'Professional tap repair and installation services. We fix leaky taps, install new faucets, and replace damaged fixtures.',
    category: 'Plumbing',
    subcategory: 'Repairs',
    basePrice: 250,
    priceUnit: 'per service',
    duration: 60,
    isActive: true,
    tags: ['tap', 'faucet', 'leak', 'repair'],
    features: [
      'Quick response time',
      'All parts included',
      '30-day service warranty',
      'Experienced technicians',
    ],
    faqs: [
      {
        question: 'How long does tap repair take?',
        answer: 'Most tap repairs are completed within 30-60 minutes.',
      },
      {
        question: 'Do you provide parts?',
        answer: 'Yes, all necessary parts are included in the service price.',
      },
    ],
    averageRating: 4.5,
    totalRatings: 45,
    bookingCount: 120,
  },
  {
    name: 'Toilet Repair & Maintenance',
    description: 'Complete toilet repair and maintenance services including flush repair, seat replacement, and blockage removal.',
    category: 'Plumbing',
    subcategory: 'Repairs',
    basePrice: 350,
    priceUnit: 'per service',
    duration: 90,
    isActive: true,
    tags: ['toilet', 'flush', 'blockage', 'repair'],
    features: [
      'Same day service',
      'Quality parts',
      'Certified plumbers',
      '60-day warranty',
    ],
    faqs: [
      {
        question: 'Can you fix running toilets?',
        answer: 'Yes, we fix all types of toilet issues including running toilets.',
      },
    ],
    averageRating: 4.7,
    totalRatings: 67,
    bookingCount: 156,
  },
  {
    name: 'Pipe Leak Repair',
    description: 'Fast and reliable pipe leak detection and repair. We handle all types of pipe leaks including hidden leaks.',
    category: 'Plumbing',
    subcategory: 'Repairs',
    basePrice: 450,
    priceUnit: 'per service',
    duration: 120,
    isActive: true,
    tags: ['pipe', 'leak', 'water', 'repair'],
    features: [
      'Leak detection included',
      'Permanent solutions',
      'No mess guarantee',
      '90-day warranty',
    ],
    averageRating: 4.6,
    totalRatings: 52,
    bookingCount: 98,
  },

  // Electrical Services
  {
    name: 'Switch & Socket Repair',
    description: 'Professional switch and socket repair/replacement. We handle all types of switches and socket issues.',
    category: 'Electrical',
    subcategory: 'Repairs',
    basePrice: 200,
    priceUnit: 'per service',
    duration: 45,
    isActive: true,
    tags: ['switch', 'socket', 'electrical', 'repair'],
    features: [
      'Licensed electricians',
      'ISI marked parts',
      'Safety guaranteed',
      '45-day warranty',
    ],
    averageRating: 4.8,
    totalRatings: 89,
    bookingCount: 234,
  },
  {
    name: 'Fan Installation & Repair',
    description: 'Ceiling fan and exhaust fan installation, repair, and maintenance services.',
    category: 'Electrical',
    subcategory: 'Installation',
    basePrice: 300,
    priceUnit: 'per service',
    duration: 60,
    isActive: true,
    tags: ['fan', 'ceiling fan', 'installation', 'repair'],
    features: [
      'All fan types',
      'Balancing included',
      'Professional installation',
      '60-day warranty',
    ],
    averageRating: 4.5,
    totalRatings: 71,
    bookingCount: 167,
  },
  {
    name: 'Wiring & Rewiring',
    description: 'Complete house wiring and rewiring services. Safe and reliable electrical solutions.',
    category: 'Electrical',
    subcategory: 'Installation',
    basePrice: 150,
    priceUnit: 'per point',
    duration: 180,
    isActive: true,
    tags: ['wiring', 'rewiring', 'electrical', 'installation'],
    features: [
      'MCB installation',
      'Earthing included',
      'Safety certified',
      '1-year warranty',
    ],
    averageRating: 4.9,
    totalRatings: 34,
    bookingCount: 76,
  },

  // Cleaning Services
  {
    name: 'Deep Home Cleaning',
    description: 'Comprehensive deep cleaning service for your entire home. Includes kitchen, bathrooms, bedrooms, and living areas.',
    category: 'Cleaning',
    subcategory: 'Deep Cleaning',
    basePrice: 2500,
    priceUnit: 'per service',
    duration: 240,
    isActive: true,
    tags: ['cleaning', 'deep clean', 'home', 'sanitization'],
    features: [
      'Eco-friendly products',
      'Trained professionals',
      'All rooms covered',
      'Satisfaction guaranteed',
    ],
    faqs: [
      {
        question: 'What areas are covered?',
        answer: 'All rooms including kitchen, bathrooms, bedrooms, living room, and balconies.',
      },
      {
        question: 'Do I need to provide cleaning supplies?',
        answer: 'No, we bring all necessary cleaning supplies and equipment.',
      },
    ],
    averageRating: 4.7,
    totalRatings: 123,
    bookingCount: 289,
  },
  {
    name: 'Bathroom Deep Cleaning',
    description: 'Specialized bathroom deep cleaning including tiles, fixtures, and sanitization.',
    category: 'Cleaning',
    subcategory: 'Deep Cleaning',
    basePrice: 600,
    priceUnit: 'per bathroom',
    duration: 90,
    isActive: true,
    tags: ['bathroom', 'cleaning', 'sanitization', 'tiles'],
    features: [
      'Descaling included',
      'Anti-bacterial treatment',
      'Grout cleaning',
      'Drain cleaning',
    ],
    averageRating: 4.6,
    totalRatings: 98,
    bookingCount: 234,
  },
  {
    name: 'Kitchen Deep Cleaning',
    description: 'Complete kitchen cleaning including cabinets, chimney, and appliances.',
    category: 'Cleaning',
    subcategory: 'Deep Cleaning',
    basePrice: 800,
    priceUnit: 'per service',
    duration: 120,
    isActive: true,
    tags: ['kitchen', 'cleaning', 'chimney', 'appliances'],
    features: [
      'Chimney cleaning',
      'Appliance cleaning',
      'Cabinet deep clean',
      'Degreasing included',
    ],
    averageRating: 4.8,
    totalRatings: 76,
    bookingCount: 198,
  },

  // Carpentry Services
  {
    name: 'Furniture Assembly',
    description: 'Professional furniture assembly services for all types of furniture.',
    category: 'Carpentry',
    subcategory: 'Assembly',
    basePrice: 500,
    priceUnit: 'per item',
    duration: 90,
    isActive: true,
    tags: ['furniture', 'assembly', 'installation'],
    features: [
      'All furniture types',
      'Tools included',
      'Quick service',
      'Damage protection',
    ],
    averageRating: 4.5,
    totalRatings: 54,
    bookingCount: 132,
  },
  {
    name: 'Door & Window Repair',
    description: 'Door and window repair services including hinges, handles, and frame repairs.',
    category: 'Carpentry',
    subcategory: 'Repairs',
    basePrice: 350,
    priceUnit: 'per service',
    duration: 60,
    isActive: true,
    tags: ['door', 'window', 'hinge', 'repair'],
    features: [
      'All door/window types',
      'Lock repair',
      'Alignment fixing',
      '30-day warranty',
    ],
    averageRating: 4.4,
    totalRatings: 43,
    bookingCount: 87,
  },

  // Painting Services
  {
    name: 'Interior Wall Painting',
    description: 'Professional interior wall painting with premium quality paints.',
    category: 'Painting',
    subcategory: 'Interior',
    basePrice: 18,
    priceUnit: 'per sqft',
    duration: 480,
    isActive: true,
    tags: ['painting', 'interior', 'walls', 'home'],
    features: [
      'Premium paints',
      'Professional painters',
      'Furniture covering',
      '1-year warranty',
    ],
    averageRating: 4.7,
    totalRatings: 67,
    bookingCount: 145,
  },
  {
    name: 'Exterior Wall Painting',
    description: 'Durable exterior wall painting with weather-resistant paints.',
    category: 'Painting',
    subcategory: 'Exterior',
    basePrice: 22,
    priceUnit: 'per sqft',
    duration: 600,
    isActive: true,
    tags: ['painting', 'exterior', 'walls', 'weatherproof'],
    features: [
      'Weatherproof paints',
      'Surface preparation',
      'Crack filling',
      '2-year warranty',
    ],
    averageRating: 4.6,
    totalRatings: 45,
    bookingCount: 92,
  },

  // AC & Appliances
  {
    name: 'AC Service & Repair',
    description: 'Complete AC servicing, gas refilling, and repair services for all AC brands.',
    category: 'AC & Appliances',
    subcategory: 'AC Services',
    basePrice: 450,
    priceUnit: 'per service',
    duration: 90,
    isActive: true,
    tags: ['ac', 'air conditioner', 'service', 'repair'],
    features: [
      'All brands covered',
      'Gas refilling available',
      'Deep cleaning',
      '60-day warranty',
    ],
    averageRating: 4.8,
    totalRatings: 134,
    bookingCount: 321,
  },
  {
    name: 'Washing Machine Repair',
    description: 'Expert washing machine repair for all brands. We fix all types of issues.',
    category: 'AC & Appliances',
    subcategory: 'Appliance Repair',
    basePrice: 350,
    priceUnit: 'per service',
    duration: 75,
    isActive: true,
    tags: ['washing machine', 'repair', 'appliance'],
    features: [
      'All brands',
      'Genuine parts',
      'Same day service',
      '90-day warranty',
    ],
    averageRating: 4.6,
    totalRatings: 87,
    bookingCount: 198,
  },
  {
    name: 'Refrigerator Repair',
    description: 'Professional refrigerator and freezer repair services for all major brands.',
    category: 'AC & Appliances',
    subcategory: 'Appliance Repair',
    basePrice: 400,
    priceUnit: 'per service',
    duration: 90,
    isActive: true,
    tags: ['refrigerator', 'fridge', 'repair', 'appliance'],
    features: [
      'All refrigerator types',
      'Gas charging',
      'Compressor repair',
      '90-day warranty',
    ],
    averageRating: 4.7,
    totalRatings: 76,
    bookingCount: 167,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/society-booking';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing services and categories...');
    await Service.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert categories
    console.log('📂 Inserting categories...');
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert services
    console.log('🛠️  Inserting services...');
    const insertedServices = await Service.insertMany(services);
    console.log(`✅ Inserted ${insertedServices.length} services`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Categories: ${insertedCategories.length}`);
    console.log(`   Services: ${insertedServices.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
