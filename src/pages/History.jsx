import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { FiCalendar, FiCheckCircle, FiClock, FiX } from "react-icons/fi"

const History = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/history`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to fetch history")
        }

        const data = await response.json()
        setActivities(
          data.map((activity) => {
            let normalizedDate = "Unknown Date";
            try {
              const dateObj = new Date(activity.date);
              if (!isNaN(dateObj.getTime())) {
                normalizedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
              }
            } catch (err) {
              console.warn(`Invalid date for activity ${activity._id}: ${activity.date}`);
            }
            return {
              ...activity,
              id: activity._id,
              date: normalizedDate,
            };
          })
        )
      } catch (error) {
        console.error("Error fetching history:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  const formatDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString();
      }
      return dateString; // Fallback to the normalized string (e.g., "Unknown Date")
    } catch (err) {
      console.warn(`Invalid date format: ${dateString}`);
      return dateString; // Fallback
    }
  }

  const filteredActivities = filter === "all" ? activities : activities.filter((activity) => activity.type === filter)

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p className="text-xl">Loading SkinCareAI history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 text-center">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your SkinCareAI Activity History</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${
              filter === "all" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Activities
          </button>
          <button
            onClick={() => setFilter("help")}
            className={`px-4 py-2 rounded-md ${
              filter === "help" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Help Requests
          </button>
          <button
            onClick={() => setFilter("data")}
            className={`px-4 py-2 rounded-md ${
              filter === "data" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Data Contributions
          </button>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No SkinCareAI activities found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{activity.type === "help" ? "Help Request" : "Data Contribution"}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FiCalendar className="mr-1" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {activity.status === "approved" && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                        <FiCheckCircle className="mr-1" /> Approved
                      </span>
                    )}
                    {activity.status === "pending" && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                        <FiClock className="mr-1" /> Pending
                      </span>
                    )}
                    {activity.status === "rejected" && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                        <FiX className="mr-1" /> Rejected
                      </span>
                    )}
                    {activity.status === "responded" && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                        <FiCheckCircle className="mr-1" /> Responded
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <img
                    src={activity.image || "/placeholder.svg?height=100&width=100"}
                    alt="Skin Image"
                    className="w-24 h-24 rounded object-cover mr-4"
                  />
                  <div className="flex-1">
                    {activity.type === "help" && (
                      <div>
                        <p className="text-gray-700 mb-2">{activity.message}</p>
                      </div>
                    )}
                    {activity.type === "data" && activity.diseaseLevel && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Level of Concern: </span>
                        <span className="capitalize">{activity.diseaseLevel}</span>
                      </div>
                    )}
                    {activity.prediction && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">AI Prediction: </span>
                        <span
                          className={
                            activity.prediction === "Malignant" ? "text-red-600" : "text-green-600"
                          }
                        >
                          {activity.prediction}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({(activity.confidence * 100).toFixed(2)}% confidence)
                        </span>
                      </div>
                    )}
                    {activity.status === "rejected" && activity.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                        <span className="font-semibold">Rejection reason: </span>
                        {activity.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History