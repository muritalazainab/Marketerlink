

import { useReducer, useState } from "react"
import { Upload, Plus, X, CreditCard, ArrowLeft, Image, FileText, DollarSign, Clock, RefreshCw } from "lucide-react"
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer"
import upload from "../../../utils/upload"
import { useQueryClient } from "@tanstack/react-query"
import newRequest from "../../../utils/newRequest"
import { useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  "pk_test_51PqYk2KUYKxDqxIbYXbpp4KvQiSRSBEY2F7ISEHqCTsrP0mrKWhJ8mazcIOljedKjzH9ckSRKZvCMiyxW1R2VVgq003VmA2wVu",
)

// Payment Form Component
const PaymentForm = ({ gigData, onPaymentSuccess, onCancel, isLoading }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState("")

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setPaymentLoading(true)
    setPaymentError("")

    try {
      console.log("🔍 Creating gig with data:", gigData)

      const response = await newRequest.post("/gigs", gigData)
      const { clientSecret, gig } = response.data

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })

      if (error) {
        setPaymentError(error.message)
        await newRequest.delete(`/gigs/${gig._id}`)
      } else if (paymentIntent.status === "succeeded") {
        await newRequest.put(`/gigs/${gig._id}/fund`, {
          paymentIntentId: paymentIntent.id,
        })
        onPaymentSuccess(gig)
      }
    } catch (err) {
      setPaymentError("Payment failed. Please try again.")
      console.error(err)
    }

    setPaymentLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Payment
          </h2>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Escrow Deposit</span>
              <span className="text-2xl font-bold text-blue-600">${gigData.price}</span>
            </div>
            <p className="text-sm text-gray-600">This amount will be held safely until job completion</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#374151",
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                      "::placeholder": {
                        color: "#9CA3AF",
                      },
                    },
                  },
                }}
              />
            </div>

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {paymentError}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={paymentLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!stripe || paymentLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {paymentLoading ? "Processing..." : `Pay $${gigData.price}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [gigData, setGigData] = useState(null)

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    })
  }

  const handleFeature = (e) => {
    e.preventDefault()
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    })
    e.target[0].value = ""
  }

  const handleUpload = async () => {
    setUploading(true)
    try {
      const cover = await upload(singleFile)
      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file)
          return url
        }),
      )
      setUploading(false)
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } })
    } catch (err) {
      console.log(err)
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!state.title || !state.desc || !state.price) {
      alert("Please fill in all required fields")
      return
    }

    if (!state.cover) {
      alert("Please upload a cover image")
      return
    }

    setGigData(state)
    setShowPayment(true)
  }

  const handlePaymentSuccess = (gig) => {
    setShowPayment(false)
    queryClient.invalidateQueries(["myGigs"])
    alert("Gig created successfully! Your payment is held in escrow.")
    navigate("/seller-dashboard")
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setGigData(null)
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Create New Gig</h1>
            </div>
            <p className="text-gray-600">Set up your service offering and get started earning</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Section - Main Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gig Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="I will create amazing designs for your business"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select 
                      name="cat" 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    ><option value="social">Social Media Marketing</option>
<option value="seo">SEO & Web Traffic</option>
<option value="ads">Paid Ads (Google, Facebook, TikTok)</option>
<option value="email">Email Marketing</option>
<option value="content">Content Marketing</option>
<option value="influencer">Influencer Marketing</option>
<option value="affiliate">Affiliate & Referral Marketing</option>
<option value="strategy">Marketing Strategy & Research</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="desc"
                      rows="6"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Media & Images
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        onChange={(e) => setSingleFile(e.target.files[0])}
                        className="hidden"
                        id="cover-upload"
                        accept="image/*"
                      />
                      <label
                        htmlFor="cover-upload"
                        className="cursor-pointer flex flex-col items-center text-center"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload cover image</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setFiles(e.target.files)}
                        className="hidden"
                        id="gallery-upload"
                        accept="image/*"
                      />
                      <label
                        htmlFor="gallery-upload"
                        className="cursor-pointer flex flex-col items-center text-center"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload additional images</span>
                        <span className="text-xs text-gray-400 mt-1">Multiple files allowed</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={uploading || (!singleFile && !files.length)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      "Upload Images"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - Pricing & Details */}
            <div className="space-y-6">
              {/* Service Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Service Details
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Title
                    </label>
                    <input
                      type="text"
                      name="shortTitle"
                      placeholder="One-page website design"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="shortDesc"
                      onChange={handleChange}
                      placeholder="Brief summary of what you'll deliver"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time (days)
                      </label>
                      <input
                        type="number"
                        name="deliveryTime"
                        onChange={handleChange}
                        placeholder="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Revisions
                      </label>
                      <input
                        type="number"
                        name="revisionNumber"
                        onChange={handleChange}
                        placeholder="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Features Included
                </h2>

                <form onSubmit={handleFeature} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Responsive design, SEO optimization"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {state?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <span className="text-gray-700">{feature}</span>
                      <button
                        onClick={() => dispatch({ type: "REMOVE_FEATURE", payload: feature })}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Pricing & Payment
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Price (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="number"
                      name="price"
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      min="5"
                      placeholder="50"
                    />
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Escrow Protection:</span> This amount will be held safely until job completion
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Create Gig & Setup Payment
                </button>
              </div>
            </div>
          </div>

          {/* Payment Modal */}
          {showPayment && gigData && (
            <PaymentForm 
              gigData={gigData} 
              onPaymentSuccess={handlePaymentSuccess} 
              onCancel={handlePaymentCancel} 
            />
          )}
        </div>
      </div>
    </Elements>
  )
}

export default Add