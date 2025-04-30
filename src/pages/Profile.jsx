"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiEdit, FiX, FiTrash, FiRefreshCw } from "react-icons/fi";

const Profile = () => {
  const { user, setUser, notify } = useAuth();
  const navigate = useNavigate();
  const [helpResponses, setHelpResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    image: null,
  });
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!user) {
      notify("error", "Please log in to view your profile");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = user?.token;
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${BACKEND_URL}/user/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch SkinCare AI user history");
        }
        const history = await response.json();
        console.log("User History API Response:", history); // Debug log

        if (!Array.isArray(history)) {
          throw new Error("Unexpected response format: Expected an array");
        }

        const responses = history
          .filter((item) => item.type === "help" && item.status === "responded")
          .map((item) => ({
            id: item._id || item.id,
            date: item.requestDate || new Date().toISOString(),
            question: item.message || "No question provided",
            response: item.response || "No response provided",
            officerName: item.responderName || "Unknown",
            image: item.image || "/placeholder.svg?height=200&width=200",
          }));

        setHelpResponses(responses);
        setEditForm({
          name: user.name || "",
          phone: user.phone || "",
          image: null,
        });
        // notify("success", "Profile data loaded successfully");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        notify("error", error.message);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, notify, retryCount]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      let hasChanges = false;
      if (editForm.name && editForm.name !== user.name) {
        formData.append("name", editForm.name);
        hasChanges = true;
      }
      if (editForm.phone && editForm.phone !== user.phone) {
        formData.append("phone", editForm.phone);
        hasChanges = true;
      }
      if (editForm.image) {
        formData.append("image", editForm.image);
        hasChanges = true;
      }

      if (!hasChanges) {
        notify("error", "No changes to save");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/user/profile/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update SkinCare AI profile");
      }

      const result = await response.json();
      const updatedUser = { ...user, ...result.user };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      setEditForm({
        name: result.user.name,
        phone: result.user.phone,
        image: null,
      });
      notify("success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      notify("error", error.message);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${BACKEND_URL}/user/profile/image/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete SkinCare AI profile image");
      }

      const updatedUser = { ...user, image: null };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditForm({ ...editForm, image: null });
      notify("success", "Profile image deleted successfully");
    } catch (error) {
      console.error("Error deleting profile image:", error);
      notify("error", error.message);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] flex items-center justify-center py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6F61]"></div>
          <p className="ml-4 text-xl text-[#212121] animate-fade-in">Loading SkinCare AI profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] flex items-center justify-center py-8">
        <p className="text-xl text-[#E57373] animate-fade-in">Error: {error}</p>
        <button
          onClick={handleRetry}
          className="btn btn-primary mt-4 flex items-center mx-auto"
        >
          <FiRefreshCw className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold text-[#212121] mb-8 animate-slide-down">
          Your SkinCare AI Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="md:col-span-1">
            <div className="card animate-fade-in">
              <div className="flex flex-col items-center mb-6">
                {user.image ? (
                  <img
                    src={`${BACKEND_URL}${user.image}`}
                    alt={user.name}
                    className="avatar mb-4"
                    onError={(e) => (e.target.src = "/placeholder.svg?height=64&width=64")}
                  />
                ) : (
                  <div className="avatar bg-[#E3F2FD] flex items-center justify-center mb-4">
                    <FiUser size={24} className="text-[#FF6F61]" />
                  </div>
                )}
                <h2 className="text-xl font-serif font-semibold text-[#212121]">{user.name}</h2>
                <p className="text-[#757575]">
                  {user.role === "officer" ? "Skincare Expert" : "User"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FiMail className="mt-1 mr-3 text-[#FF6F61]" />
                  <div>
                    <p className="text-sm text-[#757575]">Email</p>
                    <p className="text-[#212121]">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start">
                    <FiPhone className="mt-1 mr-3 text-[#FF6F61]" />
                    <div>
                      <p className="text-sm text-[#757575]">Phone</p>
                      <p className="text-[#212121]">{user.phone}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <FiEdit className="mr-2" /> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="md:col-span-2">
            <div className="card animate-fade-in">
              <h2 className="text-xl font-serif font-semibold text-[#212121] mb-6">
                Your SkinCare AI History
              </h2>

              {helpResponses.length === 0 ? (
                <p className="text-[#757575] text-center py-4">
                  No skincare query responses available.
                </p>
              ) : (
                <div className="space-y-6">
                  {helpResponses.map((response) => (
                    <div key={response.id} className="p-4 bg-[#F5F7FA] rounded-lg border border-[#E3F2FD]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <img
                            src={`${BACKEND_URL}${response.image}`}
                            alt="Skin issue"
                            className="w-full h-32 object-cover rounded-lg"
                            loading="lazy"
                            onError={(e) => (e.target.src = "/placeholder.svg?height=128&width=128")}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-[#757575] mb-2">
                            {new Date(response.date).toLocaleString()}
                          </p>
                          <p className="font-semibold text-[#212121] mb-2">
                            Question: {response.question}
                          </p>
                          <p className="text-[#212121] mb-2">
                            Response: {response.response}
                          </p>
                          <p className="text-sm text-[#757575]">
                            Responded by: {response.officerName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="card max-w-lg w-full bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] relative">
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-[#757575] hover:text-[#FF6F61]"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[#212121] mb-6">
                Edit Your SkinCare AI Profile
              </h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="form-label">
                    Phone (Optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="image" className="form-label">
                    Profile Image (Optional)
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
                    className="form-input"
                  />
                  {user.image && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="btn btn-secondary w-full mt-2 flex items-center justify-center"
                    >
                      <FiTrash className="mr-2" /> Delete Current Image
                    </button>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;