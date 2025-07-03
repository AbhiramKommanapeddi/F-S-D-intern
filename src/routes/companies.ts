import express, { Request, Response } from 'express';
import Joi from 'joi';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const updateCompanySchema = Joi.object({
  name: Joi.string().min(2).optional(),
  industry: Joi.string().min(2).optional(),
  description: Joi.string().optional(),
  contactInfo: Joi.object().optional(),
});

// Get all companies (with pagination and search)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const industry = req.query.industry as string;

    let query = db('companies')
      .select(
        'id',
        'name',
        'industry',
        'description',
        'logo_url',
        'contact_info',
        'created_at'
      );

    if (search) {
      query = query.where('name', 'ilike', `%${search}%`);
    }

    if (industry) {
      query = query.where('industry', industry);
    }

    const offset = (page - 1) * limit;
    const [companies, totalCount] = await Promise.all([
      query.limit(limit).offset(offset).orderBy('created_at', 'desc'),
      db('companies').count('id as count').first()
    ]);

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          total: parseInt(totalCount?.count as string || '0'),
          pages: Math.ceil(parseInt(totalCount?.count as string || '0') / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get company by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await db('companies')
      .where('id', id)
      .select(
        'id',
        'name',
        'industry',
        'description',
        'logo_url',
        'contact_info',
        'created_at'
      )
      .first();

    if (!company) {
      res.status(404).json({
        success: false,
        error: { message: 'Company not found' },
      });
      return;
    }

    // Get company's goods and services
    const goodsServices = await db('goods_services')
      .where('company_id', id)
      .select('id', 'name', 'description', 'category', 'tags');

    res.json({
      success: true,
      data: {
        company: {
          ...company,
          goodsServices,
        },
      },
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Update company profile (authenticated)
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = updateCompanySchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message },
      });
      return;
    }

    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(400).json({
        success: false,
        error: { message: 'No company associated with user' },
      });
      return;
    }

    const [updatedCompany] = await db('companies')
      .where('id', companyId)
      .update({
        ...value,
        updated_at: db.fn.now(),
      })
      .returning(['id', 'name', 'industry', 'description', 'logo_url', 'contact_info']);

    res.json({
      success: true,
      data: { company: updatedCompany },
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Upload company logo (placeholder for file upload)
router.post('/logo', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // This would integrate with Supabase Storage or similar
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Logo upload endpoint - integration with Supabase Storage needed',
        logoUrl: 'https://placeholder.example.com/logo.png',
      },
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
