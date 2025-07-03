'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, Building, Eye } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Tender, Company } from '@/types';

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'tenders' | 'companies'>('all');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      if (searchType === 'all' || searchType === 'tenders') {
        const tenderResults = await apiClient.searchTenders(searchQuery);
        setTenders(tenderResults);
      } else {
        setTenders([]);
      }

      if (searchType === 'all' || searchType === 'companies') {
        const companyResults = await apiClient.searchCompanies(searchQuery);
        setCompanies(companyResults);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to search.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="mt-2 text-gray-600">
          Find tenders and companies across the platform
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search query
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  placeholder="Search for tenders, companies, or keywords..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search in
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="all"
                    checked={searchType === 'all'}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'tenders' | 'companies')}
                    className="mr-2"
                  />
                  All
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="tenders"
                    checked={searchType === 'tenders'}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'tenders' | 'companies')}
                    className="mr-2"
                  />
                  Tenders only
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="companies"
                    checked={searchType === 'companies'}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'tenders' | 'companies')}
                    className="mr-2"
                  />
                  Companies only
                </label>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {hasSearched && !isLoading && (
        <div className="space-y-8">
          {/* Tender Results */}
          {(searchType === 'all' || searchType === 'tenders') && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tenders ({tenders.length})
              </h2>
              
              {tenders.length > 0 ? (
                <div className="space-y-4">
                  {tenders.map((tender) => (
                    <Card key={tender.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {tender.title}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {tender.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                              <Badge status={tender.status}>{tender.status}</Badge>
                              
                              {tender.category && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {tender.category}
                                </span>
                              )}
                              
                              {tender.company && (
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {tender.company.name}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {tender.budget_max && (
                                <span>
                                  Budget: {formatCurrency(tender.budget_max)}
                                </span>
                              )}
                              <span>
                                Deadline: {formatDate(tender.deadline)}
                              </span>
                            </div>
                          </div>

                          <Link href={`/tenders/${tender.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No tenders found matching your search.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Company Results */}
          {(searchType === 'all' || searchType === 'companies') && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Companies ({companies.length})
              </h2>
              
              {companies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.map((company) => (
                    <Card key={company.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {company.name}
                            </h3>
                            {company.industry && (
                              <p className="text-sm text-blue-600 mb-2">
                                {company.industry}
                              </p>
                            )}
                            {company.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {company.description}
                              </p>
                            )}
                            <div className="mt-4">
                              <Link href={`/companies/${company.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No companies found matching your search.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* No Results */}
          {tenders.length === 0 && companies.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try searching with different keywords or check your spelling.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start your search
            </h3>
            <p className="text-gray-600">
              Enter keywords to find relevant tenders and companies.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
