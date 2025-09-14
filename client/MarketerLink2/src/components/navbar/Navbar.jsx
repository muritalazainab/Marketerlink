import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, User, LogOut, Plus, MessageCircle, Settings, ChevronDown, LayoutDashboard, Bell } from "lucide-react"
import newRequest from "../../../utils/newRequest"
import NotificationDropdown from '../Notification/NotificationDropdown';

function Navbar() {
  const [active, setActive] = useState(false)
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false)
  }

  useEffect(() => {
    window.addEventListener("scroll", isActive)
    return () => {
      window.removeEventListener("scroll", isActive)
    }
  }, [])

  // Close dropdown when pathname changes (fixes the persistent dropdown issue)
  useEffect(() => {
    setOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  const getCurrentUser = () => {
    try {
      const userString = localStorage.getItem('currentUser');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('currentUser');
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const handleLogout = async () => {
    try {
      sessionStorage.setItem("isLoggingOut", "true")
      
      // Close dropdown immediately on logout
      setOpen(false)
      setMobileMenuOpen(false)
      
      await newRequest.post("/auth/logout")

      localStorage.removeItem("currentUser")
      localStorage.removeItem("token")
      sessionStorage.removeItem("isLoggingOut")

      navigate("/")
    } catch (err) {
      console.log(err)
      localStorage.removeItem("currentUser")
      localStorage.removeItem("token")
      sessionStorage.removeItem("isLoggingOut")
      navigate("/")
    }
  }

  const isHomePage = pathname === "/"
  const isDashboardPage = pathname.includes('dashboard')
  const isSellerDashboard = pathname === '/seller-dashboard'
  const isMarketerDashboard = pathname === '/marketer-dashboard'

  // Determine dashboard link based on user type
  const getDashboardLink = () => {
    if (!currentUser) return null
    if (currentUser.isSeller && currentUser.role !== "marketer") {
      return '/seller-dashboard'
    } else {
      return '/marketer-dashboard'
    }
  }

  const getDashboardLabel = () => {
    if (!currentUser) return 'Dashboard'
    if (currentUser.isSeller && currentUser.role !== "marketer") {
      return 'Seller Dashboard'
    } else {
      return 'Marketer Dashboard'
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      active || !isHomePage 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" 
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-1">
              <div className={`text-2xl font-bold transition-colors ${
                active || !isHomePage ? "text-gray-900" : "text-white"
              }`}>
                Marketer<span className="text-blue-600">Link</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* Navigation Links */}
              {currentUser && !currentUser.isSeller && (
                <Link
                  to="/create-profile"
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                    active || !isHomePage ? "text-gray-700" : "text-white hover:text-blue-200"
                  }`}
                >
                  Create Profile
                </Link>
              )}
            </div>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {currentUser && (
                <>
                  {/* Notification Dropdown */}
                  <NotificationDropdown />
                  
                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpen(!open)}
                      className="flex items-center space-x-3 bg-white rounded-full p-1 pr-3 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <img
                        src={currentUser.img || "/images/noavatar.jpg"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                      <span className="text-gray-700 font-medium text-sm">
                        {currentUser?.username}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Dropdown Menu */}
                    {open && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                          <p className="text-sm text-gray-500">
                            {currentUser.isSeller ? "Seller Account" : "Marketer Account"}
                          </p>
                        </div>

                        {/* Dashboard Link - Only show if not already on dashboard and user is logged in */}
                        {currentUser && !isDashboardPage && getDashboardLink() && (
                          <Link
                            to={getDashboardLink()}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3" />
                            {getDashboardLabel()}
                          </Link>
                        )}

                        {currentUser.isSeller && (
                          <Link
                            to="/add"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <Plus className="w-4 h-4 mr-3" />
                            Add New Gig
                          </Link>
                        )}

                        <Link
                          to="/messages"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <MessageCircle className="w-4 h-4 mr-3" />
                          Messages
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!currentUser && (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                      active || !isHomePage ? "text-gray-700" : "text-white hover:text-blue-200"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg border-t border-gray-200">
              <Link
                to="/gigs"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Gigs
              </Link>
              
              {currentUser && !currentUser.isSeller && (
                <Link
                  to="/create-profile"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Profile
                </Link>
              )}

              {currentUser ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center px-3 py-2">
                      <img
                        src={currentUser.img || "/images/noavatar.jpg"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                        <p className="text-xs text-gray-500">
                          {currentUser.isSeller ? "Seller" : "Marketer"}
                        </p>
                      </div>
                    </div>

                    {/* Dashboard Link for Mobile - Only show if not on dashboard */}
                    {currentUser && !isDashboardPage && getDashboardLink() && (
                      <Link
                        to={getDashboardLink()}
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {getDashboardLabel()}
                      </Link>
                    )}

                    {currentUser.isSeller && (
                      <Link
                        to="/add"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Add New Gig
                      </Link>
                    )}

                    <Link
                      to="/messages"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block mx-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar