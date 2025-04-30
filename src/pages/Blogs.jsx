"use client"

import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUser, FiArrowRight, FiPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import img1 from "../asset/skincare101.jpg"
import img2 from "../asset/myth.png";
import img3 from "../asset/hydration.png"
import img4 from "../asset/sunscrn.webp";
// Dummy blog data
const dummyBlogs = [
  {
    id: "blog-1",
    title: "Skin Health 101: The Basics of Skincare",
    excerpt: "Discover the essentials of maintaining healthy skin with our expert tips on cleansing, moisturizing, and protection.",
    author: "Dr. Emma Stone",
    date: "2025-04-25T10:00:00Z",
    image: img1,
  },
  {
    id: "blog-2",
    title: "Top 5 Skincare Myths Debunked",
    excerpt: "From sunscreen misconceptions to hydration myths, we uncover the truth behind common skincare beliefs.",
    author: "Dr. Liam Carter",
    date: "2025-04-20T14:30:00Z",
    image: img2,
  },
  {
    id: "blog-3",
    title: "The Power of Hydration for Glowing Skin",
    excerpt: "Learn how proper hydration, both internal and external, can transform your skin’s health and appearance.",
    author: "Dr. Sophia Lee",
    date: "2025-04-15T09:15:00Z",
    image: img3,
  },
  {
    id: "blog-4",
    title: "Choosing the Right Sunscreen for Your Skin Type",
    excerpt: "Not all sunscreens are created equal. Find out how to pick the perfect SPF for your unique skin needs.",
    author: "Dr. James Patel",
    date: "2025-04-10T11:45:00Z",
    image: img4,
  },
];

const Blogs = () => {
  const { user } = useAuth();
  const [blogs] = useState(dummyBlogs);

  return (
    <div className="container py-8 bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#212121] animate-slide-down">
          Skin Health Tips & Insights
        </h1>
        {user?.role === "officer" && (
          <Link
            to="/officer"
            className="btn btn-primary flex items-center"
          >
            <FiPlus className="mr-2" /> Create Blog
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="blog-card animate-fade-in bg-gradient-to-b from-[#F5F7FA] to-[#E3F2FD] hover:shadow-xl transition-shadow"
          >
            <img
              src={blog.image}
              alt={`SkinCare AI: ${blog.title}`}
              className="w-full h-48 object-cover rounded-t-3xl"
              loading="lazy"
              onError={(e) => (e.target.src = "/placeholder.svg?height=200&width=300")}
            />
            <div className="p-6">
              <h2 className="text-xl font-serif font-bold text-[#212121] mb-2 line-clamp-2">{blog.title}</h2>
              <p className="text-[#757575] mb-4 line-clamp-3">{blog.excerpt}</p>

              <div className="flex items-center text-sm text-[#757575] mb-4">
                <div className="flex items-center mr-4">
                  <FiUser className="mr-1 text-[#FF6F61]" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="mr-1 text-[#FF6F61]" />
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                </div>
              </div>

              <Link to={`/blog/${blog.id}`} className="nav-link-primary flex items-center">
                Read More <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;