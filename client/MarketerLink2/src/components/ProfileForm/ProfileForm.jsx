"use client"

import { useState, useEffect } from "react"
import { Plus, X, Save, ArrowLeft } from "lucide-react"
import newRequest from "../../../utils/newRequest"

const ProfileForm = ({ isModal = false, onClose = null, existingProfile = null }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    bio: "",
    location: "",
    skills: [],
    experience: "entry",
    hourlyRate: "",
    availability: "flexible",
    portfolio: [],
    socialLinks: {
      linkedin: "",
      twitter: "",
      website: "",
      github: "",
    },
  })

  const [newSkill, setNewSkill] = useState("")
  const [portfolioItem, setPortfolioItem] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Update form with existing profile data
  useEffect(() => {
    if (existingProfile && existingProfile.isComplete) {
      setFormData({
        fullName: existingProfile.fullName || "",
        title: existingProfile.title || "",
        bio: existingProfile.bio || "",
        location: existingProfile.location || "",
        skills: existingProfile.skills || [],
        experience: existingProfile.experience || "entry",
        hourlyRate: existingProfile.hourlyRate || "",
        availability: existingProfile.availability || "flexible",
        portfolio: existingProfile.portfolio || [],
        socialLinks: existingProfile.socialLinks || {
          linkedin: "",
          twitter: "",
          website: "",
          github: "",
        },
      })
    }
  }, [existingProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialLinksChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const addPortfolioItem = () => {
    if (portfolioItem.title.trim()) {
      setFormData((prev) => ({
        ...prev,
        portfolio: [...prev.portfolio, portfolioItem],
      }))
      setPortfolioItem({
        title: "",
        description: "",
        image: "",
        link: "",
      })
    }
  }

  const removePortfolioItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate required fields
    if (!formData.fullName.trim() || !formData.title.trim()) {
      setError("Full name and professional title are required.")
      setIsLoading(false)
      return
    }

    try {
      // Get current user to extract userId
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      if (!currentUser) {
        setError("User not found. Please login again.")
        setIsLoading(false)
        return
      }

      // Prepare complete profile data
      const profileData = {
        userId: currentUser.id || currentUser._id, // Handle different ID formats
        fullName: formData.fullName,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills,
        experience: formData.experience,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        availability: formData.availability,
        portfolio: formData.portfolio,
        socialLinks: formData.socialLinks,
        isComplete: true // Mark profile as complete
      }

      console.log("Sending profile data:", profileData)

      const response = await newRequest.post("/profiles", profileData)
      console.log("Profile save response:", response.data)

      setSuccess(true)
      setTimeout(() => {
        if (isModal && onClose) {
          onClose()
        }
      }, 1500)
    } catch (err) {
      console.error("Profile save error:", err)
      let errorMessage = "Failed to save profile. Please try again."
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' ? err.response.data : errorMessage
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      // In real implementation, use navigate(-1)
      console.log("Going back...")
    }
  }

  if (success) {
    return (
      <div className={`${isModal ? "p-6" : "max-w-4xl mx-auto p-6"}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Saved!</h2>
          <p className="text-gray-600">Your profile has been successfully created.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isModal ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" : "max-w-4xl mx-auto p-6"}`}>
      <div className={`${isModal ? "bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" : ""}`}>
        <div className="p-6">
          {!isModal && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={handleGoBack} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {existingProfile?.isComplete ? "Edit Profile" : "Create Your Profile"}
                </h1>
              </div>
              <p className="text-gray-600">Build a compelling profile to attract quality projects from sellers.</p>
            </div>
          )}

          {isModal && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
                <button onClick={handleGoBack} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600">Build a compelling profile to attract quality projects from sellers.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Digital Marketing Specialist"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell sellers about yourself, your experience, and what you can offer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h2>
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  placeholder="Project title"
                  value={portfolioItem.title}
                  onChange={(e) => setPortfolioItem((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  placeholder="Project description"
                  value={portfolioItem.description}
                  onChange={(e) => setPortfolioItem((prev) => ({ ...prev, description: e.target.value }))}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={portfolioItem.image}
                  onChange={(e) => setPortfolioItem((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Project link (optional)"
                    value={portfolioItem.link}
                    onChange={(e) => setPortfolioItem((prev) => ({ ...prev, link: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addPortfolioItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {formData.portfolio.length > 0 && (
                <div className="space-y-3">
                  {formData.portfolio.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePortfolioItem(index)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibent text-gray-900 mb-4">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.socialLinks).map(([platform, value]) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{platform}</label>
                    <input
                      type="url"
                      value={value}
                      onChange={(e) => handleSocialLinksChange(platform, e.target.value)}
                      placeholder={`Your ${platform} URL`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              {isModal && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm