import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('[Seed] Cleaned existing collections');

    // Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@marketsphere.com',
      password: 'Password123!',
      role: 'admin',
    });

    const techSeller = await User.create({
      name: 'Apex Electronics',
      email: 'seller@apextech.com',
      password: 'Password123!',
      role: 'seller',
      sellerProfile: {
        businessName: 'Apex Electronics Store',
        description: 'Certified premium electronics, audio gear, and computing accessories.',
        rating: 4.8,
        ratingCount: 120,
        isVerified: true,
      },
    });

    const styleSeller = await User.create({
      name: 'Urban Threads',
      email: 'seller@urbanthreads.com',
      password: 'Password123!',
      role: 'seller',
      sellerProfile: {
        businessName: 'Urban Threads Collective',
        description: 'Sustainable streetwear and contemporary apparel.',
        rating: 4.6,
        ratingCount: 85,
        isVerified: true,
      },
    });

    const buyer = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'Password123!',
      role: 'buyer',
      addresses: [
        {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'US',
          isDefault: true,
        },
      ],
    });

    console.log('[Seed] Created default users:');
    console.log(' - Admin: admin@marketsphere.com / Password123!');
    console.log(' - Tech Seller: seller@apextech.com / Password123!');
    console.log(' - Style Seller: seller@urbanthreads.com / Password123!');
    console.log(' - Buyer: alex@example.com / Password123!');

    // Create Categories
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
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
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

    // Create Sample Products
    const sampleProducts = [
      {
        title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        description:
          'Industry-leading active noise canceling with two processors and 8 microphones. Ultra-comfortable lightweight design with soft fit leather, 30-hour battery life, and crystal-clear hands-free calling.',
        sellerId: techSeller._id,
        categoryId: catMap['electronics'],
        price: 398.0,
        discountPrice: 348.0,
        stock: 45,
        sku: 'SONY-WH1000XM5-BLK',
        brand: 'Sony',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Connectivity: 'Bluetooth 5.2 / 3.5mm Aux',
          BatteryLife: '30 Hours',
          Color: 'Midnight Black',
        },
        averageRating: 4.9,
        reviewCount: 38,
        isFeatured: true,
      },
      {
        title: 'Apple MacBook Air M3 15-inch 16GB RAM 512GB SSD',
        slug: 'apple-macbook-air-m3-15-inch',
        description:
          'Incredibly thin and fast laptop with Liquid Retina display, Apple M3 chip, up to 18 hours of battery life, 1080p FaceTime HD camera, and MagSafe charging port.',
        sellerId: techSeller._id,
        categoryId: catMap['electronics'],
        price: 1499.0,
        discountPrice: 1399.0,
        stock: 20,
        sku: 'APL-MBA15-M3-512',
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Processor: 'Apple M3 8-Core CPU',
          Memory: '16GB Unified',
          Storage: '512GB SSD',
        },
        averageRating: 4.9,
        reviewCount: 54,
        isFeatured: true,
      },
      {
        title: 'Minimalist Minimalist Japanese Mechanical Automatic Watch',
        slug: 'minimalist-mechanical-automatic-watch',
        description:
          'Precision crafted sapphire crystal stainless steel automatic wrist watch with 42-hour power reserve, genuine leather band, and 50m water resistance.',
        sellerId: styleSeller._id,
        categoryId: catMap['fashion'],
        price: 249.0,
        discountPrice: 199.0,
        stock: 35,
        sku: 'WTCH-AUTO-SLV-01',
        brand: 'Kuro Studio',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          CaseSize: '40mm',
          WaterResistance: '5 ATM',
          BandMaterial: 'Italian Top-Grain Leather',
        },
        averageRating: 4.7,
        reviewCount: 22,
        isFeatured: true,
      },
      {
        title: 'Ergonomic Mesh Executive Desk Chair with Lumbar Support',
        slug: 'ergonomic-mesh-executive-desk-chair',
        description:
          'Engineered for full-day posture support. Breathable mesh back, 3D adjustable armrests, dynamic lumbar cradle, and smooth pneumatic height adjustment.',
        sellerId: techSeller._id,
        categoryId: catMap['home-living'],
        price: 329.0,
        discountPrice: 289.0,
        stock: 18,
        sku: 'FURN-CHAIR-ERGO-09',
        brand: 'ErgoForm',
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          MaxWeight: '330 lbs',
          Adjustment: '3D Armrests + Tilt Lock',
        },
        averageRating: 4.6,
        reviewCount: 19,
        isFeatured: true,
      },
      {
        title: 'Full-Grain Leather Everyday Carry Messenger Bag',
        slug: 'leather-everyday-carry-messenger-bag',
        description:
          'Handcrafted rugged full-grain leather messenger bag built to fit up to 16-inch laptops with padded dividers, solid brass hardware, and heavy-duty stitching.',
        sellerId: styleSeller._id,
        categoryId: catMap['fashion'],
        price: 185.0,
        discountPrice: null,
        stock: 25,
        sku: 'BAG-LEATH-MESS-BRN',
        brand: 'Heritage Goods',
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Material: 'Full-Grain Vegetable Tanned Leather',
          LaptopFit: 'Up to 16 inches',
        },
        averageRating: 4.8,
        reviewCount: 29,
        isFeatured: false,
      },
      {
        title: 'HydroShield Insulated Stainless Steel Bottle (32 oz)',
        slug: 'hydroshield-insulated-stainless-steel-bottle',
        description:
          'Double-wall vacuum insulation keeps liquids ice cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat with leakproof straw lid.',
        sellerId: techSeller._id,
        categoryId: catMap['sports-outdoors'],
        price: 38.0,
        discountPrice: 29.0,
        stock: 120,
        sku: 'BTL-HYDRO-32-MATTE',
        brand: 'HydroShield',
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: {
          Capacity: '32 oz (950 ml)',
          Insulation: 'Double-wall Vacuum',
        },
        averageRating: 4.9,
        reviewCount: 64,
        isFeatured: false,
      },
    ];

    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed] Inserted ${insertedProducts.length} sample products`);

    // Create Sample Reviews for first product
    await Review.create({
      productId: insertedProducts[0]._id,
      buyerId: buyer._id,
      rating: 5,
      comment:
        'Unmatched noise cancellation! Tested during trans-Atlantic flights and daily train commutes; battery lasts well beyond promises.',
    });

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
