"use client"

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
    enabled: !!isSeller, // Only run query if user is a seller
  })

  // Fetch applications for seller's gigs
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["gigApplications"],
    queryFn: () => newRequest.get("/applications/seller").then((res) => res.data),
    enabled: !!isSeller, // Only run query if user is a seller
  })

  // Accept application mutation
  const acceptMutation = useMutation({
    mutationFn: (applicationId) => newRequest.put(`/applications/${applicationId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries(["gigApplications"])
      alert("Application accepted! You can now message the marketer.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (applicationId) => newRequest.put(`/applications/${applicationId}/reject`),
    onSuccess: () => queryClient.invalidateQueries(["gigApplications"]),
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

  // Simple function to show profile
  const showProfile = (marketer) => {
    console.log("Showing profile for:", marketer)
    setViewingProfile(marketer)
  }

  const closeProfile = () => {
    setViewingProfile(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
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

  // Simple Profile Modal Component
  const ProfileModal = ({ marketer, onClose }) => {
    if (!marketer) return null

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
                {marketer.profilePicture ? (
                  <img
                    src={marketer.profilePicture || "/placeholder.svg"}
                    alt={marketer.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{marketer.fullName || marketer.username || "Unknown User"}</h2>
                <p className="text-blue-100">{marketer.title || "Marketer"}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Email:</strong> {marketer.email || "Not provided"}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Username:</strong> {marketer.username || "Not provided"}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Phone:</strong> {marketer.phone || "Not provided"}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Location:</strong> {marketer.location || marketer.country || "Not provided"}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Joined:</strong>{" "}
                    {marketer.createdAt ? new Date(marketer.createdAt).toLocaleDateString() : "Date not available"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Profile Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Rating:</strong>
                    <span className="flex items-center gap-1">
                      {marketer.rating ? (
                        <>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {marketer.rating}
                        </>
                      ) : (
                        "Not rated yet"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Projects Completed:</strong> {marketer.completedProjects || "0"}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Response Time:</strong> {marketer.responseTime || "Not available"}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Account Status:</strong>
                    <span
                      className={`px-2 py-1 text-xs rounded ${marketer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {marketer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio/Description */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  {marketer.bio ||
                    marketer.description ||
                    "This marketer has not provided a detailed description yet, but they are registered and available for projects."}
                </p>
              </div>
            </div>

            {/* Skills */}
            {marketer.skills && marketer.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {marketer.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {marketer.languages && marketer.languages.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                <div className="space-y-2">
                  {marketer.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{lang.language || lang}</span>
                      <span className="text-sm text-gray-500">{lang.level || "Proficient"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 justify-end">
              <button onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
                Close
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Send Message</button>
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
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${myGigs?.reduce((sum, gig) => sum + (gig.isFunded ? gig.price : 0), 0) || 0}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
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

      {/* Content */}
      {activeTab === "gigs" && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Gigs</h2>
              <Link
                to="/add"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create New Gig
              </Link>
            </div>
          </div>

          {gigsLoading ? (
            <div className="p-6">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myGigs?.map((gig) => (
                <div key={gig._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{gig.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(gig.status)}`}>
                          {gig.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{gig.shortDesc}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />${gig.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {gig.deliveryTime} days
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {applications?.filter((a) => a.gigId._id === gig._id).length || 0} applications
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/gig/${gig._id}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {(!myGigs || myGigs.length === 0) && (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No gigs created yet</p>
                  <Link to="/add" className="text-blue-600 hover:text-blue-700 font-medium">
                    Create your first gig
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "applications" && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
              <p className="text-sm text-gray-600">Review applicants and view their profiles</p>
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

                  {/* Applicant Info Card */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {application.marketerId?.profilePicture ? (
                          <img
                            src={application.marketerId.profilePicture || "/placeholder.svg"}
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
                          onClick={() => showProfile(application.marketerId)}
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
                        to={`/project/${application._id}`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        View Project
                      </Link>
                    )}

                    <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
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
