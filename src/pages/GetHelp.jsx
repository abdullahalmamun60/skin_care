import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUploader from "../components/ImageUploader";

const GetHelp = () => {
  const { user, notify } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (file) => {
    console.log("Selected image:", file);
    setSelectedImage(file);
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      notify("error", "Please select an image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get SkinCare AI prediction");
      }

      const data = await response.json();
      console.log("Prediction data:", data);
      setPrediction(data);
      notify("success", "Prediction generated successfully");
    } catch (error) {
      console.error("Error:", error);
      notify("error", "Error getting prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      notify("error", "Please select an image");
      return;
    }

    if (!message.trim()) {
      notify("error", "Please describe your concern");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("userId", user.id);
    formData.append("message", message);

    if (prediction) {
      if (!prediction.result || !prediction.confidence) {
        notify("error", "Invalid prediction data. Please try generating the prediction again.");
        setSubmitting(false);
        return;
      }
      formData.append("prediction", prediction.result);
      // Parse confidence string (e.g., '99.93%' -> 99.93)
      const confidenceValue = parseFloat(prediction.confidence.replace("%", ""));
      if (isNaN(confidenceValue)) {
        notify("error", "Invalid confidence value in prediction data.");
        setSubmitting(false);
        return;
      }
      formData.append("confidence", confidenceValue);
      if (prediction.description) {
        formData.append("description", prediction.description);
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/gethelp/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Response error:", response.status, errorData);
        throw new Error(errorData.message || "Failed to send SkinCare AI help request");
      }

      notify("success", "Help request sent successfully! A SkinCare AI doctor will respond soon.");
      setSelectedImage(null);
      setPrediction(null);
      setMessage("");
    } catch (error) {
      console.error("Submission error:", error.message);
      notify("error", `Error sending help request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPrediction(null);
    setMessage("");
    notify("success", "Form reset successfully");
  };

  const getPredictionExplanation = (prediction) => {
    if (!prediction) return null;
    const { result } = prediction;
    // Map result (class index) to meaningful labels based on CLASS_NAMES
    const className = result; // Assuming result is the class index (e.g., '0' or '1')
    if (className === "0") {
      return "This indicates the skin lesion is likely non-cancerous. However, always consult a dermatologist for confirmation.";
    } else if (className === "1") {
      return "This suggests the skin lesion may be cancerous. Please consult a dermatologist immediately for further evaluation.";
    }
    return "The prediction indicates a skin condition. Consult a dermatologist for a professional diagnosis.";
  };

  return (
    <div className="container py-8 bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-[#212121] mb-6 animate-slide-down">
          Get Expert Help with SkinCare AI
        </h1>

        <div className="mb-6 animate-fade-in">
          <p className="text-[#757575]">
            Upload an image of the skin area of concern and describe your issue. Our AI will provide an initial assessment,
            and our skin health experts at SkinCare AI will review your case and provide personalized advice.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card mb-6 animate-fade-in">
            <h2 className="text-xl font-serif font-semibold text-[#212121] mb-4">Upload Skin Image</h2>
            <ImageUploader onImageSelect={handleImageSelect} />

            {selectedImage && !prediction && (
              <div className="text-center mt-4">
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
              <div className="mt-6 p-4 bg-[#F5F7FA] rounded-lg border border-[#E3F2FD] animate-zoom-in">
                <h3 className="font-serif font-semibold text-lg text-[#212121] mb-2">AI Prediction</h3>
                <p className="text-[#757575]">
                  <span className="font-medium">
                    Condition: {prediction.description.split(' ')[0]}
                  </span>{" "}
                  <span
                    className={
                      prediction.result === "1"
                        ? "text-[#E57373]"
                        : "text-[#4DB6AC]"
                    }
                  >
                    {prediction.result === "0" ? "Benign" : "Malignant"}
                  </span>
                </p>

                <p className="text-[#757575]">
                  <span className="font-medium">Confidence:</span>{" "}
                  {prediction.confidence}
                </p>
                <p className="text-[#757575]">
                  <span className="font-medium">Description:</span>{" "}
                  {prediction.description}
                </p>
                <p className="text-sm text-[#757575] mt-2">
                  This is an automated prediction. Our SkinCare AI experts will review your case for a more accurate assessment.
                </p>
              </div>
            )}
          </div>

          <div className="card mb-6 animate-fade-in">
            <h2 className="text-xl font-serif font-semibold text-[#212121] mb-4">Describe Your Concern</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input min-h-[150px]"
              placeholder="Describe the skin issue, when you first noticed it, any changes over time, and any other relevant details..."
              required
            ></textarea>
          </div>

          <div className="text-center space-x-4">
            <button
              type="submit"
              disabled={!selectedImage || submitting}
              className={`btn btn-primary px-8 ${!selectedImage || submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Sending..." : "Send Help Request"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary px-8"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GetHelp;