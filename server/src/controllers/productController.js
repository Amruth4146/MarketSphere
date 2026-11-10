import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { getRedisClient } from '../config/redis.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const query = { status: 'published' };

    // Text search or keyword regex
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      // Find category by slug or ID
      const cat = await Category.findOne({
        $or: [
          { slug: category },
          ...(category.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: category }] : []),
        ],
      });
      if (cat) {
        query.categoryId = cat._id;
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating !== undefined) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1, reviewCount: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .populate('sellerId', 'name sellerProfile')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    const cacheKey = 'products:featured';

    try {
      const cached = await redis?.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          source: 'cache',
        });
      }
    } catch (e) {}

    const products = await Product.find({ status: 'published', isFeatured: true })
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name sellerProfile')
      .limit(8)
      .lean();

    try {
      await redis?.set(cacheKey, JSON.stringify(products), 'EX', 1800);
    } catch (e) {}

    res.status(200).json({
      success: true,
      data: products,
      source: 'database',
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);

    const product = await Product.findOne({
      $or: [
        { slug: identifier },
        ...(isObjectId ? [{ _id: identifier }] : []),
      ],
    })
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name email sellerProfile');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Fetch latest reviews for this product
    const reviews = await Review.find({ productId: product._id })
      .populate('buyerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        product,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      price,
      discountPrice,
      stock,
      sku,
      images,
      brand,
      attributes,
      isFeatured,
    } = req.body;

    const product = await Product.create({
      title,
      description,
      categoryId,
      sellerId: req.user._id,
      price,
      discountPrice: discountPrice || null,
      stock,
      sku,
      images,
      brand: brand || '',
      attributes: attributes || {},
      isFeatured: Boolean(isFeatured),
      status: 'published',
    });

    // Invalidate Redis caches
    try {
      const redis = getRedisClient();
      await redis?.del('products:featured');
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Only owner seller or admin can update
    if (
      product.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product listing',
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (
      product.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product listing',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      productId,
      buyerId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = await Review.create({
      productId,
      buyerId: req.user._id,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
