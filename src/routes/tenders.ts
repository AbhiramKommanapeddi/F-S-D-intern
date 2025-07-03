import express, { Request, Response } from 'express';
import Joi from 'joi';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createTenderSchema = Joi.object({
  title: Joi.string().min(5).required(),
  description: Joi.string().min(20).required(),
  budget: Joi.number().positive().optional(),
  currency: Joi.string().length(3).default('USD'),
  deadline: Joi.date().greater('now').required(),
  requirements: Joi.object().optional(),
  attachments: Joi.array().items(Joi.string()).optional(),
});

const updateTenderSchema = Joi.object({
  title: Joi.string().min(5).optional(),
  description: Joi.string().min(20).optional(),
  budget: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional(),
  deadline: Joi.date().greater('now').optional(),
  requirements: Joi.object().optional(),
  attachments: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'open', 'closed', 'awarded').optional(),
});

// Get all tenders (with pagination and filters)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = db('tenders')
      .leftJoin('companies', 'tenders.company_id', 'companies.id')
      .select(
        'tenders.id',
        'tenders.title',
        'tenders.description',
        'tenders.budget',
        'tenders.currency',
        'tenders.deadline',
        'tenders.status',
        'tenders.created_at',
        'companies.name as company_name',
        'companies.industry as company_industry'
      );

    if (status) {
      query = query.where('tenders.status', status);
    } else {
      // Only show open tenders by default for public listing
      query = query.where('tenders.status', 'open');
    }

    if (search) {
      query = query.where('tenders.title', 'ilike', `%${search}%`)
        .orWhere('tenders.description', 'ilike', `%${search}%`);
    }

    const offset = (page - 1) * limit;
    const [tenders, totalCount] = await Promise.all([
      query.limit(limit).offset(offset).orderBy('tenders.deadline', 'asc'),
      db('tenders').count('id as count').where(status ? { status } : { status: 'open' }).first()
    ]);

    res.json({
      success: true,
      data: {
        tenders,
        pagination: {
          page,
          limit,
          total: parseInt(totalCount?.count as string || '0'),
          pages: Math.ceil(parseInt(totalCount?.count as string || '0') / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get tenders error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get tender by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tender = await db('tenders')
      .leftJoin('companies', 'tenders.company_id', 'companies.id')
      .where('tenders.id', id)
      .select(
        'tenders.*',
        'companies.name as company_name',
        'companies.industry as company_industry',
        'companies.logo_url as company_logo'
      )
      .first();

    if (!tender) {
      res.status(404).json({
        success: false,
        error: { message: 'Tender not found' },
      });
      return;
    }

    // Get application count
    const applicationCount = await db('applications')
      .where('tender_id', id)
      .count('id as count')
      .first();

    res.json({
      success: true,
      data: {
        tender: {
          ...tender,
          applicationCount: parseInt(applicationCount?.count as string || '0'),
        },
      },
    });
  } catch (error) {
    console.error('Get tender error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Create tender (authenticated)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createTenderSchema.validate(req.body);
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

    const [tender] = await db('tenders')
      .insert({
        ...value,
        company_id: companyId,
      })
      .returning(['id', 'title', 'description', 'budget', 'currency', 'deadline', 'status', 'created_at']);

    res.status(201).json({
      success: true,
      data: { tender },
    });
  } catch (error) {
    console.error('Create tender error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Update tender (authenticated, owner only)
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = updateTenderSchema.validate(req.body);
    
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

    // Check if tender belongs to user's company
    const existingTender = await db('tenders')
      .where({ id, company_id: companyId })
      .first();

    if (!existingTender) {
      res.status(404).json({
        success: false,
        error: { message: 'Tender not found or access denied' },
      });
      return;
    }

    const [updatedTender] = await db('tenders')
      .where('id', id)
      .update({
        ...value,
        updated_at: db.fn.now(),
      })
      .returning(['id', 'title', 'description', 'budget', 'currency', 'deadline', 'status', 'updated_at']);

    res.json({
      success: true,
      data: { tender: updatedTender },
    });
  } catch (error) {
    console.error('Update tender error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get company's own tenders (authenticated)
router.get('/company/mine', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(400).json({
        success: false,
        error: { message: 'No company associated with user' },
      });
      return;
    }

    const tenders = await db('tenders')
      .where('company_id', companyId)
      .select(
        'id',
        'title',
        'description',
        'budget',
        'currency',
        'deadline',
        'status',
        'created_at'
      )
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: { tenders },
    });
  } catch (error) {
    console.error('Get company tenders error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
