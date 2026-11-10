import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  currency: {
    code: process.env.CURRENCY || 'INR',
    symbol: process.env.CURRENCY_SYMBOL || '₹',
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD_INR || '999'),
    defaultShippingFee: parseFloat(process.env.DEFAULT_SHIPPING_FEE_INR || '99'),
    defaultGstPercent: parseFloat(process.env.DEFAULT_GST_PERCENT || '18'),
    defaultCommissionPercent: parseFloat(process.env.DEFAULT_COMMISSION_PERCENT || '10'),
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/marketsphere',
    user: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_min_32_chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production_min_32_chars',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
};
