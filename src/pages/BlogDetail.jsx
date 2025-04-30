import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiUser, FiArrowLeft } from "react-icons/fi";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blog/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch SkinCare AI blog");
        }

        const data = await response.json();
        setBlog({
          ...data,
          id: data._id,
          date: new Date(data.date).toISOString().split("T")[0],
        });
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <p className="text-xl text-[#212121] animate-fade-in">Loading SkinCare AI blog...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container py-16 text-center">
        <p className="text-xl text-[#E57373] animate-fade-in">
          Error: {error || "SkinCare AI blog not found"}
        </p>
        <Link to="/blogs" className="nav-link-primary mt-4 inline-flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Link to="/blogs" className="nav-link-primary inline-flex items-center mb-6">
        <FiArrowLeft className="mr-2" /> Back to Blogs
      </Link>

      <article className="card max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-serif font-bold text-[#212121] mb-4">{blog.title}</h1>

        <div className="flex items-center text-[#757575] mb-6">
          <div className="flex items-center mr-4">
            <FiUser className="mr-1 text-[#FF6F61]" />
            <span>{blog.author}</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-1 text-[#FF6F61]" />
            <span>{new Date(blog.date).toLocaleDateString()}</span>
          </div>
        </div>

        <img
          src={blog.image || "/placeholder.svg?height=400&width=800"}
          alt={`SkinCare AI: ${blog.title}`}
          className="w-full h-auto rounded-lg mb-6 object-cover"
          loading="lazy"
        />

        <div
          className="prose max-w-none text-[#212121]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
};

export default BlogDetail;