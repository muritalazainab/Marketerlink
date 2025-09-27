import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { X, Send, DollarSign } from "lucide-react"
import { useToast } from '../../components/ToastNotification';

const ApplicationModal = ({ gig, onClose, onSubmit }) => {
    const toast = useToast();
  const [proposal, setProposal] = useState("")
  const [bidAmount, setBidAmount] = useState(gig.price)
  const [deliveryTime, setDeliveryTime] = useState(gig.deliveryTime || 7)
  const [isSubmitting, setIsSubmitting] = useState(false)
 const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!proposal.trim()) {
            toast.warning("Please write a proposal"); 
      return
    }

    setIsSubmitting(true)

    const applicationData = {
      gigId: gig._id,
      proposal: proposal.trim(),
      bidAmount: Number.parseFloat(bidAmount),
      deliveryTime: Number.parseInt(deliveryTime),
      status: "pending",
    }

    try {
      await onSubmit(applicationData)
      onClose()

      toast.success("Application submitted successfully!"); 
         navigate("/marketer-dashboard")
    } catch (error) {
      console.error("Failed to submit application:", error)
      toast.error("Failed to submit application. Please try again.");     } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Apply for this Gig</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Gig Summary */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-medium text-lg mb-2">{gig.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Budget: ${gig.price}
            </span>
            <span>Delivery: {gig.deliveryTime} days</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{gig.status || "Active"}</span>
          </div>
        </div>

        <div className="p-6">
          {/* Proposal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Proposal *</label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Explain why you're the perfect fit for this project. Include relevant experience, approach, and any questions..."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">{proposal.length}/1000 characters</p>
          </div>

          {/* Bid and Timeline */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid ($)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min="1"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Client budget: ${gig.price}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (days)</label>
              <input
                type="number"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                min="1"
                max="90"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Terms Note */}
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> By applying, you agree that if selected, the client's escrow funds (${gig.price})
              will be released to you upon successful completion and approval of the work.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !proposal.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationModal
