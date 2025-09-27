import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  FileText,
  Clock,
  User,
  MessageCircle
} from 'lucide-react';

const ReviewInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => newRequest.get(`/projects/${id}`).then(res => res.data),
  });

  const handleReviewSubmission = async (decision) => {
    if (decision === 'revision' && !revisionInstructions.trim()) {
      alert("Please provide revision instructions.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await newRequest.put(`/projects/${id}/review`, {
        decision,
        reviewNotes,
        revisionInstructions
      });
      
      alert(`Review completed successfully - ${decision}`);
      navigate(`/project/${id}`);
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadFile = async (filename, originalName) => {
    try {
      const response = await fetch(`/api/projects/${id}/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem("currentUser")).token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error downloading file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project || project.status !== 'submitted') {
    return (
      <div className="text-center py-20">
        <div className="text-gray-600 text-lg">This project is not available for review</div>
        <button 
          onClick={() => navigate(`/project/${id}`)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Review Submission</h1>
        <p className="text-gray-600">{project.gigId.title}</p>
        
        {/* Submission Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h3 className="font-medium text-blue-800 mb-2">Marketer's Message:</h3>
          <p className="text-blue-700">{project.submissionMessage}</p>
          {project.projectNotes && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Additional Notes:</h4>
              <p className="text-blue-700 text-sm">{project.projectNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Deliverables ({project.deliverables.length})</h2>
        
        <div className="space-y-3">
          {project.deliverables.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="font-medium text-gray-900">{file.originalName}</span>
                  <div className="text-sm text-gray-500">
                    Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => downloadFile(file.filename, file.originalName)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Review Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Review Decision</h2>
        
        {/* Decision Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setReviewDecision('accept')}
            className={`p-6 rounded-xl border-2 transition-all ${
              reviewDecision === 'accept'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500" />
            <div className="font-semibold text-lg mb-2">Accept Work</div>
            <div className="text-sm text-gray-600">Mark project as completed</div>
          </button>
          
          <button
            onClick={() => setReviewDecision('revision')}
            className={`p-6 rounded-xl border-2 transition-all ${
              reviewDecision === 'revision'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
            <div className="font-semibold text-lg mb-2">Request Revision</div>
            <div className="text-sm text-gray-600">
              Ask for changes ({project.remainingRevisions} left)
            </div>
          </button>
        </div>

        {/* Review Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Add feedback about the submitted work..."
            maxLength="500"
          />
        </div>

        {/* Revision Instructions */}
        {reviewDecision === 'revision' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revision Instructions *
            </label>
            <textarea
              value={revisionInstructions}
              onChange={(e) => setRevisionInstructions(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows="5"
              placeholder="Be specific about what needs to be changed..."
              maxLength="1000"
              required
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={() => handleReviewSubmission(reviewDecision)}
          disabled={!reviewDecision || isSubmitting || (reviewDecision === 'revision' && !revisionInstructions.trim())}
          className="w-full bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              {reviewDecision === 'accept' ? 'Accept & Complete Project' : 'Send Revision Request'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewInterface;