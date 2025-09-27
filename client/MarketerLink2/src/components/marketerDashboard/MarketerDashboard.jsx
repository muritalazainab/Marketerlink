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
  AlertCircle,
  MessageCircle,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  Upload
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access your marketer dashboard.</p>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser.isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-blue-200 rounded-xl p-8 text-center shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" style={{ color: '#2563EB' }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Sellers should use the seller dashboard.</p>
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

  // Fetch conversations for chat functionality
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => newRequest.get('/conversations').then(res => res.data)
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

  // Filter available gigs to exclude rejected ones
  const getFilteredAvailableGigs = () => {
    if (!availableGigs) return [];
    
    return availableGigs.filter(gig => {
      const applicationStatus = getGigApplicationStatus(gig._id);
      // Hide rejected gigs entirely from the available gigs list
      return applicationStatus !== 'rejected';
    }).map(gig => {
      // Find conversation for this gig
      const conversation = conversations?.find(conv => 
        conv.sellerId === gig.userId && conv.buyerId === currentUser._id
      );
      
      return {
        ...gig,
        conversationId: conversation?.id || null,
        isInProgress: getGigApplicationStatus(gig._id) === 'accepted'
      };
    });
  };

  const getApplicationStatus = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const categories = ['Social Media', 'SEO', 'Email Marketing', 'Advertising', 'Content Marketing', 'Brand Strategy'];

  const filteredAvailableGigs = getFilteredAvailableGigs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {currentUser?.username}
              </h1>
              <p className="text-lg text-gray-600">Find amazing projects and grow your freelance career</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                <Send className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications?.filter(a => a.status !== 'rejected').length || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Applications</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">TOTAL APPLIED</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications?.filter(a => a.status === 'pending').length || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Pending</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">AWAITING RESPONSE</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications?.filter(a => a.status === 'accepted').length || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Active</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">ONGOING PROJECTS</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${myApplications?.filter(a => a.status === 'accepted')
                     .reduce((sum, app) => sum + app.bidAmount, 0) || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Earnings</p>
              </div>
            </div>
            <div className="text-right">
  <p className="text-2xl font-bold text-gray-900">
    ${myApplications?.filter(a => a.status === 'accepted')
       .reduce((sum, app) => sum + app.bidAmount, 0) || 0}
  </p>
  <p className="text-sm font-medium text-gray-600">In Progress</p> {/* Changed from "Earnings" */}
</div>


<div className="pt-4 border-t border-gray-100">
  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">ACTIVE PROJECT VALUE</p> {/* Changed from "POTENTIAL INCOME" */}
</div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'available' ? '#2563EB' : undefined,
                  borderBottomColor: activeTab === 'available' ? '#2563EB' : undefined
                }}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Available Gigs</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {filteredAvailableGigs?.length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'applications'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'applications' ? '#2563EB' : undefined,
                  borderBottomColor: activeTab === 'applications' ? '#2563EB' : undefined
                }}
              >
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>My Applications</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {myApplications?.filter(a => a.status !== 'rejected').length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'projects'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'projects' ? '#2563EB' : undefined,
                  borderBottomColor: activeTab === 'projects' ? '#2563EB' : undefined
                }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Active Projects</span>
                  <span className="py-4 px-2 border-b-2 font-semibold text-sm transition-colors">
                    {myApplications?.filter(a => a.status === 'accepted').length || 0}
                  </span>
                </div>
              </button>
           
     {myApplications?.filter(app => app.status === 'accepted').map((project) => (
  <div key={project._id}>
    {/* <h3>{project.gigId?.title}</h3> */}
    <Link
      to={`/project/${project._id}/submit`}
      className="flex items-center gap-2 px-4 py-2 mt-6 text-gray rounded-lg transition-colors"
    >
      <FileText className="w-4 h-4" />
      Submit Work
    </Link>
  </div>
))}




            
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Available Gigs Tab */}
            {activeTab === 'available' && (
              <div>
                {/* Enhanced Search and Filters */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search for marketing gigs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                        style={{ '--tw-ring-color': '#2563EB' }}
                      />
                    </div>
                    <div className="relative min-w-[200px]">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-colors"
                        style={{ '--tw-ring-color': '#2563EB' }}
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

                {/* Gigs Grid */}
                {gigsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading available gigs...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAvailableGigs?.map((gig) => {
                      const hasApplied = hasAppliedToGig(gig._id);
                      const applicationStatus = getGigApplicationStatus(gig._id);
                      
                      return (
                        <GigCard
                          key={gig._id}
                          item={gig}
                          hasApplied={hasApplied}
                          applicationStatus={applicationStatus}
                          conversationId={gig.conversationId}
                          isInProgress={gig.isInProgress}
                          currentUser={currentUser}
                        />
                      );
                    })}
                  </div>
                )}

                {filteredAvailableGigs && filteredAvailableGigs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No gigs found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
                    <button 
                      onClick={() => {setSearchTerm(''); setCategoryFilter('');}}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      style={{ backgroundColor: '#2563EB' }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">My Applications</h2>
                  <p className="text-gray-600">Track your application status and manage responses</p>
                </div>
                
                {appsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading your applications...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myApplications?.filter(app => app.status !== 'rejected').map((application) => (
                      <div key={application._id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {application.gigId?.title}
                              </h3>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getApplicationStatus(application.status)}`}>
                                {application.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Bid: <span className="font-semibold">${application.bidAmount}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Delivery: <span className="font-semibold">{application.deliveryTime} days</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Applied: <span className="font-semibold">{new Date(application.createdAt).toLocaleDateString()}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Your Proposal:</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{application.proposal}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {application.status === 'accepted' && (
                            <Link
                              to="/messages"
                              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-green-700 transition-colors"
                              style={{ backgroundColor: '#2563EB' }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Start Conversation
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!myApplications || myApplications.filter(a => a.status !== 'rejected').length === 0) && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-500 mb-6">Start browsing available gigs and submit your first application!</p>
                        <button
                          onClick={() => setActiveTab('available')}
                          className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          style={{ backgroundColor: '#2563EB' }}
                        >
                          Browse Available Gigs
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Active Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Active Projects</h2>
                  <p className="text-gray-600">Manage your ongoing work and communicate with clients</p>
                </div>
                
                <div className="space-y-4">
                  {myApplications?.filter(a => a.status === 'accepted').map((project) => (
                    <div key={project._id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {project.gigId?.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-black-600" />
                              <span>Earning: <span className="font-semibold text-black-600">${project.bidAmount}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-black-600" />
                              <span>Delivery: <span className="font-semibold">{project.deliveryTime} days</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span>Started: <span className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-black-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-black-600" />
                          <p className="font-semibold text-black-800">Project Active</p>
                        </div>
                        <p className="text-sm text-black-700">
                          You can start working on this project immediately. Communicate with your client and submit your work when ready.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to="/messages"
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-green-700 transition-colors"
                          style={{ backgroundColor: '#2563EB' }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Start Conversation
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {(!myApplications || myApplications.filter(a => a.status === 'accepted').length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No active projects</h3>
                      <p className="text-gray-500 mb-6">Your accepted applications will appear here as active projects</p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setActiveTab('applications')}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Check Applications
                        </button>
                        <button
                          onClick={() => setActiveTab('available')}
                          className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          style={{ backgroundColor: '#2563EB' }}
                        >
                          Find New Projects
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Submission Tab */}
            {activeTab === 'work-submission' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Submit Work</h2>
                  <p className="text-gray-600">Upload and submit your completed work for active projects</p>
                </div>
                
                <div className="space-y-4">
                  {myApplications?.filter(a => a.status === 'accepted').map((project) => (
                    <div key={project._id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {project.gigId?.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>Payment: <span className="font-semibold">${project.bidAmount}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Deadline: <span className="font-semibold">{project.deliveryTime} days</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Started: <span className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Work Submission Form */}
                      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Upload Work Files
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, DOC, DOCX, JPG, PNG up to 10MB
                            </p>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Work Description
                          </label>
                          <textarea
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            style={{ '--tw-ring-color': '#2563EB' }}
                            placeholder="Describe the work you've completed, key deliverables, and any additional notes for the client..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            style={{ '--tw-ring-color': '#2563EB' }}
                            placeholder="Any additional comments, recommendations, or follow-up suggestions..."
                          />
                        </div>
                        
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`complete-${project._id}`}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`complete-${project._id}`} className="text-sm text-gray-700">
                              Mark this project as complete
                            </label>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              Save Draft
                            </button>
                            <button 
                              className="px-6 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              style={{ backgroundColor: '#2563EB' }}
                            >
                              Submit Work
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!myApplications || myApplications.filter(a => a.status === 'accepted').length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No active projects to submit</h3>
                      <p className="text-gray-500 mb-6">You need accepted projects before you can submit work</p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setActiveTab('applications')}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Check Applications
                        </button>
                        <button
                          onClick={() => setActiveTab('available')}
                          className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          style={{ backgroundColor: '#2563EB' }}
                        >
                          Browse Available Gigs
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketerDashboard;