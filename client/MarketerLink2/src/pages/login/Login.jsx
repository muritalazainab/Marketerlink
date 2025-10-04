"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import newRequest from "../../../utils/newRequest"
import { useNavigate } from "react-router-dom"
import { useToast } from '../../components/ToastNotification';

function Login() {
  const toast = useToast();
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"))
    if (user && !user.isSeller) {
      setShowProfilePrompt(true)
    }
  }, [])

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Attempting login with:', { username }); // Debug log
      
      const res = await newRequest.post("/auth/login", { username, password })
      
      const user = res.data

      console.log('Login successful, user data:', user); // Debug log

      // Store user data and token
      localStorage.setItem("currentUser", JSON.stringify(user))
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
      }

      // ✅ REFRESH NAVBAR IMMEDIATELY
      if (window.refreshNavbarUser) {
        console.log('Refreshing navbar after login'); // Debug log
        window.refreshNavbarUser();
      } else {
        console.warn('window.refreshNavbarUser not available'); // Debug log
      }

      toast.success(`Welcome back, ${user.username}!`);
      
      // Navigate based on user type
      if (user.isSeller) {
        navigate("/seller-dashboard")
      } else {
        navigate("/marketer-dashboard")
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      const errorMessage = err.response?.data || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-bold text-gray-900">
              Market<span className="text-blue-600">Link</span>
            </div>
          </Link>
          <p className="text-gray-600 mt-2">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-2">Username</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login