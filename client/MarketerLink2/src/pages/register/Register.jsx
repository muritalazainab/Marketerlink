import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Upload, User, Mail, Lock, Phone, MapPin, FileText, AlertCircle } from "lucide-react";
import upload from "../../../utils/upload";
import newRequest from "../../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import ProfilePromptModal from '../../components/ProfilePromptModal/ProfilePromptModal';
import ProfileForm from '../../components/ProfileForm/ProfileForm';

export default function Register() {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    img: "",
    country: "",
    phone: "",
    isSeller: false,
    desc: "",
  });
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSeller = (e) => {
    setUser((prev) => ({ ...prev, isSeller: e.target.checked }));
  };

  const handleCreateProfile = () => {
    setShowProfilePrompt(false);
    setShowProfileForm(true);
  };

  const handleClosePrompt = () => {
    setShowProfilePrompt(false);
    // Navigate to dashboard after closing prompt
    navigate("/marketer-dashboard");
  };

  const handleProfileComplete = () => {
    setShowProfileForm(false);
    navigate("/marketer-dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting registration with:', { username: user.username, email: user.email });

      // Validate required fields
      if (!user.username || !user.email || !user.password || !user.country) {
        setError('Please fill in username, email, password and country.');
        setIsLoading(false);
        return;
      }

      // Upload file if provided
      let imgUrl = '';
      if (file) {
        try {
          console.log('Uploading file...');
          imgUrl = await upload(file);
          console.log('File uploaded successfully:', imgUrl);
        } catch (uploadErr) {
          console.warn('Upload failed, proceeding without image:', uploadErr);
          imgUrl = '';
        }
      }

      // Prepare registration payload
      const payload = { ...user, img: imgUrl };
      console.log('Sending registration payload:', { ...payload, password: '[HIDDEN]' });

      // Send registration request
      const response = await newRequest.post('/auth/register', payload);
      console.log('Registration response:', response);

      // Extract user data and token from response
      let userData = null;
      let token = null;

      // Try different response formats
      if (response?.data) {
        // Format 1: {user: {...}, token: "..."}
        if (response.data.user) {
          userData = response.data.user;
          token = response.data.token;
        }
        // Format 2: {token: "...", id: "...", username: "...", ...} (user data directly in data)
        else if (response.data.id || response.data.username) {
          userData = response.data;
          token = response.data.token;
        }
        // Format 3: Just user data, no token
        else {
          userData = response.data;
          // Try to get token from headers or other places
          token = response.headers?.authorization || response.data.token;
        }
      }

      // If we don't have user data, something went wrong
      if (!userData || !userData.username) {
        console.error('Invalid user data received:', userData);
        throw new Error('Registration successful but user data is invalid');
      }

      console.log('Processing successful registration with user:', userData);

      // Store user data and token
      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('token', token);
      }

      // Update navbar immediately
      if (window.refreshNavbarUser) {
        console.log('Refreshing navbar after registration');
        window.refreshNavbarUser();
      } else {
        console.warn('window.refreshNavbarUser not available');
      }

      // Navigate based on user type
      if (userData.isSeller || user.isSeller) {
        navigate('/seller-dashboard');
      } else {
        // For marketers, show profile prompt
        setShowProfilePrompt(true);
      }

    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data && typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-bold text-gray-900">
              Market<span className="text-blue-600">Link</span>
            </div>
          </Link>
          <p className="text-gray-600 mt-2">Join our community of marketers and campaigner</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-2xl font-bold text-white text-center">Create Your Account</h2>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* LEFT SECTION - Basic Info */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>

                {/* Username */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Username</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      name="username"
                      placeholder="johndoe"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

                {/* Profile Picture */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Profile Picture</label>
                  <div className="relative">
                    <Upload className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Country</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="country"
                      type="text"
                      placeholder="United States"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION - Seller Info */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Professional Information
                </h3>

                {/* Seller Toggle */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Become a Campaigner</h4>
                      <p className="text-sm text-gray-600">Offer your services to marketers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={handleSeller}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="phone"
                      type="text"
                      placeholder="+1 (555) 123-4567"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Description</label>
                  <div className="relative">
                    <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      placeholder="Tell us about yourself and your expertise..."
                      name="desc"
                      rows="4"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ProfilePromptModal
        isOpen={showProfilePrompt}
        onClose={handleClosePrompt}
        onCreateProfile={handleCreateProfile}
      />

      {showProfileForm && (
        <ProfileForm
          isModal={true}
          onClose={handleProfileComplete}
        />
      )}
    </div>
  );
}