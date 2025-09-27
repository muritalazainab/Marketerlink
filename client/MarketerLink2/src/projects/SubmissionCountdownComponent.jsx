import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Send,
  Download,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const SubmissionCountdownComponent = () => {
  // Mock project data
  const [project] = useState({
    title: "E-commerce Website Redesign",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
    deliveryDays: 7,
    status: "in_progress"
  });

  // State management
  const [timeLeft, setTimeLeft] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [files, setFiles] = useState([]);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Live countdown effect
 // Static countdown effect (frozen to days only)
useEffect(() => {
  const now = new Date().getTime();
  const dueTime = new Date(project.dueDate).getTime();
  const startTime = new Date(project.startDate).getTime();
  const totalDuration = dueTime - startTime;
  const elapsed = now - startTime;
  const remaining = dueTime - now;

  // Progress percentage
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  setProgressPercentage(progress);

  if (remaining <= 0) {
    setTimeLeft("OVERDUE");
    setUrgencyLevel("overdue");
    return;
  }

  // ✅ Only days
  const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  setTimeLeft(`${days} days`);

  if (days <= 1) {
    setUrgencyLevel("critical");
  } else if (days <= 2) {
    setUrgencyLevel("warning");
  } else {
    setUrgencyLevel("normal");
  }
}, [project.dueDate, project.startDate]);

  const getUrgencyColors = () => {
    switch (urgencyLevel) {
      case 'overdue':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          border: 'border-red-200',
          bgLight: 'bg-red-50'
        };
      case 'critical':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600', 
          border: 'border-red-200',
          bgLight: 'bg-red-50'
        };
      case 'warning':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          border: 'border-orange-200', 
          bgLight: 'bg-orange-50'
        };
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          border: 'border-blue-200',
          bgLight: 'bg-blue-50'
        };
    }
  };

  const colors = getUrgencyColors();

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWork = () => {
    if (files.length === 0) {
      alert("Please upload at least one deliverable file");
      return;
    }
    if (!submissionMessage.trim()) {
      alert("Please add a submission message explaining your work");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      alert("Work submitted successfully! The client has been notified.");
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Work Submitted Successfully!</h2>
          <p className="text-green-600 mb-4">
            Your deliverables have been sent to the client for review.
          </p>
          <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Review Period:</strong> Client has 48 hours to review your submission
            </p>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> Waiting for client review
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Project Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Project Header with Live Countdown */}
     

      {/* File Upload Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Submit Your Deliverables
        </h2>
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.zip,.rar,.mp4,.mov"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Your Work</h3>
            <p className="text-gray-500 mb-2">
              Click to browse or drag and drop your files here
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: Images, Documents, Videos, Archives (Max: 50MB each)
            </p>
          </label>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="font-medium text-gray-700">Uploaded Files ({files.length}):</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submission Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submission Message *
          </label>
          <textarea
            value={submissionMessage}
            onChange={(e) => setSubmissionMessage(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="4"
            placeholder="Explain what you've delivered, key features, how to use/access the work, etc..."
            maxLength="500"
          />
          <div className="text-xs text-gray-400 mt-1">
            {submissionMessage.length}/500 characters
          </div>
        </div>

        {/* Optional Project Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={projectNotes}
            onChange={(e) => setProjectNotes(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="2"
            placeholder="Any additional information, future recommendations, or follow-up notes..."
            maxLength="300"
          />
          <div className="text-xs text-gray-400 mt-1">
            {projectNotes.length}/300 characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitWork}
          disabled={isSubmitting || files.length === 0 || !submissionMessage.trim()}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Submitting Work...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Work for Review
            </>
          )}
        </button>

        {/* Submission Requirements */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Before submitting, ensure:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className={files.length > 0 ? 'text-green-500' : 'text-gray-400'}>
                {files.length > 0 ? '✓' : '○'}
              </span>
              At least one deliverable file is uploaded
            </li>
            <li className="flex items-center gap-2">
              <span className={submissionMessage.trim() ? 'text-green-500' : 'text-gray-400'}>
                {submissionMessage.trim() ? '✓' : '○'}
              </span>
              Submission message explains your work
            </li>
            
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubmissionCountdownComponent;