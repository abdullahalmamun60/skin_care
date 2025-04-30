import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiCheckCircle, FiX, FiMessageSquare, FiDatabase, FiFilter, FiSearch, FiEdit, FiDownload } from "react-icons/fi";

const OfficerDashboard = () => {
  const { user, notify } = useAuth();
  const [activeTab, setActiveTab] = useState("help");
  const [helpRequests, setHelpRequests] = useState([]);
  const [dataEntries, setDataEntries] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogForm, setBlogForm] = useState({ title: "", content: "", excerpt: "", image: null });
  const [downloadFilters, setDownloadFilters] = useState({
    userId: "",
    skinCondition: "",
    prediction: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchData();
    if (activeTab === "data") {
      fetchUsers();
      fetchPredictions();
    }
  }, [activeTab, filter, searchQuery, page]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (activeTab === "help") {
        const response = await fetch(
          `${BACKEND_URL}/gethelp/list${filter !== "all" ? `?status=${filter}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch SkinCare AI help requests");
        }
        const data = await response.json();
        setHelpRequests(
          data.filter(
            (item) =>
              item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.message.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else if (activeTab === "data") {
        const response = await fetch(
          `${BACKEND_URL}/data/list${filter !== "all" ? `?status=${filter}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch SkinCare AI skin analysis entries");
        }
        const data = await response.json();
        setDataEntries(
          data.filter(
            (item) =>
              (item.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else if (activeTab === "blogs") {
        const response = await fetch(`${BACKEND_URL}/blog/list`);
        if (!response.ok) {
          throw new Error("Failed to fetch SkinCare AI blogs");
        }
        const data = await response.json();
        setBlogs(
          data.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setError(error.message);
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch SkinCare AI users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      notify("error", error.message);
    }
  };

  const fetchPredictions = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/data/predictions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch SkinCare AI predictions");
      }
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      notify("error", error.message);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setResponseText("");
    setRejectionReason("");
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      notify("error", "Please enter a response");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/gethelp/${selectedItem._id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: responseText }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SkinCare AI response");
      }

      notify("success", "Response sent successfully");
      setHelpRequests(
        helpRequests.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                status: "responded",
                response: responseText,
                responderName: user.name,
                responseDate: new Date().toISOString(),
              }
            : item
        )
      );
      setSelectedItem(null);
      setResponseText("");
    } catch (error) {
      console.error("Error sending response:", error);
      notify("error", error.message);
    }
  };

  const handleApproveData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/data/${selectedItem._id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to approve SkinCare AI skin analysis");
      }

      notify("success", "Skin analysis approved");
      setDataEntries(
        dataEntries.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                status: "approved",
                approvedBy: user.name,
                approvalDate: new Date().toISOString(),
              }
            : item
        )
      );
      setSelectedItem(null);
    } catch (error) {
      console.error("Error approving skin analysis:", error);
      notify("error", error.message);
    }
  };

  const handleRejectData = async () => {
    if (!rejectionReason.trim()) {
      notify("error", "Please provide a reason for rejection");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const response = await fetch(`${BACKEND_URL}/data/${selectedItem._id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject SkinCare AI skin analysis");
      }

      notify("success", "Skin analysis rejected");
      setDataEntries(
        dataEntries.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                status: "rejected",
                rejectionReason: rejectionReason,
              }
            : item
        )
      );
      setSelectedItem(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting skin analysis:", error);
      notify("error", error.message);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim() || !blogForm.excerpt.trim()) {
      notify("error", "Please fill in all required fields");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const formData = new FormData();
      formData.append("title", blogForm.title);
      formData.append("content", blogForm.content);
      formData.append("excerpt", blogForm.excerpt);
      if (blogForm.image) {
        formData.append("image", blogForm.image);
      }

      const response = await fetch(`${BACKEND_URL}/blog/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create SkinCare AI blog");
      }

      notify("success", "Blog created successfully");
      setBlogForm({ title: "", content: "", excerpt: "", image: null });
      fetchData();
    } catch (error) {
      console.error("Error creating blog:", error);
      notify("error", error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;
      const queryParams = new URLSearchParams();
      if (downloadFilters.userId) queryParams.append("userId", downloadFilters.userId);
      if (downloadFilters.skinCondition) queryParams.append("skinCondition", downloadFilters.skinCondition);
      if (downloadFilters.prediction) queryParams.append("prediction", downloadFilters.prediction);
      if (downloadFilters.status) queryParams.append("status", downloadFilters.status);

      const response = await fetch(`${BACKEND_URL}/data/download?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download SkinCare AI skin analysis entries");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skin_analysis_entries_${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify("success", "Download started");
    } catch (error) {
      console.error("Error downloading skin analysis entries:", error);
      notify("error", error.message);
    }
  };

  const paginatedItems = (items) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  if (loading && !helpRequests.length && !dataEntries.length && !blogs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] flex items-center justify-center py-8">
        <p className="text-xl text-[#212121] animate-fade-in">Loading SkinCare AI Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] flex items-center justify-center py-8">
        <p className="text-xl text-[#E57373] animate-fade-in">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-[#212121] mb-6 animate-slide-down">
          SkinCare AI Officer Dashboard
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <div className="card animate-fade-in">
              <h2 className="text-xl font-serif font-semibold text-[#212121] mb-4">Navigation</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("help")}
                  className={`flex items-center w-full px-4 py-2 rounded-lg text-left nav-link-secondary ${
                    activeTab === "help" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                  }`}
                >
                  <FiMessageSquare className="mr-2" />
                  <span>Skincare Queries</span>
                </button>
                <button
                  onClick={() => setActiveTab("data")}
                  className={`flex items-center w-full px-4 py-2 rounded-lg text-left nav-link-secondary ${
                    activeTab === "data" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                  }`}
                >
                  <FiDatabase className="mr-2" />
                  <span>Skin Analysis</span>
                </button>
                <button
                  onClick={() => setActiveTab("blogs")}
                  className={`flex items-center w-full px-4 py-2 rounded-lg text-left nav-link-secondary ${
                    activeTab === "blogs" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                  }`}
                >
                  <FiEdit className="mr-2" />
                  <span>Skincare Blogs</span>
                </button>
              </nav>
            </div>

            {activeTab !== "blogs" && (
              <div className="card animate-fade-in">
                <h2 className="text-lg font-serif font-semibold text-[#212121] mb-3">Filter</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg nav-link-secondary ${
                      filter === "all" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg nav-link-secondary ${
                      filter === "pending" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                    }`}
                  >
                    Pending
                  </button>
                  {activeTab === "help" ? (
                    <button
                      onClick={() => setFilter("responded")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg nav-link-secondary ${
                        filter === "responded" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                      }`}
                    >
                      Responded
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setFilter("approved")}
                        className={`w-full text-left px-3 py-1.5 rounded-lg nav-link-secondary ${
                          filter === "approved" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                        }`}
                      >
                        Approved
                      </button>
                      <button
                        onClick={() => setFilter("rejected")}
                        className={`w-full text-left px-3 py-1.5 rounded-lg nav-link-secondary ${
                          filter === "rejected" ? "bg-[#E3F2FD] text-[#FF6F61]" : ""
                        }`}
                      >
                        Rejected
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="card mb-6 animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-[#FF6F61]" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${
                      activeTab === "help"
                        ? "skincare queries"
                        : activeTab === "data"
                        ? "skin analysis entries"
                        : "skincare blogs"
                    }...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="ml-2 px-4 py-2 bg-[#E3F2FD] text-[#FF6F61] rounded-lg hover:bg-[#FF6F61] hover:text-[#F5F7FA]"
                >
                  <FiFilter />
                </button>
              </div>

              <h2 className="text-xl font-serif font-semibold text-[#212121] mb-4">
                {activeTab === "help"
                  ? "Skincare Queries"
                  : activeTab === "data"
                  ? "Skin Analysis Entries"
                  : "Skincare Blogs"}
              </h2>

              {activeTab === "data" && (
                <div className="card mb-6">
                  <h3 className="text-lg font-serif font-semibold text-[#212121] mb-4">
                    Download Skin Analysis Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="form-label">User</label>
                      <select
                        value={downloadFilters.userId}
                        onChange={(e) => setDownloadFilters({ ...downloadFilters, userId: e.target.value })}
                        className="form-input"
                      >
                        <option value="">All Users</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Skin Condition</label>
                      <select
                        value={downloadFilters.skinCondition}
                        onChange={(e) =>
                          setDownloadFilters({ ...downloadFilters, skinCondition: e.target.value })
                        }
                        className="form-input"
                      >
                        <option value="">All Conditions</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">AI Prediction</label>
                      <select
                        value={downloadFilters.prediction}
                        onChange={(e) => setDownloadFilters({ ...downloadFilters, prediction: e.target.value })}
                        className="form-input"
                      >
                        <option value="">All Predictions</option>
                        {predictions.map((pred) => (
                          <option key={pred} value={pred}>
                            {pred.replace("Skin___", "")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Status</label>
                      <select
                        value={downloadFilters.status}
                        onChange={(e) => setDownloadFilters({ ...downloadFilters, status: e.target.value })}
                        className="form-input"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    <FiDownload className="mr-2" /> Download Images
                  </button>
                </div>
              )}

              {activeTab === "help" && helpRequests.length === 0 && (
                <p className="text-center py-4 text-[#757575]">No skincare queries found.</p>
              )}

              {activeTab === "data" && dataEntries.length === 0 && (
                <p className="text-center py-4 text-[#757575]">No skin analysis entries found.</p>
              )}

              {activeTab === "blogs" && blogs.length === 0 && (
                <p className="text-center py-4 text-[#757575]">No skincare blogs found.</p>
              )}

              {activeTab === "help" && helpRequests.length > 0 && (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Date</th>
                      <th>Message</th>
                      <th>Prediction</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems(helpRequests).map((request) => (
                      <tr
                        key={request._id}
                        onClick={() => handleSelectItem(request)}
                        className={selectedItem?._id === request._id ? "bg-[#E3F2FD]" : ""}
                      >
                        <td>{request.userName}</td>
                        <td>{new Date(request.requestDate).toLocaleString()}</td>
                        <td className="line-clamp-1">{request.message}</td>
                        <td>
                          {request.prediction?.replace("Skin___", "") || "N/A"} (
                          {((request.confidence || 0) * 100).toFixed(2)}%)
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-[#4DB6AC] text-[#F5F7FA]"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "data" && dataEntries.length > 0 && (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Date</th>
                      <th>Skin Condition</th>
                      <th>Prediction</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems(dataEntries).map((entry) => (
                      <tr
                        key={entry._id}
                        onClick={() => handleSelectItem(entry)}
                        className={selectedItem?._id === entry._id ? "bg-[#E3F2FD]" : ""}
                      >
                        <td>{entry.userName}</td>
                        <td>{new Date(entry.uploadDate).toLocaleString()}</td>
                        <td className="capitalize">{entry.skinCondition}</td>
                        <td>
                          {entry.prediction?.replace("Skin___", "") || "N/A"} (
                          {((entry.confidence || 0) * 100).toFixed(2)}%)
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              entry.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : entry.status === "approved"
                                ? "bg-[#4DB6AC] text-[#F5F7FA]"
                                : "bg-[#E57373] text-[#F5F7FA]"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "blogs" && (
                <div className="space-y-6">
                  <div className="card">
                    <h3 className="text-lg font-serif font-semibold text-[#212121] mb-4">
                      Create New Skincare Blog
                    </h3>
                    <form onSubmit={handleBlogSubmit}>
                      <div className="mb-4">
                        <label htmlFor="title" className="form-label">
                          Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          className="form-input"
                          placeholder="Enter blog title"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="excerpt" className="form-label">
                          Excerpt
                        </label>
                        <textarea
                          id="excerpt"
                          value={blogForm.excerpt}
                          onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                          className="form-input min-h-[100px]"
                          placeholder="Enter a short excerpt"
                          required
                        ></textarea>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="content" className="form-label">
                          Content
                        </label>
                        <textarea
                          id="content"
                          value={blogForm.content}
                          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                          className="form-input min-h-[200px]"
                          placeholder="Enter blog content"
                          required
                        ></textarea>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="image" className="form-label">
                          Image (Optional)
                        </label>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBlogForm({ ...blogForm, image: e.target.files[0] })}
                          className="form-input"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-full">
                        Create Blog Post
                      </button>
                    </form>
                  </div>

                  {blogs.length > 0 && (
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Author</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems(blogs).map((blog) => (
                          <tr
                            key={blog._id}
                            onClick={() => handleSelectItem(blog)}
                            className={selectedItem?._id === blog._id ? "bg-[#E3F2FD]" : ""}
                          >
                            <td>{blog.title}</td>
                            <td>{new Date(blog.date).toLocaleString()}</td>
                            <td>{blog.author}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {(activeTab === "help" || activeTab === "data" || activeTab === "blogs") && (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-secondary px-4"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * itemsPerPage >= (activeTab === "help" ? helpRequests.length : activeTab === "data" ? dataEntries.length : blogs.length)}
                    className="btn btn-secondary px-4"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Detail View */}
            {selectedItem && activeTab !== "blogs" && (
              <div className="card animate-fade-in">
                <h2 className="text-xl font-serif font-semibold text-[#212121] mb-4">
                  {activeTab === "help" ? "Skincare Query Details" : "Skin Analysis Details"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedItem.image ? `${BACKEND_URL}${selectedItem.image}` : "/placeholder.svg"}
                      alt="Skin"
                      className="w-full h-auto rounded-lg mb-4"
                      loading="lazy"
                    />
                    <div className="text-sm text-[#757575]">
                      <p className="mb-1">
                        <span className="font-semibold">User: </span>
                        {selectedItem.userName}
                      </p>
                      <p className="mb-1">
                        <span className="font-semibold">Date: </span>
                        {new Date(selectedItem.requestDate || selectedItem.uploadDate).toLocaleString()}
                      </p>
                      <p className="mb-1">
                        <span className="font-semibold">AI Prediction: </span>
                        {selectedItem.prediction?.replace("Skin___", "") || "N/A"} (
                        {((selectedItem.confidence || 0) * 100).toFixed(2)}%)
                      </p>
                      {activeTab === "data" && (
                        <p className="mb-1">
                          <span className="font-semibold">Skin Condition: </span>
                          <span className="capitalize">{selectedItem.skinCondition}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {activeTab === "help" && (
                      <>
                        <div className="mb-4">
                          <h3 className="font-serif font-semibold text-[#212121] mb-2">User's Question:</h3>
                          <p className="p-3 bg-[#E3F2FD] rounded-md text-[#212121]">{selectedItem.message}</p>
                        </div>

                        {selectedItem.status === "responded" ? (
                          <div>
                            <h3 className="font-serif font-semibold text-[#212121] mb-2">Your Response:</h3>
                            <div className="p-3 bg-[#4DB6AC] rounded-md">
                              <p className="text-[#F5F7FA]">{selectedItem.response}</p>
                              <p className="mt-2 text-sm text-[#F5F7FA]">
                                Responded by {selectedItem.responderName} on{" "}
                                {new Date(selectedItem.responseDate).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-serif font-semibold text-[#212121] mb-2">Your Response:</h3>
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              className="form-input min-h-[150px]"
                              placeholder="Write your response here..."
                            ></textarea>
                            <button
                              onClick={handleSubmitResponse}
                              className="btn btn-primary w-full mt-4"
                            >
                              Send Response
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === "data" && (
                      <>
                        {selectedItem.notes && (
                          <div className="mb-4">
                            <h3 className="font-serif font-semibold text-[#212121] mb-2">User's Notes:</h3>
                            <p className="p-3 bg-[#E3F2FD] rounded-md text-[#212121]">{selectedItem.notes}</p>
                          </div>
                        )}

                        {selectedItem.status === "pending" && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-serif font-semibold text-[#212121] mb-2">Review Decision:</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleApproveData}
                                  className="btn btn-primary flex-1 flex items-center justify-center"
                                >
                                  <FiCheckCircle className="mr-2" /> Approve
                                </button>
                                <button
                                  onClick={() => {
                                    document.getElementById("rejection-reason").focus();
                                  }}
                                  className="btn btn-secondary flex-1 flex items-center justify-center"
                                >
                                  <FiX className="mr-2" /> Reject
                                </button>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-serif font-semibold text-[#212121] mb-2">
                                Rejection Reason (if applicable):
                              </h3>
                              <textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="form-input min-h-[100px]"
                                placeholder="Provide a reason for rejection..."
                              ></textarea>
                              <button
                                onClick={handleRejectData}
                                disabled={!rejectionReason.trim()}
                                className={`btn btn-secondary w-full mt-2 ${
                                  !rejectionReason.trim() ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                Confirm Rejection
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedItem.status === "approved" && (
                          <div className="p-4 bg-[#4DB6AC] rounded-lg">
                            <div className="flex items-center mb-2">
                              <FiCheckCircle className="text-[#F5F7FA] mr-2" />
                              <h3 className="font-serif font-semibold text-[#F5F7FA]">Approved</h3>
                            </div>
                            <p className="text-sm text-[#F5F7FA]">
                              This entry was approved by {selectedItem.approvedBy} on{" "}
                              {new Date(selectedItem.approvalDate).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {selectedItem.status === "rejected" && (
                          <div className="p-4 bg-[#E57373] rounded-lg">
                            <div className="flex items-center mb-2">
                              <FiX className="text-[#F5F7FA] mr-2" />
                              <h3 className="font-serif font-semibold text-[#F5F7FA]">Rejected</h3>
                            </div>
                            <p className="text-sm text-[#F5F7FA]">Reason: {selectedItem.rejectionReason}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedItem && activeTab === "blogs" && (
              <div className="card animate-fade-in">
                <h2 className="text-xl font-serif font-semibold text-[#212121] mb-4">Skincare Blog Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {selectedItem.image && (
                      <img
                        src={`${BACKEND_URL}${selectedItem.image}`}
                        alt={selectedItem.title}
                        className="w-full h-auto rounded-lg mb-4"
                        loading="lazy"
                      />
                    )}
                    <div className="text-sm text-[#757575]">
                      <p className="mb-1">
                        <span className="font-semibold">Title: </span>
                        {selectedItem.title}
                      </p>
                      <p className="mb-1">
                        <span className="font-semibold">Author: </span>
                        {selectedItem.author}
                      </p>
                      <p className="mb-1">
                        <span className="font-semibold">Date: </span>
                        {new Date(selectedItem.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <h3 className="font-serif font-semibold text-[#212121] mb-2">Excerpt:</h3>
                      <p className="p-3 bg-[#E3F2FD] rounded-md text-[#212121]">{selectedItem.excerpt}</p>
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-[#212121] mb-2">Content:</h3>
                      <p className="p-3 bg-[#E3F2FD] rounded-md text-[#212121]">{selectedItem.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;