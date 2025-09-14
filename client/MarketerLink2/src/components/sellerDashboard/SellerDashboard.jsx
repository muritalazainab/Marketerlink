import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  Plus,
  Eye,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageCircle,
  FileText,
  AlertCircle,
  Star,
  X,
} from "lucide-react"
import newRequest from "../../../utils/newRequest"
import GigCard from "../gigCard/GigCard"

const SellerDashboard = () => {
  const [viewingProfile, setViewingProfile] = useState(null)
  const [activeTab, setActiveTab] = useState("gigs")
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const isSeller = currentUser && currentUser.isSeller && currentUser.role !== "marketer"

  const { data: myGigs, isLoading: gigsLoading } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () => newRequest.get("/gigs/my").then((res) => res.data),
    enabled: !!isSeller,
  })

  // Fetch applications for seller's gigs
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["gigApplications"],
    queryFn: () => newRequest.get("/applications/seller").then((res) => res.data),
    enabled: !!isSeller,
  })

  // Fetch conversations for chat functionality
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get("/conversations").then((res) => res.data),
    enabled: !!isSeller,
  })

  // Accept application mutation with conversation creation
  const acceptMutation = useMutation({
    mutationFn: async (applicationId) => {
      // First accept the application
      const response = await newRequest.put(`/applications/${applicationId}/accept`);
      
      // Get the application details to create conversation
      const application = applications?.find(app => app._id === applicationId);
      if (application && application.marketerId) {
        const marketerId = typeof application.marketerId === 'string' 
          ? application.marketerId 
          : application.marketerId._id;
        
        try {
          await newRequest.post("/conversations", { to: marketerId });
        } catch (convError) {
          console.log("Conversation might already exist:", convError);
        }
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gigApplications"])
      queryClient.invalidateQueries(["conversations"])
      queryClient.invalidateQueries(["myGigs"])
      alert("Application accepted! You can now message the marketer.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (applicationId) => newRequest.put(`/applications/${applicationId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(["gigApplications"])
    },
  })

  useEffect(() => {
    if (sessionStorage.getItem("isLoggingOut")) {
      return
    }
    const freshUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!freshUser) {
      navigate("/login")
      return
    }

    if (freshUser.role === "marketer" || !freshUser.isSeller) {
      navigate("/marketer-dashboard")
      return
    }
  }, [navigate])

  if (!isSeller) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You need seller privileges to access this dashboard.</p>
        </div>
      </div>
    )
  }

  const handleAccept = (applicationId) => {
    acceptMutation.mutate(applicationId)
  }

  const handleReject = (applicationId) => {
    rejectMutation.mutate(applicationId)
  }

  const showProfile = async (marketerId) => {
    console.log("Fetching profile for marketer ID:", marketerId)
    
    try {
      let marketerData = null
      
      try {
        const profileResponse = await newRequest.get(`/profiles/user/${marketerId}`)
        if (profileResponse.data && profileResponse.data.isComplete) {
          marketerData = profileResponse.data
        }
      } catch (profileErr) {
        console.log("Profile not found or incomplete, fetching basic user data")
      }
      
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

  const closeProfile = () => {
    setViewingProfile(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "in_progress":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending_payment":
        return "bg-yellow-100 text-yellow-700"
      case "paused":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  const getApplicationStatus = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "accepted":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Enhanced gigs with status information
  const getEnhancedGigs = () => {
    if (!myGigs) return []
    
    return myGigs.map(gig => {
      const acceptedApplications = applications?.filter(app => 
        app.gigId?._id === gig._id && app.status === 'accepted'
      ) || []
      
      const hasAcceptedApplications = acceptedApplications.length > 0
      
      // Find conversation for this gig
      const conversation = conversations?.find(conv => 
        acceptedApplications.some(app => {
          const marketerId = typeof app.marketerId === 'string' 
            ? app.marketerId 
            : app.marketerId._id
          return conv.buyerId === marketerId && conv.sellerId === currentUser._id
        })
      )
      
      return {
        ...gig,
        isInProgress: hasAcceptedApplications,
        conversationId: conversation?.id || null,
        acceptedApplicationsCount: acceptedApplications.length
      }
    })
  }

  const enhancedGigs = getEnhancedGigs()

  const ProfileModal = ({ marketer, onClose }) => {
    if (!marketer) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-blue-600 text-white p-6 rounded-t-lg relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                {marketer.profilePicture || marketer.avatar ? (
                  <img
                    src={marketer.profilePicture || marketer.avatar}
                    alt={marketer.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {marketer.fullName || marketer.username || "Unknown User"}
                </h2>
                <p className="text-blue-100">
                  {marketer.title || "Marketer"}
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

          <div className="p-6">
            {!marketer.isComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Limited Profile Information</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  This marketer hasn't completed their profile yet. The information below is from their basic registration.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {marketer.email || "Not provided"}</div>
                  <div><strong>Username:</strong> {marketer.username || "Not provided"}</div>
                  <div><strong>Phone:</strong> {marketer.phone || "Not provided"}</div>
                  <div><strong>Location:</strong> {marketer.location || marketer.country || "Not provided"}</div>
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
                        {marketer.averageRating || marketer.rating}
                      </div>
                    ) : (
                      "Not rated yet"
                    )}
                  </div>
                  <div><strong>Projects Completed:</strong> {marketer.completedProjects || "0"}</div>
                  <div><strong>Response Time:</strong> {marketer.responseTime || "Not available"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  {marketer.bio || marketer.description || 
                   (marketer.isComplete 
                     ? "This marketer has not provided a detailed description yet."
                     : "This marketer has not completed their profile yet. You can still contact them to discuss your project requirements."
                   )}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={onClose} 
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
              <Link 
                to="/messages"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Send Message
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.username}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Gigs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myGigs?.filter((g) => g.status === "active").length || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {enhancedGigs?.filter((g) => g.isInProgress).length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Applications</p>
              <p className="text-2xl font-semibold text-gray-900">
                {applications?.filter((a) => a.status === "pending").length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {applications?.filter((a) => a.status === "accepted").length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("gigs")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "gigs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Gigs
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "applications"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Applications ({applications?.filter((a) => a.status === "pending").length || 0})
          </button>
        </nav>
      </div>

      {/* My Gigs Tab with Enhanced Cards */}
      {activeTab === "gigs" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">My Gigs</h2>
            <Link
              to="/add"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create New Gig
            </Link>
          </div>

          {gigsLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {enhancedGigs?.map((gig) => (
                <GigCard
                  key={gig._id}
                  item={{
                    ...gig,
                    status: gig.isInProgress ? 'in_progress' : gig.status
                  }}
                  isInProgress={gig.isInProgress}
                  conversationId={gig.conversationId}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}

          {(!myGigs || myGigs.length === 0) && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No gigs created yet</p>
              <Link to="/add" className="text-blue-600 hover:text-blue-700 font-medium">
                Create your first gig
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
              <p className="text-sm text-gray-600">Review applicants and manage projects</p>
            </div>
          </div>

          {appsLoading ? (
            <div className="p-6">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications?.map((application) => (
                <div key={application._id} className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-medium text-gray-900">{application.gigId?.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getApplicationStatus(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {application.marketerId?.profilePicture ? (
                          <img
                            src={application.marketerId.profilePicture}
                            alt={application.marketerId.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {application.marketerId?.fullName || application.marketerId?.username || "Unknown User"}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>Bid: ${application.bidAmount}</span>
                          <span>Delivery: {application.deliveryTime} days</span>
                          <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          <strong>Proposal:</strong> {application.proposal}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          onClick={() => showProfile(application.marketerId?._id || application.marketerId)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {application.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(application._id)}
                          disabled={acceptMutation.isPending}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(application._id)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {application.status === "accepted" && (
                      <Link
                        to="/messages"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat with Marketer
                      </Link>
                    )}

                    <Link
                      to={`/gig/${application.gigId?._id}`}
                      className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Gig
                    </Link>
                  </div>
                </div>
              ))}

              {(!applications || applications.length === 0) && (
                <div className="p-6 text-center text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No applications yet</p>
                  <p className="text-sm">Applications will appear here when marketers apply to your gigs</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {viewingProfile && <ProfileModal marketer={viewingProfile} onClose={closeProfile} />}
    </div>
  )
}

export default SellerDashboard