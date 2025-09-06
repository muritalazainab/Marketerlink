import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Clock, 
  Award,
  DollarSign,
  MessageCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import newRequest from '../../../utils/newRequest';

const MarketerProfileView = ({ marketerId, marketer, isModal = false, onClose }) => {
  // Fetch detailed profile if not provided
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['marketerProfile', marketerId],
    queryFn: () => newRequest.get(`/users/${marketerId}`).then(res => res.data),
    enabled: !!marketerId && !marketer,
  });

  // Use provided marketer data or fetched profile data
  const profile = marketer || profileData;

  if (isLoading) {
    return (
      <div className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}`}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading profile</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const ProfileContent = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        {isModal && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {profile.fullName || profile.username || 'Unknown User'}
          </h2>
          <p className="text-blue-100 mb-2">
            {profile.title || profile.role || 'Marketer'}
          </p>
          
          {/* Quick Stats */}
          <div className="flex gap-6 mt-4 text-center">
            <div>
              <p className="text-2xl font-bold">{profile.rating || 'N/A'}</p>
              <p className="text-sm text-blue-100">Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.completedProjects || 0}</p>
              <p className="text-sm text-blue-100">Projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.responseTime || 'N/A'}</p>
              <p className="text-sm text-blue-100">Response Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.location || profile.country || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Verification Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    profile.emailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {profile.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    profile.phoneVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {profile.phoneVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Languages
                </h3>
                <div className="space-y-2">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{lang.language}</span>
                      <span className="text-xs text-gray-500">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About/Bio */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                About
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || profile.description || 'This marketer has not provided a detailed description yet. However, they are registered and available for projects.'}
                </p>
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </h3>
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{exp.title}</h4>
                      <p className="text-gray-600 text-sm">{exp.company}</p>
                      <p className="text-gray-500 text-xs">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-gray-700 text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </h3>
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600 text-sm">{edu.school}</p>
                      <p className="text-gray-500 text-xs">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio/Projects */}
            {profile.portfolio && profile.portfolio.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Portfolio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.portfolio.map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews/Ratings */}
            {profile.reviews && profile.reviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {profile.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                      <p className="text-gray-500 text-xs mt-1">- {review.clientName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex gap-3 justify-end">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <MessageCircle className="w-4 h-4" />
              Send Message
            </button>
            {isModal && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return isModal ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <ProfileContent />
    </div>
  ) : (
    <ProfileContent />
  );
};

export default MarketerProfileView;