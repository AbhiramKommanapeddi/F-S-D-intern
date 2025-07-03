'use client';

import Link from 'next/link';
import { ArrowRight, Building2, FileText, Search, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Streamline Your B2B Tender Process
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect companies with opportunities, manage tenders efficiently, and grow your business with our comprehensive tender management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-blue-600">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="text-blue-600">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Tender Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, manage, and respond to tenders efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Company Profiles</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create comprehensive company profiles with logos, descriptions, and service offerings to showcase your business.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Tender Management</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create, publish, and manage tenders with detailed requirements, budgets, and deadlines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Smart Search</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find relevant tenders and companies quickly with our advanced search and filtering capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Application Tracking</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track tender applications, manage proposals, and communicate with stakeholders efficiently.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Secure Platform</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enterprise-grade security ensures your sensitive business information remains protected.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Analytics & Insights</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get valuable insights into your tender performance and business growth opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Tender Process?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using TenderHub to streamline their procurement and bidding processes.
          </p>
          {!isAuthenticated && (
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TenderHub</span>
            </div>
            <p className="text-gray-600">
              © 2024 TenderHub. All rights reserved. Built for efficient B2B tender management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
