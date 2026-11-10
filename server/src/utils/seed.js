import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Coupon } from '../models/Coupon.js';
import { Address } from '../models/Address.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Coupon.deleteMany({}),
      Address.deleteMany({}),
    ]);
    console.log('[Seed] Cleaned existing collections');

    // 1. Create Users with specification roles: 'customer', 'vendor', 'admin'
    const admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@marketsphere.com',
      password: 'Password123!',
      role: 'admin',
      phone: '9876543210',
    });

    const techVendorUser = await User.create({
      name: 'Apex Electronics Pvt Ltd',
      email: 'vendor@apextech.com',
      password: 'Password123!',
      role: 'vendor',
      phone: '9820098200',
    });

    const styleVendorUser = await User.create({
      name: 'Urban Threads Studio',
      email: 'vendor@urbanthreads.com',
      password: 'Password123!',
      role: 'vendor',
      phone: '9811198111',
    });

    const customer = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'Password123!',
      role: 'customer',
      phone: '9833398333',
    });

    // 2. Create Vendor Profiles with Indian Tax & Bank Identifiers
    const techVendor = await Vendor.create({
      userId: techVendorUser._id,
      businessName: 'Apex Electronics Pvt Ltd',
      storeSlug: 'apex-electronics',
      description: 'Authorized retailer of high-performance wireless audio, laptops, and smart consumer electronics.',
      gstin: '27AABCU9603R1ZN', // Maharashtra state GSTIN format
      pan: 'AABCU9603R',
      bankDetails: {
        accountHolderName: 'Apex Electronics Pvt Ltd',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0000123',
        bankName: 'HDFC Bank',
        branch: 'Nariman Point, Mumbai',
      },
      address: {
        street: 'Unit 402, Trade World B Wing, Senapati Bapat Marg, Lower Parel',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400013',
        country: 'India',
      },
      commissionRate: 10.0,
      rating: 4.8,
      ratingCount: 142,
      isVerified: true,
      status: 'approved',
    });

    const styleVendor = await Vendor.create({
      userId: styleVendorUser._id,
      businessName: 'Urban Threads Studio',
      storeSlug: 'urban-threads',
      description: 'Contemporary sustainable apparel, artisanal leather goods, and minimal timepieces.',
      gstin: '29ABCDE1234F1Z5', // Karnataka state GSTIN format
      pan: 'ABCDE1234F',
      bankDetails: {
        accountHolderName: 'Urban Threads Studio',
        accountNumber: '91802001234567',
        ifscCode: 'UTIB0000045',
        bankName: 'Axis Bank',
        branch: 'Indiranagar, Bengaluru',
      },
      address: {
        street: '72, 100 Feet Road, HAL 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      commissionRate: 12.0,
      rating: 4.7,
      ratingCount: 88,
      isVerified: true,
      status: 'approved',
    });

    // Link vendor IDs to User accounts
    techVendorUser.vendorId = techVendor._id;
    await techVendorUser.save();
    styleVendorUser.vendorId = styleVendor._id;
    await styleVendorUser.save();

    // 3. Create Customer Address (Indian Address Spec)
    await Address.create({
      userId: customer._id,
      fullName: 'Alex Johnson',
      phone: '9833398333',
      street: 'Flat 1204, Tower B, Godrej Platinum, Vikhroli East',
      landmark: 'Near Eastern Express Highway',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400079',
      country: 'India',
      addressType: 'home',
      isDefault: true,
    });

    // 4. Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Electronics & Audio',
        slug: 'electronics',
        description: 'Laptops, wireless headphones, smart devices, and accessories',
        icon: 'Headphones',
        displayOrder: 1,
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion',
        description: 'Modern men and women designer wear, shoes, and lifestyle pieces',
        icon: 'Shirt',
        displayOrder: 2,
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Smart appliances, ergonomic workspace furniture, and decor',
        icon: 'Home',
        displayOrder: 3,
      },
      {
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        description: 'Fitness trackers, premium gym equipment, and outdoor travel gear',
        icon: 'Activity',
        displayOrder: 4,
      },
      {
        name: 'Books & Stationery',
        slug: 'books',
        description: 'Curated technical books, bestselling literature, and luxury notebooks',
        icon: 'BookOpen',
        displayOrder: 5,
      },
    ]);

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 5. Create Sample Products with Indian Rupee (₹) Pricing
    const sampleProducts = [
      {
        title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        description:
          'Industry-leading active noise canceling with two processors and 8 microphones. Ultra-comfortable lightweight design with soft fit leather, 30-hour battery life, and crystal-clear hands-free calling.',
        vendorId: techVendorUser._id,
        categoryId: catMap['electronics'],
        price: 29990.0,
        discountPrice: 26990.0,
        stock: 35,
        sku: 'SONY-WH1000XM5-BLK',
        brand: 'Sony',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Connectivity: 'Bluetooth 5.2 / 3.5mm Aux',
          BatteryLife: '30 Hours',
          Warranty: '1 Year Brand Warranty',
        },
        averageRating: 4.9,
        reviewCount: 42,
        isFeatured: true,
      },
      {
        title: 'Apple MacBook Air M3 15-inch (16GB RAM, 512GB SSD)',
        slug: 'apple-macbook-air-m3-15-inch',
        description:
          'Incredibly thin and fast laptop with Liquid Retina display, Apple M3 chip, up to 18 hours of battery life, 1080p FaceTime HD camera, and MagSafe charging port.',
        vendorId: techVendorUser._id,
        categoryId: catMap['electronics'],
        price: 134900.0,
        discountPrice: 124900.0,
        stock: 15,
        sku: 'APL-MBA15-M3-512',
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Processor: 'Apple M3 8-Core CPU',
          Memory: '16GB Unified RAM',
          Storage: '512GB SSD',
        },
        averageRating: 4.9,
        reviewCount: 58,
        isFeatured: true,
      },
      {
        title: 'Minimalist Automatic Mechanical Watch with Sapphire Crystal',
        slug: 'minimalist-automatic-mechanical-watch',
        description:
          'Precision crafted stainless steel automatic wrist watch with 42-hour power reserve, genuine Italian leather band, and 50m water resistance.',
        vendorId: styleVendorUser._id,
        categoryId: catMap['fashion'],
        price: 14999.0,
        discountPrice: 11999.0,
        stock: 25,
        sku: 'WTCH-AUTO-SLV-01',
        brand: 'Kuro Studio',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          CaseSize: '40mm',
          WaterResistance: '5 ATM',
          BandMaterial: 'Top-Grain Leather',
        },
        averageRating: 4.7,
        reviewCount: 26,
        isFeatured: true,
      },
      {
        title: 'Ergonomic High-Back Executive Mesh Office Chair',
        slug: 'ergonomic-high-back-mesh-office-chair',
        description:
          'Engineered for long work hours with breathable Korean mesh back, 3D adjustable armrests, adaptive lumbar support, and heavy-duty gas lift.',
        vendorId: techVendorUser._id,
        categoryId: catMap['home-living'],
        price: 18999.0,
        discountPrice: 15499.0,
        stock: 20,
        sku: 'FURN-CHAIR-ERGO-09',
        brand: 'ErgoForm',
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          MaxWeight: '150 kg',
          Adjustment: '3D Armrests + Dynamic Lumbar',
        },
        averageRating: 4.6,
        reviewCount: 19,
        isFeatured: true,
      },
      {
        title: 'Full-Grain Leather Everyday Messenger Laptop Bag',
        slug: 'full-grain-leather-everyday-messenger-bag',
        description:
          'Handcrafted rugged full-grain buffalo leather bag fitting up to 16-inch laptops with padded dividers, solid brass zippers, and quick-access pockets.',
        vendorId: styleVendorUser._id,
        categoryId: catMap['fashion'],
        price: 7499.0,
        discountPrice: null,
        stock: 30,
        sku: 'BAG-LEATH-MESS-BRN',
        brand: 'Heritage Goods',
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Material: 'Full-Grain Vegetable Tanned Leather',
          LaptopFit: 'Up to 16-inch',
        },
        averageRating: 4.8,
        reviewCount: 31,
        isFeatured: false,
      },
      {
        title: 'HydroShield Vacuum Insulated Stainless Steel Bottle (1000 ml)',
        slug: 'hydroshield-insulated-stainless-steel-bottle-1000ml',
        description:
          'Triple-wall vacuum insulation keeps beverages cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat with leakproof sipper cap.',
        vendorId: techVendorUser._id,
        categoryId: catMap['sports-fitness'],
        price: 1899.0,
        discountPrice: 1399.0,
        stock: 90,
        sku: 'BTL-HYDRO-1000-MATTE',
        brand: 'HydroShield',
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Capacity: '1000 ml (1 Litre)',
          Insulation: 'Triple-wall Vacuum',
        },
        averageRating: 4.9,
        reviewCount: 78,
        isFeatured: false,
      },
    ];

    const insertedProducts = await Product.insertMany(sampleProducts);

    // 6. Create Sample Review
    await Review.create({
      productId: insertedProducts[0]._id,
      customerId: customer._id,
      rating: 5,
      comment:
        'Outstanding noise cancellation and sound stage! Ideal for daily Mumbai local train commute and long flights. Battery easily crosses 30 hours.',
    });

    // 7. Create Sample Coupons
    await Coupon.create({
      code: 'WELCOME10',
      description: 'Get 10% off up to ₹1,000 on your first order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 999,
      maxDiscountAmount: 1000,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      usageLimit: 1000,
    });

    await Coupon.create({
      code: 'FLAT500',
      description: 'Flat ₹500 off on orders above ₹4,999',
      discountType: 'fixed',
      discountValue: 500,
      minOrderValue: 4999,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Seeding completed successfully!');
    console.log('--- TEST ACCOUNTS ---');
    console.log('Customer: alex@example.com / Password123!');
    console.log('Tech Vendor: vendor@apextech.com / Password123!');
    console.log('Style Vendor: vendor@urbanthreads.com / Password123!');
    console.log('Admin: admin@marketsphere.com / Password123!');
    console.log('--- CURRENCY & TAX ---');
    console.log('Currency: INR (₹) | Default GST: 18% | Free Shipping Threshold: ₹999');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
