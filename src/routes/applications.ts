import express, { Request, Response } from 'express';
import Joi from 'joi';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createApplicationSchema = Joi.object({
  tenderId: Joi.string().uuid().required(),
  proposal: Joi.string().min(50).required(),
  quotedPrice: Joi.number().positive().optional(),
  currency: Joi.string().length(3).default('USD'),
  attachments: Joi.array().items(Joi.string()).optional(),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('submitted', 'under_review', 'accepted', 'rejected').required(),
});

// Submit application (authenticated)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createApplicationSchema.validate(req.body);
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

    const { tenderId, proposal, quotedPrice, currency, attachments } = value;

    // Check if tender exists and is open
    const tender = await db('tenders')
      .where('id', tenderId)
      .first();

    if (!tender) {
      res.status(404).json({
        success: false,
        error: { message: 'Tender not found' },
      });
      return;
    }

    if (tender.status !== 'open') {
      res.status(400).json({
        success: false,
        error: { message: 'Tender is not open for applications' },
      });
      return;
    }

    if (new Date(tender.deadline) < new Date()) {
      res.status(400).json({
        success: false,
        error: { message: 'Tender deadline has passed' },
      });
      return;
    }

    // Check if company already applied
    const existingApplication = await db('applications')
      .where({ tender_id: tenderId, company_id: companyId })
      .first();

    if (existingApplication) {
      res.status(409).json({
        success: false,
        error: { message: 'Company has already applied to this tender' },
      });
      return;
    }

    const [application] = await db('applications')
      .insert({
        tender_id: tenderId,
        company_id: companyId,
        proposal,
        quoted_price: quotedPrice,
        currency,
        attachments: JSON.stringify(attachments || []),
      })
      .returning(['id', 'proposal', 'quoted_price', 'currency', 'status', 'submitted_at']);

    res.status(201).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get applications for a tender (tender owner only)
router.get('/tender/:tenderId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenderId } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      res.status(400).json({
        success: false,
        error: { message: 'No company associated with user' },
      });
      return;
    }

    // Verify that the tender belongs to the user's company
    const tender = await db('tenders')
      .where({ id: tenderId, company_id: companyId })
      .first();

    if (!tender) {
      res.status(404).json({
        success: false,
        error: { message: 'Tender not found or access denied' },
      });
      return;
    }

    const applications = await db('applications')
      .leftJoin('companies', 'applications.company_id', 'companies.id')
      .where('applications.tender_id', tenderId)
      .select(
        'applications.id',
        'applications.proposal',
        'applications.quoted_price',
        'applications.currency',
        'applications.status',
        'applications.submitted_at',
        'companies.name as company_name',
        'companies.industry as company_industry',
        'companies.logo_url as company_logo'
      )
      .orderBy('applications.submitted_at', 'desc');

    res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    console.error('Get tender applications error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get company's own applications
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

    const applications = await db('applications')
      .leftJoin('tenders', 'applications.tender_id', 'tenders.id')
      .leftJoin('companies', 'tenders.company_id', 'companies.id')
      .where('applications.company_id', companyId)
      .select(
        'applications.id',
        'applications.proposal',
        'applications.quoted_price',
        'applications.currency',
        'applications.status',
        'applications.submitted_at',
        'tenders.title as tender_title',
        'tenders.deadline as tender_deadline',
        'companies.name as tender_company_name'
      )
      .orderBy('applications.submitted_at', 'desc');

    res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Update application status (tender owner only)
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = updateApplicationStatusSchema.validate(req.body);

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

    // Verify that the application belongs to a tender owned by the user's company
    const application = await db('applications')
      .leftJoin('tenders', 'applications.tender_id', 'tenders.id')
      .where('applications.id', id)
      .where('tenders.company_id', companyId)
      .select('applications.id')
      .first();

    if (!application) {
      res.status(404).json({
        success: false,
        error: { message: 'Application not found or access denied' },
      });
      return;
    }

    const [updatedApplication] = await db('applications')
      .where('id', id)
      .update({
        status: value.status,
        updated_at: db.fn.now(),
      })
      .returning(['id', 'status', 'updated_at']);

    res.json({
      success: true,
      data: { application: updatedApplication },
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get application details
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      res.status(400).json({
        success: false,
        error: { message: 'No company associated with user' },
      });
      return;
    }

    const application = await db('applications')
      .leftJoin('tenders', 'applications.tender_id', 'tenders.id')
      .leftJoin('companies as applicant_company', 'applications.company_id', 'applicant_company.id')
      .leftJoin('companies as tender_company', 'tenders.company_id', 'tender_company.id')
      .where('applications.id', id)
      .where(function() {
        this.where('applications.company_id', companyId)
          .orWhere('tenders.company_id', companyId);
      })
      .select(
        'applications.*',
        'tenders.title as tender_title',
        'tenders.description as tender_description',
        'tenders.deadline as tender_deadline',
        'applicant_company.name as applicant_company_name',
        'tender_company.name as tender_company_name'
      )
      .first();

    if (!application) {
      res.status(404).json({
        success: false,
        error: { message: 'Application not found or access denied' },
      });
      return;
    }

    res.json({
      success: true,
      data: { application },
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
