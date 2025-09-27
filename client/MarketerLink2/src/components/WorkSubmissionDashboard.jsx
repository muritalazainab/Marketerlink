import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  Eye,
  RefreshCw,
  DollarSign,
  Calendar,
  MessageCircle
} from 'lucide-react';
import newRequest from '../../utils/newRequest';
import upload from '../../utils/upload';

const WorkSubmissionDashboard = () => {
  const [submissionForm, setSubmissionForm] = useState({
    applicationId: '',
    submissionMessage: '',
    files: []
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Fetch marketer's active projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['marketerProjects'],
    queryFn: () => newRequest.get('/work-submissions/my-projects').then(res => res.data)
  });

  // Submit work mutation
  const submitWorkMutation = useMutation({
    mutationFn: (workData) => newRequest.post('/work-submissions/submit', workData),
    onSuccess: () => {
      queryClient.invalidateQueries(['marketerProjects']);
      setSubmissionForm({ applicationId: '', submissionMessage: '', files: [] });
      setSelectedProject(null);
      alert('Work submitted successfully!');
    },
    onError: (error) => {
      console.error('Submission failed:', error);
      alert('Failed to submit work. Please try again.');
    }
  });

  // Handle file upload
 const handleFileUpload = (files) => {
  if (!files || files.length === 0) {
    console.log("No files selected");
    return;
  }
  
  console.log("Files to upload:", files);
  setUploadingFiles(true);

  // For now, let's just add files without uploading to server
  const fileArray = Array.from(files).map(file => ({
    filename: file.name,
    originalName: file.name,
    url: URL.createObjectURL(file), // Create local URL for preview
    size: file.size,
    uploadedAt: new Date().toISOString()
  }));
  
  setSubmissionForm(prev => ({
    ...prev,
    files: [...prev.files, ...fileArray]
  }));
  
  setUploadingFiles(false);
  console.log("Files added to form:", fileArray);
};

  // Handle work submission
const handleSubmit = (e) => {
  e.preventDefault();

  // check required fields
  if (!submissionForm.applicationId || !submissionForm.submissionMessage) {
    alert('Please fill in all required fields');
    return;
  }

    submitWorkMutation.mutate({
  projectId: submissionForm.applicationId, // instead of applicationId
  submissionMessage: submissionForm.submissionMessage,
  deliverables: submissionForm.files
});

  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'submitted': return 'bg-purple-100 text-purple-700';
      case 'under_review': return 'bg-orange-100 text-orange-700';
      case 'revision_requested': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Remove file from submission
  const removeFile = (index) => {
    setSubmissionForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Submission</h1>
          <p className="text-gray-600">Submit your completed work and track project progress</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Project List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Projects</h2>
            
            {!projects || projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h3>
                <p className="text-gray-500">You don't have any active projects to work on yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project._id} 
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedProject?._id === project._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{project.gigId?.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Earning: ${project.bidAmount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Delivery: {project.deliveryTime} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Revisions: {project.remainingRevisions}</span>
                      </div>
                    </div>

                    {/* Show revision instructions if requested */}
                    {project.status === 'revision_requested' && project.revisionInstructions && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-red-700 text-sm font-medium mb-1">Revision Requested:</p>
                        <p className="text-red-600 text-sm">{project.revisionInstructions}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {(project.status === 'accepted' || project.status === 'revision_requested') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubmissionForm(prev => ({ ...prev, applicationId: project._id }));
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Submit Work
                        </button>
                      )}
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                        <MessageCircle className="w-3 h-3 inline mr-1" />
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Submission Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Work</h2>
            
            {!submissionForm.applicationId ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                <p className="text-gray-500">Choose a project from the left to submit your work</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected Project Info */}
                {selectedProject && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Submitting for:</h4>
                    <p className="text-blue-800">{selectedProject.gigId?.title}</p>
                  </div>
                )}

                {/* Submission Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Message *
                  </label>
                  <textarea
                    value={submissionForm.submissionMessage}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, submissionMessage: e.target.value }))}
                    placeholder="Describe your completed work, what you've delivered, and any notes for the client..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                {/* File Upload */}
             {/* File Upload - Fixed Version */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Deliverables
  </label>
  
  {/* Hidden file input */}
  <input
    type="file"
    multiple
    onChange={(e) => {
      console.log("File input triggered, files:", e.target.files);
      handleFileUpload(e.target.files);
    }}
    className="hidden"
    id="file-upload"
    disabled={uploadingFiles}
  />
  
  {/* Clickable upload area */}
  <div 
    className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors cursor-pointer"
    onClick={() => {
      console.log("Upload area clicked");
      document.getElementById("file-upload").click();
    }}
  >
    <div className="flex flex-col items-center text-center">
      {uploadingFiles ? (
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-2" />
      ) : (
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
      )}
      <span className="text-sm text-gray-600">
        {uploadingFiles ? 'Uploading files...' : 'Click to upload deliverables'}
      </span>
      <span className="text-xs text-gray-400 mt-1">
        Support for all file types
      </span>
    </div>
  </div>
</div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitWorkMutation.isPending || uploadingFiles}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitWorkMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Work for Review
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSubmissionDashboard;