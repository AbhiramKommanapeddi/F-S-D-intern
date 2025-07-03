export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'company' | 'bidder';
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  registration_number?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  requirements: string;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  category?: string;
  company_id: string;
  company?: Company;
  created_at: string;
  updated_at: string;
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  tender_id: string;
  company_id: string;
  proposal: string;
  quoted_price?: number;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  submitted_at: string;
  tender?: Tender;
  company?: Company;
}

export interface GoodsService {
  id: string;
  name: string;
  description?: string;
  category?: string;
  company_id: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'company' | 'bidder';
}

export interface CompanyFormData {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  registration_number?: string;
}

export interface TenderFormData {
  title: string;
  description: string;
  requirements: string;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  category?: string;
}

export interface ApplicationFormData {
  proposal: string;
  quoted_price?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  company?: Company;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
