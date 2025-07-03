'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Eye, DollarSign, Calendar, Building } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Application } from '@/types';

export default function ApplicationsPage() {
  const { user, company, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
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

        if (statusFilter) params.status = statusFilter;
        
        // For companies, show applications to their tenders
        // For bidders, show their own applications
        if (user?.role !== 'company' && company) {
          params.company_id = company.id;
        }

        const response = await apiClient.getApplications(params);
        setApplications(response.data);
        setTotalPages(Math.ceil(response.total / 10));
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, currentPage, statusFilter, user?.role, company]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to view applications.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'company' ? 'Received Applications' : 'My Applications'}
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'company' 
              ? 'Review and manage applications to your tenders'
              : 'Track the status of your tender applications'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
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
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {application.tender?.title || 'Tender Application'}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <Badge status={application.status}>{application.status}</Badge>
                              
                              {user?.role === 'company' && application.company && (
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  Applied by: {application.company.name}
                                </span>
                              )}
                              
                              {user?.role !== 'company' && application.tender?.company && (
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {application.tender.company.name}
                                </span>
                              )}
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Proposal:</h4>
                              <p className="text-gray-600 line-clamp-3">
                                {application.proposal}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                              {application.quoted_price && (
                                <span className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Quoted: {formatCurrency(application.quoted_price)}
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Applied: {formatDate(application.submitted_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Link href={`/applications/${application.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        
                        {application.tender && (
                          <Link href={`/tenders/${application.tender.id}`}>
                            <Button variant="ghost" size="sm">
                              View Tender
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
                    {user?.role === 'company' ? 'No applications received yet' : 'No applications submitted yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {user?.role === 'company' 
                      ? 'Once you publish tenders, applications from interested bidders will appear here.'
                      : 'Start browsing available tenders to submit your first application.'
                    }
                  </p>
                  {user?.role !== 'company' && (
                    <Link href="/tenders">
                      <Button>
                        Browse Tenders
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
