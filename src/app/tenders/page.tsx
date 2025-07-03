'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, timeUntilDeadline } from '@/lib/utils';
import { Tender } from '@/types';

export default function TendersPage() {
  const { user, company, isAuthenticated } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: 10,
        };

        if (searchQuery) params.search = searchQuery;
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
        
        // If user is a company, show their own tenders
        if (user?.role === 'company' && company) {
          params.company_id = company.id;
        } else {
          // For bidders, show only published tenders
          params.status = 'published';
        }

        const response = await apiClient.getTenders(params);
        setTenders(response.data);
        setTotalPages(Math.ceil(response.total / 10));
      } catch (error) {
        console.error('Failed to load tenders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, currentPage, searchQuery, statusFilter, categoryFilter, user?.role, company]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // This will trigger a re-render and useEffect will reload data
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to view tenders.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'company' ? 'Your Tenders' : 'Available Tenders'}
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'company' 
              ? 'Manage your posted tenders and requirements'
              : 'Browse and apply to available tender opportunities'
            }
          </p>
        </div>
        {user?.role === 'company' && (
          <Link href="/tenders/create">
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Tender
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search tenders
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  placeholder="Search by title or description..."
                />
              </div>
            </div>

            {user?.role === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-label="Filter by status"
                >
                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                  <option value="awarded">Awarded</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                <option value="IT">IT & Software</option>
                <option value="Construction">Construction</option>
                <option value="Services">Professional Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <Button type="submit" disabled={isLoading}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tenders List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {tenders.length > 0 ? (
              tenders.map((tender) => (
                <Card key={tender.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {tender.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {tender.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <Badge status={tender.status}>{tender.status}</Badge>
                              
                              {tender.category && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {tender.category}
                                </span>
                              )}
                              
                              {tender.company && user?.role !== 'company' && (
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {tender.company.name}
                                </span>
                              )}

                              {tender._count?.applications && (
                                <span className="text-sm text-gray-500">
                                  {tender._count.applications} applications
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                              {tender.budget_min && tender.budget_max && (
                                <span className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {formatCurrency(tender.budget_min)} - {formatCurrency(tender.budget_max)}
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Deadline: {formatDate(tender.deadline)}
                              </span>
                              
                              <span className="text-orange-600 font-medium">
                                {timeUntilDeadline(tender.deadline)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Link href={`/tenders/${tender.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        {user?.role === 'company' && (
                          <Link href={`/tenders/${tender.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                        {user?.role !== 'company' && tender.status === 'published' && (
                          <Link href={`/tenders/${tender.id}/apply`}>
                            <Button size="sm">
                              Apply
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {user?.role === 'company' ? 'No tenders created yet' : 'No tenders available'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {user?.role === 'company' 
                      ? 'Create your first tender to start receiving applications from qualified bidders.'
                      : 'No tenders match your current filters. Try adjusting your search criteria.'
                    }
                  </p>
                  {user?.role === 'company' && (
                    <Link href="/tenders/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Tender
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
