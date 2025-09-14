import { useEffect, useRef, useState } from "react"
import GigCard from "../../components/gigCard/GigCard"
import { useQuery } from "@tanstack/react-query"
import newRequest from "../../../utils/newRequest"
import { useLocation } from "react-router-dom"
import { Filter, ChevronDown } from "lucide-react"

function Gigs() {
  const [sort, setSort] = useState("sales")
  const [open, setOpen] = useState(false)
  const minRef = useRef()
  const maxRef = useRef()

  const { search } = useLocation()
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Fetch gigs
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs"],
    queryFn: () =>
      newRequest
        .get(`/gigs${search}?min=${minRef.current.value}&max=${maxRef.current.value}&sort=${sort}`)
        .then((res) => res.data),
  })

  // Fetch user's applications to determine status
  const { data: userApplications } = useQuery({
    queryKey: ["userApplications"],
    queryFn: () => newRequest.get("/applications").then((res) => res.data),
    enabled: !!currentUser && !currentUser.isSeller, // Only fetch for marketers
  })

  // Fetch conversations to check for active chats
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get("/conversations").then((res) => res.data),
    enabled: !!currentUser,
  })

  const reSort = (type) => {
    setSort(type)
    setOpen(false)
  }

  useEffect(() => {
    refetch()
  }, [sort])

  const apply = () => {
    refetch()
  }

  // Filter and enhance gigs based on user's application status
  const getFilteredGigs = () => {
    if (!data) return []

    return data
      .map((gig) => {
        // Find user's application for this gig
        const userApplication = userApplications?.find(app => 
          (app.gigId?._id === gig._id || app.gigId === gig._id)
        )

        // Find conversation for this gig
        const conversation = conversations?.find(conv => 
          (currentUser.isSeller && conv.buyerId === gig.userId && conv.sellerId === currentUser._id) ||
          (!currentUser.isSeller && conv.sellerId === gig.userId && conv.buyerId === currentUser._id)
        )

        // Enhanced gig with status information
        const enhancedGig = {
          ...gig,
          userApplicationStatus: userApplication?.status || null,
          hasUserApplied: !!userApplication,
          conversationId: conversation?.id || null,
          isInProgress: userApplication?.status === 'accepted',
          isCompleted: gig.status === 'completed'
        }

        return enhancedGig
      })
      .filter((gig) => {
        // Filter out rejected applications entirely for marketers
        if (!currentUser.isSeller && gig.userApplicationStatus === 'rejected') {
          return false
        }
        
        // For sellers, show all their own gigs
        if (currentUser.isSeller && gig.userId === currentUser._id) {
          return true
        }
        
        // For marketers, don't show their own gigs (if they somehow have any)
        if (!currentUser.isSeller && gig.userId === currentUser._id) {
          return false
        }

        return true
      })
  }

  const filteredGigs = getFilteredGigs()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <span>MarketLink</span>
            <span className="mx-2">›</span>
            <span>Branding & Growth</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Marketing Experts</h1>
          <p className="text-gray-600">Connect with skilled marketers ready to grow your business and boost your sales</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left - Budget Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-medium">Budget:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={minRef}
                  type="number"
                  placeholder="Min"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  ref={maxRef}
                  type="number"
                  placeholder="Max"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={apply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Right - Sort */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{sort === "sales" ? "Best Selling" : "Newest"}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {open && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                    {sort === "sales" ? (
                      <button
                        onClick={() => reSort("createdAt")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        Newest
                      </button>
                    ) : (
                      <button
                        onClick={() => reSort("sales")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        Best Selling
                      </button>
                    )}
                    <button
                      onClick={() => reSort("sales")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      Popular
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 text-lg font-medium mb-2">Something went wrong!</div>
              <p className="text-gray-600">Please try refreshing the page</p>
            </div>
          ) : filteredGigs && filteredGigs.length > 0 ? (
            filteredGigs.map((gig) => (
              <GigCard 
                key={gig._id} 
                item={gig} 
                hasApplied={gig.hasUserApplied}
                applicationStatus={gig.userApplicationStatus}
                conversationId={gig.conversationId}
                isInProgress={gig.isInProgress}
                isCompleted={gig.isCompleted}
                currentUser={currentUser}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">No gigs found</div>
              <p className="text-gray-600">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Gigs