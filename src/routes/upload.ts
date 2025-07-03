import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import supabase from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('Only image files are allowed') as any;
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
});

// Upload company logo
router.post('/company-logo', authenticateToken, upload.single('logo'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id;
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `company-logos/${userId}-${uuidv4()}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    res.json({
      message: 'File uploaded successfully',
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload tender document
router.post('/tender-document', authenticateToken, upload.single('document'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id;
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `tender-documents/${userId}-${uuidv4()}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    res.json({
      message: 'Document uploaded successfully',
      url: publicUrl,
      fileName: fileName,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file
router.delete('/file/:fileName', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      res.status(400).json({ error: 'File name is required' });
      return;
    }
    
    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
      return;
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
