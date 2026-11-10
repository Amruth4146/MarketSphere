import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId.toString(),
      role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn, // e.g. 15m
      algorithm: 'HS256',
    }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      id: userId.toString(),
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn, // e.g. 7d
      algorithm: 'HS256',
    }
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
