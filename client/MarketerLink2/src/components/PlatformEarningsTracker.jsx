import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Users,
  FileText,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';
import newRequest from '../../utils/newRequest';

const PlatformEarningsTracker = () => {
  const [dateRange, setDateRange] = useState('all');
  const [viewMode, setViewMode] = useState('overview');
  
  // Fetch platform earnings data
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['platformEarnings', dateRange],
    queryFn: () => newRequest.get('/platform-earnings').then(res => res.data)
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get month name
  const getMonthName = (monthData) => {
    const date = new Date(monthData._id.year, monthData._id.month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  const { totalEarnings, recentTransactions, monthlyEarnings } = earningsData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Earnings</h1>
          <p className="text-gray-600">Track your 5% platform commission and transaction history</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <select 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overview">Overview</option>
                  <option value="transactions">Transactions</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>
            </div>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings || 0)}</p>
              <p className="text-sm font-medium text-gray-600">Total Platform Earnings</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{recentTransactions?.length || 0}</p>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyEarnings?.[0]?.earnings || 0)}
              </p>
              <p className="text-sm font-medium text-gray-600">This Month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5%</p>
              <p className="text-sm font-medium text-gray-600">Commission Rate</p>
            </div>
          </div>
        </div>

        {viewMode === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Monthly Earnings Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Earnings</h2>
              
              {monthlyEarnings && monthlyEarnings.length > 0 ? (
                <div className="space-y-4">
                  {monthlyEarnings.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{getMonthName(month)}</p>
                        <p className="text-sm text-gray-500">{month.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(month.earnings)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No earnings data available</p>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
              
              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.slice(0, 10).map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.gigId?.title || 'Untitled Project'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>From: {transaction.marketerId?.username}</span>
                          <span>To: {transaction.sellerId?.username}</span>
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(transaction.platformFee)}</p>
                        <p className="text-xs text-gray-500">5% of ${transaction.totalAmount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Total: {recentTransactions?.length || 0} transactions</span>
              </div>
            </div>

            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Marketer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Platform Fee</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {transaction.gigId?.title || 'Untitled'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {transaction.marketerId?.username || 'Unknown'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {transaction.sellerId?.username || 'Unknown'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(transaction.totalAmount)}
                        </td>
                        <td className="py-4 px-4 text-sm text-green-600 text-right font-bold">
                          {formatCurrency(transaction.platformFee)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            transaction.status === 'processed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {transaction.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Commission Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Commission Analytics</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-700 font-medium">Platform Commission (5%)</span>
                    <span className="text-green-800 font-bold">{formatCurrency(totalEarnings || 0)}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-700 font-medium">Marketer Earnings (95%)</span>
                    <span className="text-blue-800 font-bold">
                      {formatCurrency((recentTransactions?.reduce((sum, t) => sum + t.marketerEarning, 0) || 0))}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Average Transaction Value:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        recentTransactions?.length > 0 
                          ? recentTransactions.reduce((sum, t) => sum + t.totalAmount, 0) / recentTransactions.length
                          : 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 mt-2">
                    <span>Average Commission per Transaction:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        recentTransactions?.length > 0 
                          ? recentTransactions.reduce((sum, t) => sum + t.platformFee, 0) / recentTransactions.length
                          : 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-purple-900">Total Projects Completed</p>
                    <p className="text-sm text-purple-600">Successfully finished projects</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {recentTransactions?.length || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-medium text-indigo-900">Revenue Generated</p>
                    <p className="text-sm text-indigo-600">Total marketplace volume</p>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(
                      recentTransactions?.reduce((sum, t) => sum + t.totalAmount, 0) || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <div>
                    <p className="font-medium text-teal-900">Active Contributors</p>
                    <p className="text-sm text-teal-600">Unique marketers served</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">
                    {new Set(recentTransactions?.map(t => t.marketerId?._id)).size || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-medium text-amber-900">Client Base</p>
                    <p className="text-sm text-amber-600">Unique clients served</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {new Set(recentTransactions?.map(t => t.sellerId?._id)).size || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <div className="text-center">
            <p className="text-gray-600">
              Platform commission rate: <span className="font-semibold text-blue-600">5%</span> per completed transaction
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Earnings are automatically processed when projects are completed and approved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformEarningsTracker;