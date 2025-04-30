import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import ImageUploader from "../components/ImageUploader"
import toast from "react-hot-toast"
import { FiInfo } from "react-icons/fi"

const DataCollect = () => {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [diseaseLevel, setDiseaseLevel] = useState("medium")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setPrediction(null)
  }

  const handlePredict = async () => {
    if (!selectedImage) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", selectedImage)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to get prediction")
      }

      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error getting prediction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedImage) {
      toast.error("Please select an image")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("file", selectedImage)
    formData.append("userId", user.id)
    formData.append("diseaseLevel", diseaseLevel)
    formData.append("notes", notes)

    if (prediction) {
      formData.append("prediction", prediction.prediction)
      formData.append("confidence", prediction.confidence)
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      toast.success("Image uploaded successfully! It will be reviewed by a SkinCareAI Doctors.")
      setSelectedImage(null)
      setPrediction(null)
      setDiseaseLevel("medium")
      setNotes("")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error uploading image. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contribute to SkinCareAI Dataset</h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Your contributions help improve our skin cancer detection model. All uploaded images will be reviewed by
                SkinCareAI Doctors before being added to the dataset.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Skin Image</h2>
            <ImageUploader onImageSelect={handleImageSelect} />

            {selectedImage && !prediction && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className={`btn btn-primary ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Analyzing..." : "Get AI Prediction"}
                </button>
              </div>
            )}

            {prediction && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">AI Prediction:</h3>
                <p>Condition: {prediction.prediction}</p>
                <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>
              </div>
            )}
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

            <div className="mb-4">
              <label className="form-label">Severity Level</label>
              <select value={diseaseLevel} onChange={(e) => setDiseaseLevel(e.target.value)} className="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input min-h-[100px]"
                placeholder="Add any additional information about the skin condition or observations..."
              ></textarea>
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={!selectedImage || submitting}
              className={`btn btn-primary px-8 ${!selectedImage || submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Submitting..." : "Submit to Dataset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DataCollect