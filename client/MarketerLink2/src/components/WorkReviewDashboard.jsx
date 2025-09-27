import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download,
  User,
  Calendar,
  DollarSign,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  ThumbsDown,
  Eye
} from 'lucide-react';
import newRequest from '../../utils/newRequest';

const WorkReviewDashboard = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    reviewNotes: '',
    revisionInstructions: ''
  });
  const [activeTab, setActiveTab] = useState('pending');
  
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Fetch submissions for review
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissionsForReview'],
    queryFn: () => newRequest.get('/work-submissions/for-review').then(res => res.data)
  });

  // Approve work mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, reviewNotes }) => 
      newRequest.put(`/work-submissions/${id}/approve`, { reviewNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissionsForReview']);
      setSelectedSubmission(null);
      setReviewForm({ reviewNotes: '', revisionInstructions: '' });
      alert('Work approved and payment released!');
    },
    onError: (error) => {
      console.error('Approval failed:', error);
      alert('Failed to approve work. Please try again.');
    }
  });

  // Request revision mutation
  const revisionMutation = useMutation({
    mutationFn: ({ id, revisionInstructions }) => 
      newRequest.put(`/work-submissions/${id}/request-revision`, { revisionInstructions }),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissionsForReview']);
      setSelectedSubmission(null);
      setReviewForm({ reviewNotes: '', revisionInstructions: '' });
      alert('Revision requested successfully!');
    },
    onError: (error) => {
      console.error('Revision request failed:', error);
      alert('Failed to request revision. Please try again.');
    }
  });

  // Handle approve work
  const handleApprove = () => {
    if (!selectedSubmission) return;
    
    const confirmApproval = window.confirm(
      `Are you sure you want to approve this work? This will release ${selectedSubmission.bidAmount} to the marketer.`
    );
    
    if (confirmApproval) {
      approveMutation.mutate({
        id: selectedSubmission._id,
        reviewNotes: reviewForm.reviewNotes
      });
    }
  };

  // Handle request revision
  const handleRequestRevision = () => {
    if (!selectedSubmission || !reviewForm.revisionInstructions.trim()) {
      alert('Please provide revision instructions');
      return;
    }

    if (selectedSubmission.remainingRevisions <= 0) {
      alert('No revisions remaining for this project');
      return;
    }

    revisionMutation.mutate({
      id: selectedSubmission._id,
      revisionInstructions: reviewForm.revisionInstructions
    });
  };

  // Filter submissions by status
  const filteredSubmissions = submissions?.filter(sub => {
    if (activeTab === 'pending') return sub.status === 'submitted';
    if (activeTab === 'reviewing') return sub.status === 'under_review';
    return true;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Review Dashboard</h1>
          <p className="text-gray-600">Review submitted work and manage project completions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {submissions?.filter(s => s.status === 'submitted').length || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissions?.filter(s => s.status === 'under_review').length || 0}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissions?.filter(s => s.status === 'completed').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Submissions List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pending Review ({submissions?.filter(s => s.status === 'submitted').length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Submissions ({submissions?.length || 0})
                </button>
              </nav>
            </div>

            {!filteredSubmissions || filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions</h3>
                <p className="text-gray-500">
                  {activeTab === 'pending' 
                    ? 'No work submissions waiting for your review'
                    : 'No submissions found'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedSubmission?._id === submission._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{submission.gigId?.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{submission.marketerId?.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${submission.bidAmount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {submission.submissionMessage && (
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                        {submission.submissionMessage}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {submission.deliverables && submission.deliverables.length > 0 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {submission.deliverables.length} file(s)
                          </span>
                        )}
                      </div>
                      
                      {submission.status === 'submitted' && (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Review Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Submission</h2>

            {!selectedSubmission ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Submission</h3>
                <p className="text-gray-500">Choose a submission from the left to review</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Submission Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedSubmission.gigId?.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Marketer: {selectedSubmission.marketerId?.username}</div>
                    <div>Amount: ${selectedSubmission.bidAmount}</div>
                    <div>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</div>
                    <div>Revisions Left: {selectedSubmission.remainingRevisions}</div>
                  </div>
                </div>

                {/* Submission Message */}
                {selectedSubmission.submissionMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Message
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-900">{selectedSubmission.submissionMessage}</p>
                    </div>
                  </div>
                )}

                {/* Deliverables */}
                {selectedSubmission.deliverables && selectedSubmission.deliverables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deliverables ({selectedSubmission.deliverables.length})
                    </label>
                    <div className="space-y-2">
                      {selectedSubmission.deliverables.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.originalName}</span>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.status === 'submitted' && (
                  <>
                    {/* Review Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes (Optional)
                      </label>
                      <textarea
                        value={reviewForm.reviewNotes}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
                        placeholder="Add any feedback or comments..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Revision Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Revision Instructions (if requesting changes)
                      </label>
                      <textarea
                        value={reviewForm.revisionInstructions}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, revisionInstructions: e.target.value }))}
                        placeholder="Describe what changes you'd like to see..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {approveMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve & Release Payment
                          </>
                        )}
                      </button>

                      {selectedSubmission.remainingRevisions > 0 && (
                        <button
                          onClick={handleRequestRevision}
                          disabled={revisionMutation.isPending || !reviewForm.revisionInstructions.trim()}
                          className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {revisionMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Requesting...
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="w-4 h-4" />
                              Request Revision
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {selectedSubmission.remainingRevisions <= 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-800 font-medium">No revisions remaining</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          This project has used all available revisions. You can only approve or contact the marketer directly.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {selectedSubmission.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Work Completed</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      This work has been approved and payment has been released to the marketer.
                    </p>
                    {selectedSubmission.reviewNotes && (
                      <div className="mt-3">
                        <p className="text-green-700 text-sm font-medium">Your Review Notes:</p>
                        <p className="text-green-600 text-sm">{selectedSubmission.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkReviewDashboard;
