import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import newRequest from "../../../utils/newRequest"
import Reviews from "../../components/reviews/Reviews"
import ApplicationModal from "../marketerModal/ApplicationModal"
import { useState } from "react"
import { User, X, Eye, AlertCircle, Star, Clock, RefreshCw, CheckCircle, DollarSign, Calendar, MessageCircle, MapPin, Globe } from "lucide-react"

function Gig() {
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [viewingProfile, setViewingProfile] = useState(null)
  const { id } = useParams()

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  const handleApplicationSubmit = async (applicationData) => {
    try {
      const response = await newRequest.post("/applications", applicationData)
      alert("Application submitted successfully!")
      setShowApplicationModal(false)
    } catch (error) {
      console.error("Failed to submit application:", error)
      throw error
    }
  }

  // Function to safely extract marketer info
  const getMarketerInfo = (marketerId) => {
    if (typeof marketerId === 'string') {
      return {
        id: marketerId,
        name: `Marketer ID: ${marketerId}`
      }
    }
    if (marketerId && typeof marketerId === 'object') {
      return {
        id: marketerId._id || marketerId.id || 'unknown',
        name: marketerId.username || marketerId.email || 'Unknown User'
      }
    }
    return {
      id: 'unknown',
      name: 'Unknown User'
    }
  }

  // Function to view marketer profile
  const viewMarketerProfile = async (marketerId) => {
    try {
      console.log("Fetching profile for marketer:", marketerId)
      
      // Try to get complete profile first
      let marketerData = null
      
      try {
        const profileResponse = await newRequest.get(`/profiles/user/${marketerId}`)
        if (profileResponse.data && profileResponse.data.isComplete) {
          marketerData = profileResponse.data
        }
      } catch (profileErr) {
        console.log("Profile not found or incomplete, fetching basic user data")
      }
      
      // If no complete profile, get basic user data
      if (!marketerData) {
        const userResponse = await newRequest.get(`/users/${marketerId}`)
        marketerData = {
          ...userResponse.data,
          isComplete: false
        }
      }
      
      setViewingProfile(marketerData)
    } catch (error) {
      console.error("Error fetching marketer data:", error)
      setViewingProfile({
        _id: marketerId,
        username: "Unknown User",
        email: "Not available",
        isComplete: false,
        error: "Could not load profile details"
      })
    }
  }

  // Function to start conversation
  const handleStartConversation = async (marketerId) => {
    try {
      await newRequest.post("/conversations", { to: marketerId });
      alert("Conversation started! You can now message this marketer from your messages page.");
    } catch (error) {
      console.log("Conversation might already exist or error creating:", error);
      alert("You can message this marketer from your messages page.");
    }
  }

  // Accept/Reject functions
  const handleAcceptApplication = async (applicationId) => {
    try {
      // Accept application
      await newRequest.put(`/applications/${applicationId}/accept`);

      // Start project (make sure you use gigId or correct project endpoint)
      await newRequest.put(`/projects/${id}/start`);

      const application = gigApplications?.find(app => app._id === applicationId);
      if (application && application.marketerId) {
        const marketerId = typeof application.marketerId === 'string' 
          ? application.marketerId 
          : application.marketerId._id;

        try {
          await newRequest.post("/conversations", { to: marketerId });
          console.log("Conversation created successfully");
        } catch (convError) {
          console.log("Conversation might already exist or error creating:", convError);
        }
      }

      window.location.reload();
      alert("Application accepted! You can now message the marketer from your messages page.");
    } catch (error) {
      console.error("Error accepting application:", error);
      alert("Error accepting application. Please try again.");
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await newRequest.put(`/applications/${applicationId}/reject`)
      window.location.reload()
    } catch (error) {
      console.error("Error rejecting application:", error)
    }
  }

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  })

  const userId = data?.userId

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => newRequest.get(`/users/${userId}`).then((res) => res.data),
    enabled: !!userId,
  })

  // Check if current user is the gig owner
  const isGigOwner = currentUser && data && currentUser._id === data.userId

  // Fetch applications if user is the gig owner
  const { data: gigApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["gigApplications", id],
    queryFn: () => newRequest.get(`/applications/gig/${id}`).then((res) => {
      console.log("Applications raw data:", res.data)
      return res.data
    }),
    enabled: isGigOwner,
  })

  // Profile Modal Component
  const ProfileModal = ({ marketer, onClose }) => {
    if (!marketer) return null

    const safeString = (value) => {
      if (typeof value === 'string') return value
      if (typeof value === 'number') return value.toString()
      return 'Not available'
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {marketer.img || marketer.profilePicture || marketer.avatar ? (
                  <img
                    src={marketer.img || marketer.profilePicture || marketer.avatar}
                    alt={safeString(marketer.username)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {safeString(marketer.fullName || marketer.username || "Unknown User")}
                </h2>
                <p className="text-blue-100 text-lg">
                  {safeString(marketer.title || "Marketer")}
                </p>
                
                {!marketer.isComplete && (
                  <div className="mt-2">
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                      Profile Incomplete
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!marketer.isComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Limited Profile Information</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  This marketer hasn't completed their profile yet. Here's their basic registration information:
                </p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{safeString(marketer.email)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{safeString(marketer.username)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{safeString(marketer.phone)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{safeString(marketer.location || marketer.country)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">{marketer.createdAt ? new Date(marketer.createdAt).toLocaleDateString() : "Date not available"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Profile Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating:</span>
                    {marketer.averageRating || marketer.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{safeString(marketer.averageRating || marketer.rating)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Not rated yet</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Completed:</span>
                    <span className="font-medium">{safeString(marketer.completedProjects || "0")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">{safeString(marketer.responseTime || "Not available")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  {safeString(marketer.bio || marketer.description || marketer.desc || 
                   (marketer.isComplete 
                     ? "This marketer has not provided a detailed description."
                     : "This marketer has not completed their profile yet. You can contact them to discuss your project requirements."
                   ))}
                </p>
              </div>
            </div>

            {/* Skills */}
            {marketer.skills && Array.isArray(marketer.skills) && marketer.skills.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {marketer.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      {safeString(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {marketer.portfolio && Array.isArray(marketer.portfolio) && marketer.portfolio.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketer.portfolio.map((project, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 mb-2">{safeString(project.title)}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{safeString(project.description)}</p>
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          View Project
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-gray-200">
              <button 
                onClick={onClose} 
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 text-lg">Something went wrong!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title || 'Untitled'}</h1>

                {isLoadingUser ? (
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                ) : errorUser ? (
                  <div className="text-red-600">Error loading seller information</div>
                ) : (
                  <div className="flex items-center gap-4">
                    <img 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                      src={dataUser.img || "/images/noavatar.jpg"} 
                      alt="" 
                    />
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">{dataUser.username || 'Unknown User'}</span>
                      {!isNaN(data.totalStars / data.starNumber) && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                          {Array(Math.round(data.totalStars / data.starNumber))
                            .fill()
                            .map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          <span className="text-sm font-bold text-yellow-600 ml-1">
                            {Math.round(data.totalStars / data.starNumber)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {data.images && data.images.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <Slider 
                    slidesToShow={1} 
                    arrowsScroll={1} 
                    className="gig-slider"
                    dots={true}
                    arrows={true}
                  >
                    {data.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img} 
                          alt="" 
                          className="w-full h-80 object-cover"
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Gig</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">{data.desc || 'No description available'}</p>
                </div>
              </div>

              {/* Applications Section - Gig Owner Only */}
              {isGigOwner && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Applications</h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {gigApplications?.length || 0} Applications
                    </span>
                  </div>
                  
                  {applicationsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : gigApplications && gigApplications.length > 0 ? (
                    <div className="space-y-4">
                      {gigApplications.map((app) => {
                        const marketerInfo = getMarketerInfo(app.marketerId)

                        return (
                          <div key={app._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold text-lg text-gray-900">{marketerInfo.name}</h4>
                                <div className="flex gap-6 text-sm text-gray-600 mt-2">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Bid: ${app.bidAmount || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Delivery: {app.deliveryTime || 0} days</span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  app.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : app.status === "accepted"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {app.status || 'unknown'}
                              </span>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-gray-700 leading-relaxed">{app.proposal || 'No proposal provided'}</p>
                            </div>
                            
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                              {/* Message button - now available for all statuses */}
                              <button 
                                onClick={() => handleStartConversation(marketerInfo.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Message Marketer
                              </button>

                              {app.status === "pending" && (
                                <>
                                  <button 
                                    onClick={() => handleAcceptApplication(app._id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleRejectApplication(app._id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              <button 
                                onClick={() => viewMarketerProfile(marketerInfo.id)}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Profile
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No applications yet</p>
                      <p className="text-sm">Applications will appear here once marketers apply to your gig.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Section - Only show if not gig owner */}
              {!isGigOwner && !isLoadingUser && !errorUser && dataUser && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">About The Seller</h2>
                  
                  <div className="flex items-start gap-6 mb-8">
                    <img
                      src={dataUser.img || "/images/noavatar.jpg"}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{dataUser.username || 'Unknown User'}</h3>
                        {!isNaN(data.totalStars / data.starNumber) && (
                          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            {Array(Math.round(data.totalStars / data.starNumber))
                              .fill()
                              .map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            <span className="text-sm font-bold text-yellow-600 ml-1">
                              {Math.round(data.totalStars / data.starNumber)}
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Contact Me
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">From</div>
                      <div className="text-gray-600">{dataUser.country || 'Not specified'}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Member since</div>
                      <div className="text-gray-600">{dataUser.createdAt ? new Date(dataUser.createdAt).getFullYear() : 'Unknown'}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Avg. response time</div>
                      <div className="text-gray-600">4 hours</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Last delivery</div>
                      <div className="text-gray-600">1 day</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Languages</div>
                      <div className="text-gray-600">English</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-700 leading-relaxed">{dataUser.desc || 'No description available'}</p>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Reviews gigId={id} />
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex-1 border border-gray-300 rounded-md p-6 flex flex-col gap-5 h-max max-h-[500px] sticky top-36">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{data.shortTitle || data.title || 'Untitled'}</h3>
                <h2 className="text-xl font-light">$ {data.price || 0}</h2>
              </div>
              <p className="text-gray-500">{data.shortDesc || 'No short description available'}</p>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <img src="/images/clock.jpg" alt="" className="w-5" />
                  <span>{data.deliveryDate || data.deliveryTime || 0} Days Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/images/recycle.jpg" alt="" className="w-5" />
                  <span>{data.revisionNumber || 0} Revisions</span>
                </div>
              </div>
              
              {/* Features - safely render */}
              {data.features && Array.isArray(data.features) && data.features.length > 0 && (
                <div>
                  {data.features.map((feature, index) => (
                    <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm" key={index}>
                      <img src="/images/greencheck.jpg" alt="" className="w-4" />
                      <span>{typeof feature === 'string' ? feature : 'Feature available'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Apply Button - Only show if not gig owner and user is logged in */}
              {!isGigOwner && currentUser && (
                <button
                  onClick={() => setShowApplicationModal(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply for this Gig
                </button>
              )}

              {/* Login prompt for non-logged users */}
              {!currentUser && (
                <Link
                  to="/login"
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors text-center block"
                >
                  Login to Apply
                </Link>
              )}

              {/* Gig Owner Message */}
              {isGigOwner && (
                <div className="text-center py-4 px-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">This is your gig</p>
                  <p className="text-blue-600 text-sm mt-1">View applications in the section below</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Modal - Only show if not gig owner */}
        {showApplicationModal && !isGigOwner && (
          <ApplicationModal
            gig={data}
            onClose={() => setShowApplicationModal(false)}
            onSubmit={handleApplicationSubmit}
          />
        )}

        {/* Profile Modal */}
        {viewingProfile && (
          <ProfileModal 
            marketer={viewingProfile} 
            onClose={() => setViewingProfile(null)} 
          />
        )}
      </div>
    </div>
  )
}

export default Gig