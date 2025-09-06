"use client"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import newRequest from "../../../utils/newRequest"
import Reviews from "../../components/reviews/Reviews"
import ApplicationModal from "../marketerModal/ApplicationModal"
import { useState } from "react"

function Gig() {
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const { id } = useParams()

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  const handleApplicationSubmit = async (applicationData) => {
    try {
      const response = await newRequest.post("/applications", applicationData)
      alert("Application submitted successfully!")
      // Optionally refresh or redirect
    } catch (error) {
      console.error("Failed to submit application:", error)
      throw error
    }
  }

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  })

  const userId = data?.userId

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => newRequest.get(`/users/${userId}`).then((res) => res.data),
    enabled: !!userId,
  })

  // Check if current user is the gig owner
  const isGigOwner = currentUser && data && currentUser._id === data.userId

  // Fetch applications if user is the gig owner
  const { data: gigApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["gigApplications", id],
    queryFn: () => newRequest.get(`/applications/gig/${id}`).then((res) => res.data),
    enabled: isGigOwner,
  })

  return (
    <div className="flex justify-center">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="w-[1400px] py-8 flex gap-12">
          {/* LEFT */}
          <div className="flex-[2] flex flex-col gap-5">
            <span className="uppercase text-xs font-light text-gray-600">
              Fiverr {">"} Graphics & Design {">"}
            </span>

            <h1 className="text-2xl font-semibold">{data.title}</h1>

            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="flex items-center gap-3">
                <img className="w-8 h-8 rounded-full object-cover" src={dataUser.img || "/img/noavatar.jpg"} alt="" />
                <span className="text-sm font-medium">{dataUser.username}</span>
                {!isNaN(data.totalStars / data.starNumber) && (
                  <div className="flex items-center gap-1">
                    {Array(Math.round(data.totalStars / data.starNumber))
                      .fill()
                      .map((_, i) => (
                        <img src="/images/star.jpg" alt="" key={i} className="w-4 h-4" />
                      ))}
                    <span className="text-sm font-bold text-yellow-400">
                      {Math.round(data.totalStars / data.starNumber)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Slider */}
            <Slider slidesToShow={1} arrowsScroll={1} className="bg-gray-100">
              {data.images.map((img) => (
                <img key={img} src={img} alt="" className="max-h-[500px] object-contain" />
              ))}
            </Slider>

            <h2 className="text-xl font-medium">About This Gig</h2>
            <p className="text-gray-700 font-light leading-6">{data.desc}</p>

            {/* Show Applications if user is gig owner */}
            {isGigOwner && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Applications ({gigApplications?.length || 0})</h2>
                {applicationsLoading ? (
                  <div>Loading applications...</div>
                ) : gigApplications && gigApplications.length > 0 ? (
                  <div className="space-y-4">
                    {gigApplications.map((app) => (
                      <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{app.marketerId?.username}</h4>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>Bid: ${app.bidAmount}</span>
                              <span>Delivery: {app.deliveryTime} days</span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  app.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : app.status === "accepted"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{app.proposal}</p>
                        {app.status === "pending" && (
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                              Accept
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">No applications yet</div>
                )}
              </div>
            )}

            {/* Seller Section - Only show if not gig owner */}
            {!isGigOwner &&
              (isLoadingUser ? (
                "loading"
              ) : errorUser ? (
                "Something went wrong!"
              ) : (
                <div className="flex flex-col gap-6 mt-12">
                  <h2 className="text-xl font-semibold">About The Seller</h2>
                  <div className="flex items-center gap-6">
                    <img
                      src={dataUser.img || "/images/noavatar.jpg"}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="flex flex-col gap-2">
                      <span className="text-lg font-medium">{dataUser.username}</span>
                      {!isNaN(data.totalStars / data.starNumber) && (
                        <div className="flex items-center gap-1">
                          {Array(Math.round(data.totalStars / data.starNumber))
                            .fill()
                            .map((_, i) => (
                              <img src="/img/star.jpg" alt="" key={i} className="w-4 h-4" />
                            ))}
                          <span className="text-sm font-bold text-yellow-400">
                            {Math.round(data.totalStars / data.starNumber)}
                          </span>
                        </div>
                      )}
                      <button className="border border-gray-400 rounded-md px-4 py-2 bg-white text-sm hover:bg-gray-100 transition">
                        Contact Me
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-md p-6 mt-4">
                    <div className="flex flex-wrap justify-between">
                      <div className="w-[300px] flex flex-col gap-2 mb-4">
                        <span className="font-light">From</span>
                        <span>{dataUser.country}</span>
                      </div>
                      <div className="w-[300px] flex flex-col gap-2 mb-4">
                        <span className="font-light">Member since</span>
                        <span>Aug 2022</span>
                      </div>
                      <div className="w-[300px] flex flex-col gap-2 mb-4">
                        <span className="font-light">Avg. response time</span>
                        <span>4 hours</span>
                      </div>
                      <div className="w-[300px] flex flex-col gap-2 mb-4">
                        <span className="font-light">Last delivery</span>
                        <span>1 day</span>
                      </div>
                      <div className="w-[300px] flex flex-col gap-2 mb-4">
                        <span className="font-light">Languages</span>
                        <span>English</span>
                      </div>
                    </div>
                    <hr className="border-gray-300 my-4" />
                    <p className="text-gray-600">{dataUser.desc}</p>
                  </div>
                </div>
              ))}

            {/* {!isGigOwner && <Reviews gigId={id} />} */}
          </div>

          {/* RIGHT */}
          <div className="flex-1 border border-gray-300 rounded-md p-6 flex flex-col gap-5 h-max max-h-[500px] sticky top-36">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{data.shortTitle}</h3>
              <h2 className="text-xl font-light">$ {data.price}</h2>
            </div>
            <p className="text-gray-500">{data.shortDesc}</p>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <img src="/images/clock.jpg" alt="" className="w-5" />
                <span>{data.deliveryDate} Days Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/images/recycle.jpg" alt="" className="w-5" />
                <span>{data.revisionNumber} Revisions</span>
              </div>
            </div>
            <div>
              {data.features.map((feature) => (
                <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm" key={feature}>
                  <img src="/images/greencheck.jpg" alt="" className="w-4" />
                  <span>{}</span>
                </div>
              ))}
            </div>

            {/* Conditional Button */}
            {isGigOwner ? (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">This is your gig</p>
                <Link to="/seller-dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
                  Go to Dashboard
                </Link>feature
              </div>
            ) : (
              <button
                onClick={() => setShowApplicationModal(true)}
                className="bg-blue-600 text-white font-medium text-lg py-2 px-4 rounded-md hover:bg-blue-700 transition w-full"
              >
                Apply to this Gig
              </button>
            )}
          </div>
        </div>
      )}

      {/* Application Modal - Only show if not gig owner */}
      {showApplicationModal && !isGigOwner && (
        <ApplicationModal
          gig={data}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  )
}

export default Gig
