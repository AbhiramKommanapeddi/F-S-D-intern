import express, { Request, Response } from 'express';
import db from '../config/database';

const router = express.Router();

// Search companies by name, industry, or goods/services
router.get('/companies', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const industry = req.query.industry as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query && !industry) {
      res.status(400).json({
        success: false,
        error: { message: 'Search query or industry filter is required' },
      });
      return;
    }

    let searchQuery = db('companies')
      .select(
        'companies.id',
        'companies.name',
        'companies.industry',
        'companies.description',
        'companies.logo_url',
        'companies.created_at'
      )
      .distinct();

    if (query) {
      searchQuery = searchQuery
        .leftJoin('goods_services', 'companies.id', 'goods_services.company_id')
        .where(function() {
          this.where('companies.name', 'ilike', `%${query}%`)
            .orWhere('companies.description', 'ilike', `%${query}%`)
            .orWhere('goods_services.name', 'ilike', `%${query}%`)
            .orWhere('goods_services.description', 'ilike', `%${query}%`);
        });
    }

    if (industry) {
      searchQuery = searchQuery.where('companies.industry', 'ilike', `%${industry}%`);
    }

    const offset = (page - 1) * limit;
    const companies = await searchQuery
      .limit(limit)
      .offset(offset)
      .orderBy('companies.name', 'asc');

    // Get goods and services for each company
    const companiesWithServices = await Promise.all(
      companies.map(async (company) => {
        const goodsServices = await db('goods_services')
          .where('company_id', company.id)
          .select('id', 'name', 'description', 'category', 'tags')
          .limit(5); // Limit to avoid too much data

        return {
          ...company,
          goodsServices,
        };
      })
    );

    res.json({
      success: true,
      data: {
        companies: companiesWithServices,
        pagination: {
          page,
          limit,
          hasMore: companies.length === limit,
        },
      },
    });
  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Search tenders
router.get('/tenders', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const industry = req.query.industry as string;
    const status = req.query.status as string || 'open';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    let searchQuery = db('tenders')
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
      )
      .where('tenders.status', status);

    if (query) {
      searchQuery = searchQuery.where(function() {
        this.where('tenders.title', 'ilike', `%${query}%`)
          .orWhere('tenders.description', 'ilike', `%${query}%`);
      });
    }

    if (industry) {
      searchQuery = searchQuery.where('companies.industry', 'ilike', `%${industry}%`);
    }

    const offset = (page - 1) * limit;
    const tenders = await searchQuery
      .limit(limit)
      .offset(offset)
      .orderBy('tenders.deadline', 'asc');

    res.json({
      success: true,
      data: {
        tenders,
        pagination: {
          page,
          limit,
          hasMore: tenders.length === limit,
        },
      },
    });
  } catch (error) {
    console.error('Search tenders error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get all available industries (for filter options)
router.get('/industries', async (req: Request, res: Response): Promise<void> => {
  try {
    const industries = await db('companies')
      .select('industry')
      .distinct()
      .whereNotNull('industry')
      .orderBy('industry', 'asc');

    res.json({
      success: true,
      data: {
        industries: industries.map(row => row.industry),
      },
    });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Get popular search terms (could be implemented with analytics)
router.get('/suggestions', async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string; // 'companies' or 'tenders'
    
    if (type === 'companies') {
      // Get most common goods/services categories
      const categories = await db('goods_services')
        .select('category')
        .count('* as count')
        .groupBy('category')
        .orderBy('count', 'desc')
        .limit(10);

      res.json({
        success: true,
        data: {
          suggestions: categories.map(row => row.category),
        },
      });
    } else {
      // Get recent tender titles for autocomplete
      const recentTenders = await db('tenders')
        .select('title')
        .where('status', 'open')
        .orderBy('created_at', 'desc')
        .limit(10);

      res.json({
        success: true,
        data: {
          suggestions: recentTenders.map(row => row.title),
        },
      });
    }
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
