import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface UserPayload {
  id: string;
  email: string;
  companyId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Access token required' },
    });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        error: { message: 'Invalid or expired token' },
      });
      return;
    }

    req.user = decoded as UserPayload;
    next();
  });
};
