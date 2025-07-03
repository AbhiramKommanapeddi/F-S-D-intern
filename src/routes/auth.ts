import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  companyName: Joi.string().min(2).required(),
  industry: Joi.string().min(2).required(),
  description: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register endpoint
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message },
      });
      return;
    }

    const { email, password, companyName, industry, description } = value;

    // Check if user already exists
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'User with this email already exists' },
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and company in a transaction
    const result = await db.transaction(async (trx) => {
      // Create user
      const [user] = await trx('users')
        .insert({
          email,
          password_hash: passwordHash,
        })
        .returning(['id', 'email', 'created_at']);

      // Create company
      const [company] = await trx('companies')
        .insert({
          user_id: user.id,
          name: companyName,
          industry,
          description,
        })
        .returning(['id', 'name', 'industry', 'description']);

      return { user, company };
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        companyId: result.company.id,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
        },
        company: result.company,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message },
      });
      return;
    }

    const { email, password } = value;

    // Find user with company info
    const user = await db('users')
      .leftJoin('companies', 'users.id', 'companies.user_id')
      .where('users.email', email)
      .select(
        'users.id',
        'users.email',
        'users.password_hash',
        'companies.id as company_id',
        'companies.name as company_name',
        'companies.industry',
        'companies.description'
      )
      .first();

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        companyId: user.company_id,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
        company: user.company_id ? {
          id: user.company_id,
          name: user.company_name,
          industry: user.industry,
          description: user.description,
        } : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await db('users')
      .leftJoin('companies', 'users.id', 'companies.user_id')
      .where('users.id', req.user?.id)
      .select(
        'users.id',
        'users.email',
        'users.created_at',
        'companies.id as company_id',
        'companies.name as company_name',
        'companies.industry',
        'companies.description',
        'companies.logo_url',
        'companies.contact_info'
      )
      .first();

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
        company: user.company_id ? {
          id: user.company_id,
          name: user.company_name,
          industry: user.industry,
          description: user.description,
          logoUrl: user.logo_url,
          contactInfo: user.contact_info,
        } : null,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
