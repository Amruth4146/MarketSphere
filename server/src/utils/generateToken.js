import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};
