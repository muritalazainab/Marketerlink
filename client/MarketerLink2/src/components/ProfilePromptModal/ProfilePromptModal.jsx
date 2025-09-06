"use client"
import { User, Star, Briefcase, X } from "lucide-react"

const ProfilePromptModal = ({ isOpen, onClose, onCreateProfile }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 text-sm">
            Create a compelling profile to stand out to potential clients and increase your chances of getting hired.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Showcase Your Skills</h3>
              <p className="text-gray-600 text-xs">Highlight your expertise and experience</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Build Trust</h3>
              <p className="text-gray-600 text-xs">Share your portfolio and social links</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Get More Applications</h3>
              <p className="text-gray-600 text-xs">Complete profiles get 3x more project invites</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            Maybe Later
          </button>
          <button
            onClick={onCreateProfile}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePromptModal
