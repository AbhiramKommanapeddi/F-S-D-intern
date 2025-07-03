import axios from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User, 
  Company, 
  CompanyFormData,
  Tender,
  TenderFormData,
  Application,
  ApplicationFormData,
  PaginatedResponse,
  GoodsService
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/register`, data);
    return response.data;
  }

  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/login`, data);
    const authData = response.data;
    if (authData.token) {
      this.setToken(authData.token);
    }
    return authData;
  }

  async getProfile(): Promise<{ user: User; company?: Company }> {
    const response = await axios.get(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Company endpoints
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
  }): Promise<PaginatedResponse<Company>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.industry) queryParams.append('industry', params.industry);

    const response = await axios.get(`${this.baseURL}/companies?${queryParams}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getCompany(id: string): Promise<Company> {
    const response = await axios.get(`${this.baseURL}/companies/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createCompany(data: CompanyFormData): Promise<Company> {
    const response = await axios.post(`${this.baseURL}/companies`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateCompany(id: string, data: Partial<CompanyFormData>): Promise<Company> {
    const response = await axios.put(`${this.baseURL}/companies/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async uploadCompanyLogo(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post(`${this.baseURL}/upload/company-logo`, formData, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        // Don't set Content-Type for FormData
      },
    });
    return response.data;
  }

  // Tender endpoints
  async getTenders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    company_id?: string;
  }): Promise<PaginatedResponse<Tender>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.company_id) queryParams.append('company_id', params.company_id);

    const response = await axios.get(`${this.baseURL}/tenders?${queryParams}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getTender(id: string): Promise<Tender> {
    const response = await axios.get(`${this.baseURL}/tenders/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createTender(data: TenderFormData): Promise<Tender> {
    const response = await axios.post(`${this.baseURL}/tenders`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateTender(id: string, data: Partial<TenderFormData>): Promise<Tender> {
    const response = await axios.put(`${this.baseURL}/tenders/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async deleteTender(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/tenders/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Application endpoints
  async getApplications(params?: {
    page?: number;
    limit?: number;
    tender_id?: string;
    company_id?: string;
    status?: string;
  }): Promise<PaginatedResponse<Application>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.tender_id) queryParams.append('tender_id', params.tender_id);
    if (params?.company_id) queryParams.append('company_id', params.company_id);
    if (params?.status) queryParams.append('status', params.status);

    const response = await axios.get(`${this.baseURL}/applications?${queryParams}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getApplication(id: string): Promise<Application> {
    const response = await axios.get(`${this.baseURL}/applications/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createApplication(tenderId: string, data: ApplicationFormData): Promise<Application> {
    const response = await axios.post(`${this.baseURL}/applications`, {
      tender_id: tenderId,
      ...data,
    }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const response = await axios.put(`${this.baseURL}/applications/${id}/status`, {
      status,
    }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Search endpoints
  async searchCompanies(query: string): Promise<Company[]> {
    const response = await axios.get(`${this.baseURL}/search/companies?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async searchTenders(query: string): Promise<Tender[]> {
    const response = await axios.get(`${this.baseURL}/search/tenders?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Goods & Services
  async getGoodsServices(companyId?: string): Promise<GoodsService[]> {
    const url = companyId 
      ? `${this.baseURL}/companies/${companyId}/goods-services`
      : `${this.baseURL}/goods-services`;
    
    const response = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createGoodsService(companyId: string, data: Omit<GoodsService, 'id' | 'company_id' | 'created_at'>): Promise<GoodsService> {
    const response = await axios.post(`${this.baseURL}/companies/${companyId}/goods-services`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async uploadTenderDocument(file: File): Promise<{ url: string; fileName: string; originalName: string }> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await axios.post(`${this.baseURL}/upload/tender-document`, formData, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        // Don't set Content-Type for FormData
      },
    });
    return response.data;
  }

  async deleteFile(fileName: string): Promise<void> {
    await axios.delete(`${this.baseURL}/upload/file/${encodeURIComponent(fileName)}`, {
      headers: this.getHeaders(),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
