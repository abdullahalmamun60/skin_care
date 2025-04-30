import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiRefreshCw, FiUser, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import bg from "../asset/homepage.webp"
const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const classCodeMap = ["nv", "mel", "bkl", "bcc", "vasc", "akiec", "df"];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPrediction(null);
    }
  };

  const handleQuickCheck = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image to check.");
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get prediction");
      }
      const data = await response.json();
      const classIndex = parseInt(data.result, 10);
      const classCode = classCodeMap[classIndex] || "unknown";
      const confidence = parseFloat(data.confidence) / 100;
      setPrediction({
        result: classIndex,
        classCode: classCode,
        disease: diseaseInfo[classCode]?.disease || "Unknown disease",
        classDescription: diseaseInfo[classCode]?.description || "No description available.",
        confidence: confidence,
        severity: diseaseInfo[classCode]?.severity || "unknown",
        solution: diseaseInfo[classCode]?.solution || "Consult a dermatologist for further evaluation.",
      });

      // setPrediction({
      //   result: classIndex,
      //   classCode: classCode,
      //   classDescription: diseaseInfo[classCode]?.description || "No description available.",
      //   confidence: confidence,
      //   severity: diseaseInfo[classCode]?.severity || "unknown",
      //   solution: diseaseInfo[classCode]?.solution || "Consult a dermatologist for further evaluation.",
      // });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error getting prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPrediction(null);
    toast.success("Quick check reset successfully.");
  };

  const diseaseInfo = {
    nv: {
      disease: "Melanocytic Nevi",
      description: "Melanocytic nevi are benign pigmented skin lesions, commonly known as moles.",
      solution: "Routine monitoring is usually sufficient. Take clear photos monthly to track changes in size, shape, or color. Avoid excessive sun exposure and use sunscreen to prevent changes. If a mole becomes asymmetrical, bleeds, or changes rapidly, consult a dermatologist. A biopsy may be recommended to rule out malignancy.",
      severity: "low",
    },
    mel: {
      disease: "Melanoma",
      description: "Melanoma is a serious type of skin cancer that can spread to other parts of the body.",
      solution: "Immediate dermatological evaluation is critical. If melanoma is suspected, an excisional biopsy is performed first. If confirmed, treatment may involve wide local excision, sentinel lymph node biopsy, and possibly immunotherapy, targeted therapy, or radiation depending on the stage. Early detection offers the best chance of cure.",
      severity: "high",
    },
    bkl: {
      disease: "Benign Keratosis-like Lesions",
      description: "Benign keratosis-like lesions are non-cancerous skin growths, often warty or scaly.",
      solution: "Treatment is usually not required unless the lesion becomes irritated or cosmetically concerning. First-line options include cryotherapy (freezing with liquid nitrogen), curettage (scraping), or electrosurgery. Apply moisturizer and avoid scratching. Use sunscreen to reduce further skin damage.",
      severity: "low",
    },
    bcc: {
      disease: "Basal Cell Carcinoma",
      description: "Basal cell carcinoma is a common skin cancer, typically slow-growing and locally invasive.",
      solution: "Consult a dermatologist promptly. Common treatments include surgical excision, Mohs micrographic surgery (for facial lesions), and topical treatments like imiquimod or fluorouracil for superficial types. Early intervention prevents local tissue destruction. Protect skin with SPF 30+ daily.",
      severity: "medium",
    },
    vasc: {
      disease: "Vascular Lesions",
      description: "Pyogenic granulomas and hemorrhage are benign vascular lesions that may bleed easily.",
      solution: "These can often be removed for cosmetic or bleeding concerns. Initial management includes topical pressure and antiseptic care if bleeding. For persistent lesions, options include laser therapy, surgical excision, or electrocautery. Avoid trauma to prevent regrowth. Apply wound healing ointments post-procedure.",
      severity: "low",
    },
    akiec: {
      disease: "Actinic Keratosis and Intraepithelial Carcinoma",
      description: "Actinic keratoses and intraepithelial carcinoma are precancerous skin lesions caused by sun exposure.",
      solution: "Early dermatological treatment is crucial to prevent progression to squamous cell carcinoma. Common treatments include cryotherapy, topical 5-fluorouracil, imiquimod, or photodynamic therapy. Patients should use broad-spectrum sunscreen and undergo regular skin exams every 6–12 months.",
      severity: "medium",
    },
    df: {
      disease: "Dermatofibroma",
      description: "Dermatofibroma is a benign skin growth, often firm and slightly raised.",
      solution: "Usually no treatment is required unless symptomatic. If desired for cosmetic reasons or irritation, a dermatologist may perform surgical excision under local anesthesia. Avoid picking or scratching to prevent trauma. Periodic observation is typically sufficient.",
      severity: "low",
    },
    unknown: {
      disease: "Unknown Condition",
      description: "No description available.",
      solution: "It is recommended to consult a dermatologist or a healthcare provider for a clinical evaluation and possible biopsy to determine the nature of the lesion. Self-diagnosis or treatment should be avoided in such cases.",
      severity: "unknown",
    },
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-[#E57373]";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-[#4DB6AC]";
      default:
        return "text-[#757575]";
    }
  };

  return (
    <div className="min-h-screen bg-[#E3F2FD] flex flex-col">
      {/* Header */}
      <header className="bg-[#BBDEFB] bg-opacity-95 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 shadow-sm py-4 px-6 animate-slide-down">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-[#212121] hover:text-[#FF6F61] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h1 className="text-2xl font-serif text-[#212121]">SkinCare AI</h1>
          </div>
          <nav className="flex space-x-6">
            <Link to="/" className="nav-link-primary">Home</Link>
            <Link to="/get-help" className="nav-link-primary">Get Help</Link>
            <Link to="/blogs" className="nav-link-primary">Blogs</Link>
            <Link to="/history" className="nav-link-secondary">History</Link>
            <Link to="/profile" className="nav-link-secondary flex items-center">
              <FiUser className="mr-1" /> Profile
            </Link>
            {localStorage.getItem("role") === "officer" && (
              <Link to="/officer-dashboard" className="nav-link-secondary">Dashboard</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pt-24 pb-12 flex-1">
        {/* Hero Section */}
        <section className="card mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h1 className="text-5xl font-serif text-[#212121] mb-4 leading-tight">Elevate Your Skin Health</h1>
              <p className="text-lg text-[#212121] mb-6">Experience cutting-edge AI analysis to understand your skin with precision and care.</p>
              <Link to="/get-help" className="btn btn-primary flex items-center w-fit">
                Get Expert Help <FiArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="md:w-1/2">
              <img src={bg} alt="SkinCare AI" className="rounded-2xl shadow-md animate-zoom-in" />
            </div>
          </div>
        </section>

        {/* Quick Check Section */}
        <section className="card mb-12 animate-fade-in">
          <h2 className="text-3xl font-serif text-[#212121] mb-6 text-center">Instant Skin Analysis</h2>
          <div className="max-w-md mx-auto">
            {/* Modernized Image Upload */}
            <div className="dropzone mb-6">
              <label htmlFor="image-upload" className="cursor-pointer">
                <FiUpload className="mx-auto text-[#FF6F61] text-3xl mb-2" />
                <p className="text-[#212121] font-medium">Drag & drop or click to upload an image</p>
                <p className="text-sm text-[#757575]">Supported formats: JPG, PNG</p>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            {selectedImage && (
              <div className="flex items-center justify-center mb-4 animate-zoom-in">
                <div className="bg-[#E3F2FD] rounded-lg p-2 flex items-center">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="w-16 h-16 object-cover rounded-md mr-2"
                  />
                  <span className="text-[#212121] text-sm">{selectedImage.name}</span>
                </div>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleQuickCheck}
                disabled={!selectedImage || loading}
                className={`btn btn-primary ${!selectedImage || loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Analyzing..." : "Analyze Now"}
              </button>
              {selectedImage && (
                <button onClick={handleReset} className="btn btn-secondary flex items-center">
                  <FiRefreshCw className="mr-2" /> Reset
                </button>
              )}
            </div>
            {console.log(prediction)}
            {prediction && (
              <div className="mt-6 bg-[#F5F7FA] rounded-xl p-6 animate-zoom-in">
                <h3 className="text-xl font-semibold text-[#212121] mb-2">Result: {prediction.disease}</h3>
                <p className="mb-2 text-[#212121]"><span className="font-semibold">Confidence:</span> {(prediction.confidence * 100).toFixed(2)}%</p>
                <div className="mt-4">
                  <h4 className="font-semibold text-[#212121]">Description:</h4>
                  <p className="mb-2 text-[#212121]">{prediction.classDescription}</p>
                  <h4 className="font-semibold mt-4 text-[#212121]">Severity:</h4>
                  <p className={`mb-2 capitalize ${getSeverityColor(prediction.severity)}`}>{prediction.severity}</p>
                  <h4 className="font-semibold mt-4 text-[#212121]">Recommended Action:</h4>
                  <p className="text-[#212121]">{prediction.solution}</p>
                </div>
                <p className="text-sm text-[#757575] mt-4 italic">Disclaimer: This AI prediction is not a substitute for professional medical advice. Always consult a dermatologist for an accurate diagnosis.</p>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="card mb-12 animate-fade-in">
          <h2 className="text-3xl font-serif text-[#212121] mb-6 text-center">Why SkinCare AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#E3F2FD] rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <FiUpload className="text-[#FF6F61] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-[#212121]">Seamless Upload</h3>
              </div>
              <p className="text-[#212121]">Easily upload high-quality images for precise analysis.</p>
            </div>
            <div className="bg-[#E3F2FD] rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF6F61] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-semibold text-[#212121]">Advanced AI</h3>
              </div>
              <p className="text-[#212121]">Leverage cutting-edge AI for accurate skin condition insights.</p>
            </div>
            <div className="bg-[#E3F2FD] rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <FiCheckCircle className="text-[#FF6F61] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-[#212121]">Clear Guidance</h3>
              </div>
              <p className="text-[#212121]">Receive actionable recommendations for your skin health.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="card animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-[#212121] mb-4">Join the Future of Skin Care</h2>
            <p className="text-lg text-[#212121] mb-6 max-w-xl mx-auto">Sign up to access personalized skin health insights and stay informed with our expert blogs.</p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="btn btn-primary">Sign Up Now</Link>
              <Link to="/blogs" className="btn btn-secondary">Explore Blogs</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F5F7FA] py-6 text-center text-[#212121]">
        <p>© 2025 SkinCare AI. <Link to="/terms" className="text-[#FF6F61] hover:text-[#1E88E5]">Terms</Link> | <Link to="/privacy" className="text-[#FF6F61] hover:text-[#1E88E5]">Privacy</Link> | <Link to="/contact" className="text-[#FF6F61] hover:text-[#1E88E5]">Contact</Link></p>
      </footer>
    </div>
  );
};

export default Home;