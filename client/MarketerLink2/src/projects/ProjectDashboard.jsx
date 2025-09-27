import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import { 
  Clock, 
  User, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Upload,
  Eye
} from 'lucide-react';

const ProjectDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [timeLeft, setTimeLeft] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("normal");

  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ["project", id],
    queryFn: () => newRequest.get(`/projects/${id}`).then(res => res.data),
  });

  // Live countdown effect
  useEffect(() => {
    if (!project?.dueDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const due = new Date(project.dueDate).getTime();
      const remaining = due - now;

      if (remaining <= 0) {
        setTimeLeft("OVERDUE");
        setUrgencyLevel("overdue");
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (remaining < 24 * 60 * 60 * 1000) {
        setUrgencyLevel("critical");
      } else if (remaining < 48 * 60 * 60 * 1000) {
        setUrgencyLevel("warning");
      } else {
        setUrgencyLevel("normal");
      }

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [project?.dueDate]);

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-center p-8 text-red-600">Error loading project</div>;
  if (!project) return <div className="text-center p-8">Project not found</div>;

  const isMarketer = currentUser._id === project.marketerId._id;
  const isSeller = currentUser._id === project.gigId.userId._id;

  const getStatusColor = (status) => {
    const colors = {
      'in_progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'submitted': 'bg-purple-100 text-purple-700 border-purple-200',
      'under_review': 'bg-orange-100 text-orange-700 border-orange-200',
      'revision_requested': 'bg-amber-100 text-amber-700 border-amber-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'overdue': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.gigId.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Marketer: {project.marketerId.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Client: {project.gigId.userId.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${project.bidAmount}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Countdown for active projects */}
        {['in_progress', 'revision_requested'].includes(project.status) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Time Remaining:</span>
              </div>
              <span className={`font-bold text-lg ${urgencyLevel === 'critical' ? 'text-red-600' : 'text-blue-600'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marketer Actions */}
        {isMarketer && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Your Actions</h2>
            
            {project.status === 'in_progress' && (
              <button 
                onClick={() => navigate(`/project/${id}/submit`)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Submit Work
              </button>
            )}
            
            {project.status === 'revision_requested' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-medium text-amber-800 mb-2">Revision Requested</h3>
                  <p className="text-amber-700 text-sm">{project.revisionInstructions}</p>
                </div>
                <button 
                  onClick={() => navigate(`/project/${id}/submit`)}
                  className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Submit Revision
                </button>
              </div>
            )}
            
            {project.status === 'submitted' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-purple-800 font-medium">Work Submitted</p>
                <p className="text-purple-600 text-sm">Waiting for client review</p>
              </div>
            )}
            
            {project.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Project Completed!</p>
                <p className="text-green-600 text-sm">Payment will be processed</p>
              </div>
            )}
          </div>
        )}

        {/* Seller Actions */}
        {isSeller && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Review Work</h2>
            
            {project.status === 'submitted' && (
              <button 
                onClick={() => navigate(`/project/${id}/review`)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Review Submission
              </button>
            )}
            
            {project.status === 'in_progress' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-medium">Work In Progress</p>
                <p className="text-blue-600 text-sm">Marketer is working on your project</p>
              </div>
            )}
          </div>
        )}

        {/* Communication */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Communication
          </h2>
          <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;