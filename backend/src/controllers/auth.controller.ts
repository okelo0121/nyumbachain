import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Keypair } from '@stellar/stellar-sdk';
import { User } from '../models/user.model';
import { encrypt } from '../utils/crypto';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretaccesskey123!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey456!';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const toUserResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  full_name: user.full_name,
  phone: user.phone,
  stellar_wallet: user.stellar_wallet,
  kyc_verified: user.kyc_verified,
});

// Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['landlord', 'tenant', 'admin']),
  full_name: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().optional(),
  stellar_wallet: z.string().optional(), // Optional for landlord, auto-generated for tenant
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper: Token Generator
const generateTokens = (user: User) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// Controllers
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, full_name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    let stellar_wallet = req.body.stellar_wallet;
    let stellar_wallet_secret_encrypted = null;

    // Generate custodial wallet keypair for tenant
    if (role === 'tenant') {
      const pair = Keypair.random();
      stellar_wallet = pair.publicKey();
      stellar_wallet_secret_encrypted = encrypt(pair.secret());
    }

    // Create user
    const newUser = await User.create({
      email,
      password_hash,
      role,
      full_name,
      phone,
      stellar_wallet,
      stellar_wallet_secret_encrypted: stellar_wallet_secret_encrypted || undefined,
    });

    const { accessToken, refreshToken } = generateTokens(newUser);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    // Exclude password and encrypted keys in response
    const userResponse = toUserResponse(newUser);

    return res.status(201).json({
      user: userResponse,
      accessToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    const userResponse = toUserResponse(user);

    return res.json({
      user: userResponse,
      accessToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired refresh token.' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User does not exist.' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      // Rotate refresh token
      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

      return res.json({ accessToken });
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Server error during token refresh.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  return res.json({ message: 'Logged out successfully.' });
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'stellar_wallet_secret_encrypted'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Server error retrieving profile.' });
  }
};
