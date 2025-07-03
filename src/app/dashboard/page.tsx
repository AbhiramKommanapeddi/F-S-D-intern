'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, timeUntilDeadline } from '@/lib/utils';
import { Tender, Application } from '@/types';

export default function DashboardPage() {
  const { user, company, isAuthenticated } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        if (user?.role === 'company' && company) {
          // Load company's tenders
          const tenderResponse = await apiClient.getTenders({
            company_id: company.id,
            limit: 5,
          });
          setTenders(tenderResponse.data);

          // Load applications for company's tenders
          const appResponse = await apiClient.getApplications({
            limit: 5,
          });
          setApplications(appResponse.data);

          setStats({
            totalTenders: tenderResponse.total,
            activeTenders: tenderResponse.data.filter(t => t.status === 'published').length,
            totalApplications: appResponse.total,
            pendingApplications: appResponse.data.filter(a => a.status === 'submitted').length,
          });
        } else {
          // Load user's applications
          const appResponse = await apiClient.getApplications({
            company_id: company?.id,
            limit: 5,
          });
          setApplications(appResponse.data);

          // Load recent tenders
          const tenderResponse = await apiClient.getTenders({
            limit: 5,
            status: 'published',
          });
          setTenders(tenderResponse.data);

          setStats({
            totalTenders: tenderResponse.total,
            activeTenders: tenderResponse.data.length,
            totalApplications: appResponse.total,
            pendingApplications: appResponse.data.filter(a => a.status === 'submitted').length,
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user?.role, company]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening with your tenders.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'company' ? 'Total Tenders' : 'Available Tenders'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'company' ? 'Active Tenders' : 'Open Tenders'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTenders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'company' ? 'Total Applications' : 'My Applications'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'company' ? 'Pending Reviews' : 'Pending Applications'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tenders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'company' ? 'Your Recent Tenders' : 'Recent Opportunities'}
            </h2>
            <div className="flex space-x-2">
              {user?.role === 'company' && (
                <Link href="/tenders/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </Link>
              )}
              <Link href="/tenders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenders.length > 0 ? (
                tenders.map((tender) => (
                  <div key={tender.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{tender.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {tender.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge status={tender.status}>{tender.status}</Badge>
                          {tender.budget_max && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(tender.budget_max)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {timeUntilDeadline(tender.deadline)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Link href={`/tenders/${tender.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {user?.role === 'company' && (
                          <Link href={`/tenders/${tender.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {user?.role === 'company' 
                    ? 'No tenders created yet. Create your first tender to get started!'
                    : 'No recent tenders available.'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'company' ? 'Recent Applications' : 'Your Applications'}
            </h2>
            <Link href="/applications">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <div key={application.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {application.tender?.title || 'Tender Application'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {user?.role === 'company' 
                            ? `Applied by: ${application.company?.name}`
                            : `Applied to: ${application.tender?.company?.name}`
                          }
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge status={application.status}>{application.status}</Badge>
                          {application.quoted_price && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(application.quoted_price)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(application.submitted_at)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/applications/${application.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {user?.role === 'company' 
                    ? 'No applications received yet.'
                    : 'No applications submitted yet. Browse tenders to get started!'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {!company && user?.role === 'company' && (
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Complete Your Company Profile
            </h3>
            <p className="text-gray-600 mb-4">
              Set up your company profile to start posting tenders and managing applications.
            </p>
            <Link href="/company/setup">
              <Button>
                <Building className="h-4 w-4 mr-2" />
                Setup Company Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
