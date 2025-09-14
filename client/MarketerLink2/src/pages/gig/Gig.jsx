"use client"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import newRequest from "../../../utils/newRequest"
import Reviews from "../../components/reviews/Reviews"
import ApplicationModal from "../marketerModal/ApplicationModal"
import { useState } from "react"
import { User, X, Eye, AlertCircle, Star } from "lucide-react"

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

  // Accept/Reject functions
const handleAcceptApplication = async (applicationId) => {
  try {
    // First accept the application
    const response = await newRequest.put(`/applications/${applicationId}/accept`);
    
    // Get the application details to find the marketer
    const application = gigApplications?.find(app => app._id === applicationId);
    if (application && application.marketerId) {
      
      // Create conversation using your existing system
      const marketerId = typeof application.marketerId === 'string' 
        ? application.marketerId 
        : application.marketerId._id;
      
      const conversationData = {
        to: marketerId
      };
      
      try {
        await newRequest.post("/conversations", conversationData);
        console.log("Conversation created successfully");
      } catch (convError) {
        console.log("Conversation might already exist or error creating:", convError);
        // Don't fail the acceptance if conversation creation fails
      }
    }
    
    // Refresh the applications data
    window.location.reload(); // Or use queryClient.invalidateQueries if you have it set up
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
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                {marketer.img || marketer.profilePicture || marketer.avatar ? (
                  <img
                    src={marketer.img || marketer.profilePicture || marketer.avatar}
                    alt={safeString(marketer.username)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {safeString(marketer.fullName || marketer.username || "Unknown User")}
                </h2>
                <p className="text-blue-100">
                  {safeString(marketer.title || "Marketer")}
                </p>
                
                {!marketer.isComplete && (
                  <div className="mt-2">
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {safeString(marketer.email)}</div>
                  <div><strong>Username:</strong> {safeString(marketer.username)}</div>
                  <div><strong>Phone:</strong> {safeString(marketer.phone)}</div>
                  <div><strong>Location:</strong> {safeString(marketer.location || marketer.country)}</div>
                  <div><strong>Joined:</strong> {marketer.createdAt ? new Date(marketer.createdAt).toLocaleDateString() : "Date not available"}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Profile Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Rating:</strong>
                    {marketer.averageRating || marketer.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {safeString(marketer.averageRating || marketer.rating)}
                      </div>
                    ) : (
                      "Not rated yet"
                    )}
                  </div>
                  <div><strong>Projects Completed:</strong> {safeString(marketer.completedProjects || "0")}</div>
                  <div><strong>Response Time:</strong> {safeString(marketer.responseTime || "Not available")}</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
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
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {marketer.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {safeString(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {marketer.portfolio && Array.isArray(marketer.portfolio) && marketer.portfolio.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketer.portfolio.map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{safeString(project.title)}</h4>
                      <p className="text-gray-600 text-sm mb-2">{safeString(project.description)}</p>
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

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={onClose} 
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="w-[1400px] py-8 flex gap-12">
          {/* LEFT */}
          <div className="flex-[2] flex flex-col gap-5">
            <h1 className="text-2xl font-semibold">{data.title || 'Untitled'}</h1>

            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="flex items-center gap-3">
                <img className="w-8 h-8 rounded-full object-cover" src={dataUser.img || "/images/noavatar.jpg"} alt="" />
                <span className="text-sm font-medium">{dataUser.username || 'Unknown User'}</span>
                {!isNaN(data.totalStars / data.starNumber) && (
                  <div className="flex items-center gap-1">
                    {Array(Math.round(data.totalStars / data.starNumber))
                      .fill()
                      .map((_, i) => (
                        <img src="/images/star.jpg" alt="" key={i} className="w-4 h-4" />
                      ))}
                    <span className="text-sm font-bold text-yellow-400">
                      {Math.round(data.totalStars / data.starNumber)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Slider */}
            {data.images && data.images.length > 0 && (
              <Slider slidesToShow={1} arrowsScroll={1} className="bg-gray-100">
                {data.images.map((img, index) => (
                  <img key={index} src={img} alt="" className="max-h-[500px] object-contain" />
                ))}
              </Slider>
            )}

            <h2 className="text-xl font-medium">About This Gig</h2>
            <p className="text-gray-700 font-light leading-6">{data.desc || 'No description available'}</p>

            {/* Show Applications if user is gig owner */}
            {isGigOwner && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Applications ({gigApplications?.length || 0})</h2>
                {applicationsLoading ? (
                  <div>Loading applications...</div>
                ) : gigApplications && gigApplications.length > 0 ? (
                  <div className="space-y-4">
                    {gigApplications.map((app) => {
                      const marketerInfo = getMarketerInfo(app.marketerId)
                      console.log("Processing application:", app)
                      console.log("Marketer info extracted:", marketerInfo)

                      return (
                        <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{marketerInfo.name}</h4>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>Bid: ${app.bidAmount || 0}</span>
                                <span>Delivery: {app.deliveryTime || 0} days</span>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
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
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{app.proposal || 'No proposal provided'}</p>
                          
                     <div className="flex gap-2">
  {app.status === "pending" && (
    <>
      <button 
        onClick={() => handleAcceptApplication(app._id)}
        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
      >
        Accept
      </button>
      <button 
        onClick={() => handleRejectApplication(app._id)}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Reject
      </button>
    </>
  )}
  
  {/* ADD THIS BLOCK HERE */}
  {app.status === "accepted" && (
    <div className="flex gap-2">
      <Link 
        to="/messages"
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Go to Messages
      </Link>
    </div>
  )}
  
  <button 
    onClick={() => viewMarketerProfile(marketerInfo.id)}
    className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
  >
    <Eye className="w-3 h-3" />
    View Profile
  </button>
</div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">No applications yet</div>
                )}
              </div>
            )}

            {/* Seller Section - Only show if not gig owner */}
            {!isGigOwner && !isLoadingUser && !errorUser && dataUser && (
              <div className="flex flex-col gap-6 mt-12">
                <h2 className="text-xl font-semibold">About The Seller</h2>
                <div className="flex items-center gap-6">
                  <img
                    src={dataUser.img || "/images/noavatar.jpg"}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-medium">{dataUser.username || 'Unknown User'}</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="flex items-center gap-1">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((_, i) => (
                            <img src="/images/star.jpg" alt="" key={i} className="w-4 h-4" />
                          ))}
                        <span className="text-sm font-bold text-yellow-400">
                          {Math.round(data.totalStars / data.starNumber)}
                        </span>
                      </div>
                    )}
                    <button className="border border-gray-400 rounded-md px-4 py-2 bg-white text-sm hover:bg-gray-100 transition">
                      Contact Me
                    </button>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-md p-6 mt-4">
                  <div className="flex flex-wrap justify-between">
                    <div className="w-[300px] flex flex-col gap-2 mb-4">
                      <span className="font-light">From</span>
                      <span>{dataUser.country || 'Not specified'}</span>
                    </div>
                    <div className="w-[300px] flex flex-col gap-2 mb-4">
                      <span className="font-light">Member since</span>
                      <span>{dataUser.createdAt ? new Date(dataUser.createdAt).getFullYear() : 'Unknown'}</span>
                    </div>
                    <div className="w-[300px] flex flex-col gap-2 mb-4">
                      <span className="font-light">Avg. response time</span>
                      <span>4 hours</span>
                    </div>
                    <div className="w-[300px] flex flex-col gap-2 mb-4">
                      <span className="font-light">Last delivery</span>
                      <span>1 day</span>
                    </div>
                    <div className="w-[300px] flex flex-col gap-2 mb-4">
                      <span className="font-light">Languages</span>
                      <span>English</span>
                    </div>
                  </div>
                  <hr className="border-gray-300 my-4" />
                  <p className="text-gray-600">{dataUser.desc || 'No description available'}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
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

            {/* Conditional Button */}
            {isGigOwner ? (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">This is your gig</p>
                <Link to="/seller-dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setShowApplicationModal(true)}
                className="bg-blue-600 text-white font-medium text-lg py-2 px-4 rounded-md hover:bg-blue-700 transition w-full"
              >
                Apply to this Gig
              </button>
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
  )
}

export default Gig