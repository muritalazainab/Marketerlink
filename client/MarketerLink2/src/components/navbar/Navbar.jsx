import { useEffect, useState, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, User, LogOut, Plus, MessageCircle, Settings, ChevronDown, LayoutDashboard, Bell, Mail } from "lucide-react"
import newRequest from "../../../utils/newRequest"
import NotificationDropdown from '../Notification/NotificationDropdown';
import useUnreadConversationsCount from "../../components/useUnreadConversationsCount ";

// Helper function to get user from localStorage
const getUserFromStorage = () => {
  try {
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
      console.log('No user in localStorage');
      return null;
    }
    
    const user = JSON.parse(userString);
    console.log('Retrieved user from storage:', user);
    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('currentUser');
    return null;
  }
};

function Navbar() {
  const [active, setActive] = useState(false)
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [messages, setMessages] = useState([])
  const [showMessageDropdown, setShowMessageDropdown] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [userLoaded, setUserLoaded] = useState(false)

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

  // Close dropdowns when pathname changes
  useEffect(() => {
    setOpen(false)
    setMobileMenuOpen(false)
    setShowMessageDropdown(false)
  }, [pathname])

  // Function to refresh current user (can be called from other components)
  const refreshCurrentUser = useCallback(() => {
    console.log('Refreshing current user...');
    const user = getUserFromStorage();
    setCurrentUser(user);
    setUserLoaded(true);
  }, []);

  // Make refreshCurrentUser available globally so login/register can call it
  useEffect(() => {
    window.refreshNavbarUser = refreshCurrentUser;
    return () => {
      delete window.refreshNavbarUser;
    };
  }, [refreshCurrentUser]);

  // Get user on component mount
  useEffect(() => {
    console.log('Navbar mounting, getting current user...');
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  // Listen for localStorage changes (useful for multiple tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        console.log('localStorage changed, refreshing user...');
        refreshCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshCurrentUser]);

  const { unreadCount, isLoading, error } = useUnreadConversationsCount();

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    if (!currentUser) {
      console.log('No currentUser, skipping message fetch');
      return;
    }

    console.log('Fetching messages for user:', currentUser.username);

    try {
      const response = await newRequest.get("/conversations");
      const conversations = response.data;
      
      if (!Array.isArray(conversations)) {
        console.log('Invalid conversations data:', conversations);
        setUnreadMessages(0);
        setMessages([]);
        return;
      }

      console.log('Fetched conversations:', conversations.length);

      let unreadCount = 0;
      const recentMessages = [];
      
      conversations.forEach(conversation => {
        const lastMessage = conversation.lastMessage || conversation.messages?.[0];
        
        if (lastMessage) {
          const isMessageUnread = lastMessage.isRead === false || 
                                 (lastMessage.readBy && !lastMessage.readBy.includes(currentUser.id));
          
          if (isMessageUnread) {
            unreadCount++;
          }

          let senderName = 'Unknown';
          if (lastMessage.userId === currentUser.id) {
            senderName = 'You';
          } else {
            senderName = lastMessage.senderName || 
                        lastMessage.sender?.username || 
                        lastMessage.sender?.name ||
                        conversation.buyerId || 
                        conversation.sellerId || 
                        'Unknown User';
          }

          const messageContent = lastMessage.desc || 
                               lastMessage.message || 
                               lastMessage.content || 
                               lastMessage.text || 
                               'No message content';

          recentMessages.push({
            id: lastMessage.id || conversation.id,
            sender: senderName,
            message: messageContent,
            time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Unknown time',
            isRead: !isMessageUnread,
            conversationId: conversation.id
          });
        }
      });
      
      console.log('Processed messages - unread count:', unreadCount);
      setUnreadMessages(unreadCount);
      setMessages(recentMessages.slice(0, 5));
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 401) {
        console.log('Unauthorized, clearing user data');
        setUnreadMessages(0);
        setMessages([]);
      }
    }
  }, [currentUser]);

  // Fetch messages when user is loaded and available
  useEffect(() => {
    if (currentUser && userLoaded) {
      console.log('User loaded, starting message fetch and polling');
      fetchMessages();
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    } else if (!currentUser && userLoaded) {
      console.log('No user but loaded, clearing messages');
      setUnreadMessages(0);
      setMessages([]);
    }
  }, [currentUser, userLoaded, fetchMessages]);

  const markMessageAsRead = async (conversationId) => {
    try {
      await newRequest.put(`/conversations/${conversationId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      sessionStorage.setItem("isLoggingOut", "true")
      
      setOpen(false)
      setMobileMenuOpen(false)
      setShowMessageDropdown(false)
      
      await newRequest.post("/auth/logout")

      localStorage.removeItem("currentUser")
      localStorage.removeItem("token")
      sessionStorage.removeItem("isLoggingOut")

      setCurrentUser(null)
      setUnreadMessages(0)
      setMessages([])

      console.log('Logout successful, navigating to home');
      navigate("/")
    } catch (err) {
      console.error('Logout error:', err)
      localStorage.removeItem("currentUser")
      localStorage.removeItem("token")
      sessionStorage.removeItem("isLoggingOut")
      
      setCurrentUser(null)
      setUnreadMessages(0)
      setMessages([])
      
      navigate("/")
    }
  }

  const isHomePage = pathname === "/"
  const isDashboardPage = pathname.includes('dashboard')
  const isSellerDashboard = pathname === '/seller-dashboard'
  const isMarketerDashboard = pathname === '/marketer-dashboard'

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

  const truncateMessage = (message, maxLength = 50) => {
    if (!message || typeof message !== 'string') {
      return 'No message content';
    }
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const handleMessageClick = (msg) => {
    try {
      if (!msg.isRead && msg.conversationId) {
        markMessageAsRead(msg.conversationId);
      }
      navigate(`/message/${msg.conversationId}`);
      setShowMessageDropdown(false);
    } catch (error) {
      console.error('Error handling message click:', error);
      navigate('/messages');
      setShowMessageDropdown(false);
    }
  };

  // Debug logs
  console.log('=== NAVBAR RENDER DEBUG ===');
  console.log('userLoaded:', userLoaded);
  console.log('currentUser exists:', !!currentUser);
  console.log('currentUser:', currentUser);
  console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
  console.log('========================');

  // Show loading state until user is loaded
  if (!userLoaded) {
    return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-1">
                <div className="text-2xl font-bold text-gray-900">
                  Marketer<span className="text-blue-600">Link</span>
                </div>
              </Link>
            </div>
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
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
          {/* <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/gigs"
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  active || !isHomePage ? "text-gray-700" : "text-white hover:text-blue-200"
                }`}
              >
                Browse Gigs
              </Link>
            </div>
          </div> */}

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {currentUser ? (
                <>
                  {/* Messages Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMessageDropdown(!showMessageDropdown)}
                      className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Mail className="w-6 h-6" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </button>

                    {/* Messages Dropdown */}
                    {showMessageDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
                          <Link to="/messages" className="relative flex items-center gap-1">
                            Messages
                            {!isLoading && !error && unreadCount > 0 && (
                              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {messages && messages.length > 0 ? (
                            messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                                  msg.isRead ? 'border-transparent' : 'border-blue-500 bg-blue-50'
                                }`}
                                onClick={() => handleMessageClick(msg)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      msg.isRead ? 'text-gray-700' : 'text-gray-900'
                                    }`}>
                                      {msg.sender || 'Unknown User'}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                      msg.isRead ? 'text-gray-500' : 'text-gray-700'
                                    }`}>
                                      {truncateMessage(msg.message)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end ml-2">
                                    <span className="text-xs text-gray-400">{msg.time}</span>
                                    {!msg.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No messages yet</p>
                              <p className="text-xs text-gray-400 mt-1">Start a conversation to see messages here</p>
                            </div>
                          )}
                        </div>

                        {messages && messages.length > 0 && (
                          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <Link
                              to="/messages"
                              className="block w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                              onClick={() => setShowMessageDropdown(false)}
                            >
                              Go to Messages
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

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

                        {/* Dashboard Link */}
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

                        {/* Create Profile Link */}
                        {currentUser && !currentUser.isSeller && (
                          <Link
                            to="/create-profile"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Create Profile
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
              ) : (
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
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                        <p className="text-xs text-gray-500">
                          {currentUser.isSeller ? "Seller" : "Marketer"}
                        </p>
                      </div>
                      {unreadMessages > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadMessages}
                        </div>
                      )}
                    </div>

                    {/* Dashboard Link for Mobile */}
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