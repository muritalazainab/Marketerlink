import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Upload, User, Mail, Lock, Phone, MapPin, FileText, AlertCircle, Shield, Key } from "lucide-react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

export default function AdminRegister() {
  const [file, setFile] = useState(null);
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    img: "",
    country: "",
    phone: "",
    desc: "",
    adminKey: "", // Special admin key for verification
    role: "admin" // Set role as admin
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setAdmin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    // Basic validation
    if (!admin.username || !admin.email || !admin.password || !admin.confirmPassword) {
      return "Please fill in all required fields";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(admin.email)) {
      return "Please enter a valid email address";
    }

    // Password validation
    if (admin.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (admin.password !== admin.confirmPassword) {
      return "Passwords do not match";
    }

    // Admin key validation
    if (!admin.adminKey) {
      return "Admin key is required for admin registration";
    }

    return null;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  setSuccess(null);

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    setIsLoading(false);
    return;
  }

  try {
    let imgUrl = '';
    if (file) {
      try {
        imgUrl = await upload(file);
      } catch (uploadErr) {
        console.warn('Upload failed, proceeding without image:', uploadErr);
        imgUrl = '';
      }
    }

    const adminData = { 
         username: admin.username.trim(),
      email: admin.email.trim().toLowerCase(),
      password: admin.password,
      img: imgUrl,
      country: admin.country.trim(),
      phone: admin.phone.trim(),
      desc: admin.desc.trim(),
      adminKey: admin.adminKey.trim(), // ✅ Ensure no extra whitespace
      role: "admin",
      isAdmin: true
    };

    delete adminData.confirmPassword;

    // DEBUG: Log what we're sending
   console.log('Original admin key:', JSON.stringify(admin.adminKey));
    console.log('Trimmed admin key:', JSON.stringify(admin.adminKey.trim()));
    console.log('Admin key length:', admin.adminKey.length);
    console.log('Admin key trimmed length:', admin.adminKey.trim().length);
    
    const response = await newRequest.post('/auth/register-admin', adminData);

    if (response?.data) {
      setSuccess("Admin account created successfully! You can now login.");
      
      setAdmin({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        img: "",
        country: "",
        phone: "",
        desc: "",
        adminKey: "",
        role: "admin"
      });
      setFile(null);

      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
    }

  } catch (err) {
    console.error('Admin registration error:', err);
    console.error('Error response:', err.response?.data);
    
    let errorMessage = 'Registration failed';
   if (err.response?.status === 403) {
      errorMessage = err.response.data?.message || 'Invalid admin access key';
    } else if (err.response?.status === 400) {
      errorMessage = err.response.data?.message || 'Invalid data provided';
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error - please contact administrator';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-bold text-gray-900">
              Market<span className="text-red-600">Link</span> <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">ADMIN</span>
            </div>
          </Link>
          <p className="text-gray-600 mt-2">Create an administrator account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-red-600 to-orange-600">
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white text-center">Admin Registration</h2>
            </div>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* LEFT SECTION - Basic Info */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" />
                  Basic Information
                </h3>

                {/* Username */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Username *</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      name="username"
                      value={admin.username}
                      placeholder="admin_username"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="email"
                      type="email"
                      value={admin.email}
                      placeholder="admin@company.com"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={admin.password}
                      placeholder="Create a strong password"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={admin.confirmPassword}
                      placeholder="Confirm your password"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION - Admin Info */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Administrator Details
                </h3>

                {/* Admin Key */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Admin Access Key *</label>
                  <div className="relative">
                    <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="adminKey"
                      type="password"
                      value={admin.adminKey}
                      placeholder="Enter admin access key"
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Contact system administrator for access key</p>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Country</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      name="country"
                      type="text"
                      value={admin.country}
                      placeholder="United States"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
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
                      value={admin.phone}
                      placeholder="+1 (555) 123-4567"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-2">Description</label>
                  <div className="relative">
                    <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      placeholder="Brief description of your administrative role..."
                      name="desc"
                      rows="4"
                      value={admin.desc}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Admin Privileges Notice */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 text-sm">Administrator Privileges</h4>
                      <p className="text-red-700 text-xs mt-1">
                        This account will have full access to platform management, user oversight, financial tracking, and system administration.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Admin Account..." : "Create Administrator Account"}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an admin account?{" "}
                    <Link to="/admin-login" className="text-red-600 font-medium hover:text-red-700 hover:underline transition-colors">
                      Admin Sign In
                    </Link>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    <Link to="/register" className="hover:text-gray-700 transition-colors">
                      Create regular user account instead
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}