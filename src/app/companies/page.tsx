'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building, Search, Users, Eye, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent } from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Company } from '@/types';

export default function CompaniesPage() {
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: 12,
        };

        if (searchQuery) params.search = searchQuery;
        if (industryFilter) params.industry = industryFilter;

        const response = await apiClient.getCompanies(params);
        setCompanies(response.data);
        setTotalPages(Math.ceil(response.total / 12));
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, currentPage, searchQuery, industryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to view companies.</p>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="mt-2 text-gray-600">
          Discover companies and potential business partners
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search companies
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  placeholder="Search by company name..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Filter by industry"
              >
                <option value="">All industries</option>
                <option value="Technology">Technology</option>
                <option value="Construction">Construction</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>

            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.length > 0 ? (
              companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {company.logo_url ? (
                        <Image
                          src={company.logo_url}
                          alt={`${company.name} logo`}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {company.name}
                        </h3>
                        {company.industry && (
                          <p className="text-sm text-blue-600 mb-2">
                            {company.industry}
                          </p>
                        )}
                      </div>
                    </div>

                    {company.description && (
                      <p className="text-gray-600 mt-4 line-clamp-3">
                        {company.description}
                      </p>
                    )}

                    <div className="mt-4 space-y-2">
                      {company.contact_email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-2" />
                          <span className="truncate">{company.contact_email}</span>
                        </div>
                      )}
                      
                      {company.contact_phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-2" />
                          <span>{company.contact_phone}</span>
                        </div>
                      )}
                      
                      {company.website && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Globe className="h-3 w-3 mr-2" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 truncate"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Member since {new Date(company.created_at).getFullYear()}
                      </span>
                      <Link href={`/companies/${company.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No companies found
                    </h3>
                    <p className="text-gray-600">
                      No companies match your current search criteria. Try adjusting your filters.
                    </p>
                  </CardContent>
                </Card>
              </div>
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
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      size="sm"
                    >
                      {page}
                    </Button>
                  );
                })}
                
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
