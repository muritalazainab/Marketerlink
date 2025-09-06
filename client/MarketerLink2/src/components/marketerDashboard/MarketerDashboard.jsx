import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  AlertCircle
} from 'lucide-react';
import newRequest from '../../../utils/newRequest';
import GigCard from '../gigCard/GigCard'; 

const MarketerDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Access control - redirect if user is not a marketer
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check if user has seller privileges - redirect sellers to seller dashboard
    if (currentUser.isSeller) {
      navigate('/seller-dashboard');
      return;
    }
  }, [currentUser, navigate]);

  // Show loading or unauthorized message while checking access
  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Please Login</h2>
          <p className="text-red-600">You need to login to access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (currentUser.isSeller) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Redirecting...</h2>
          <p className="text-blue-600">Sellers should use the seller dashboard.</p>
        </div>
      </div>
    );
  }

  // Fetch available gigs (all active gigs from all sellers)
  const { data: availableGigs, isLoading: gigsLoading } = useQuery({
    queryKey: ['availableGigs', searchTerm, categoryFilter],
    queryFn: () => {
      let url = '/gigs?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (categoryFilter) url += `cat=${categoryFilter}&`;
      return newRequest.get(url).then(res => {
         const filteredGigs = res.data.filter(gig => gig.userId !== currentUser._id);
      return filteredGigs; 
      });
    }
  });

  // Fetch marketer's applications
  const { data: myApplications, isLoading: appsLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => newRequest.get('/applications').then(res => res.data)
  });

  // Helper function to check if user has applied to a gig
  const hasAppliedToGig = (gigId) => {
    return myApplications?.some(application => 
      application.gigId?._id === gigId || application.gigId === gigId
    ) || false;
  };

  // Helper function to get application status for a gig
  const getGigApplicationStatus = (gigId) => {
    const application = myApplications?.find(app => 
      app.gigId?._id === gigId || app.gigId === gigId
    );
    return application?.status || null;
  };

  const getApplicationStatus = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = ['Social Media', 'SEO', 'Email Marketing', 'Advertising', 'Content Marketing', 'Brand Strategy'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketer Dashboard</h1>
        <p className="text-gray-600">Find projects and grow your freelance career</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myApplications?.length || 0}
              </p>
            </div>
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myApplications?.filter(a => a.status === 'pending').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myApplications?.filter(a => a.status === 'accepted').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Potential Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${myApplications?.filter(a => a.status === 'accepted')
                   .reduce((sum, app) => sum + app.bidAmount, 0) || 0}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Gigs
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Applications ({myApplications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Projects ({myApplications?.filter(a => a.status === 'accepted').length || 0})
          </button>
        </nav>
      </div>

      {/* Available Gigs Tab */}
      {activeTab === 'available' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Gigs Grid - UPDATED WITH GIGCARD INTEGRATION */}
          {gigsLoading ? (
            <div className="text-center py-8">Loading available gigs...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGigs?.map((gig) => {
                const hasApplied = hasAppliedToGig(gig._id);
                const applicationStatus = getGigApplicationStatus(gig._id);
                
                return (
                  <GigCard
                    key={gig._id}
                    item={gig}
                    hasApplied={hasApplied}
                    applicationStatus={applicationStatus}
                    showApplyButton={true}
                  />
                );
              })}
            </div>
          )}

          {availableGigs && availableGigs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
          </div>
          
          {appsLoading ? (
            <div className="p-6">Loading applications...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myApplications?.map((application) => (
                <div key={application._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {application.gigId?.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getApplicationStatus(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Your Bid: ${application.bidAmount}</span>
                        <span>Delivery: {application.deliveryTime} days</span>
                        <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700 text-sm">{application.proposal}</p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/gig/${application.gigId?._id}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      View Gig
                    </Link>
                    
                    {application.status === 'accepted' && (
                      <Link
                        to={`/project/${application._id}`}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <FileText className="w-4 h-4" />
                        Go to Project
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              
              {(!myApplications || myApplications.length === 0) && (
                <div className="p-6 text-center text-gray-500">
                  <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No applications yet</p>
                  <p className="text-sm">Browse available gigs and start applying!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {myApplications?.filter(a => a.status === 'accepted').map((project) => (
              <div key={project._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {project.gigId?.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Earning: ${project.bidAmount}</span>
                      <span>Delivery: {project.deliveryTime} days</span>
                      <span>Started: {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-green-700 font-medium">Project Status: Active</p>
                  <p className="text-sm text-green-600">You can start working on this project. Submit your work when ready.</p>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    to={`/project/${project._id}`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    View Project
                  </Link>
                  <Link
                    to={`/messages`}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <Send className="w-4 h-4" />
                    Message Client
                  </Link>
                </div>
              </div>
            ))}
            
            {(!myApplications || myApplications.filter(a => a.status === 'accepted').length === 0) && (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active projects</p>
                <p className="text-sm">Your accepted applications will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketerDashboard;