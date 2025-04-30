import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <nav className="bg-[#BBDEFB] bg-opacity-95 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 shadow-sm py-4 px-6 animate-slide-down">
      <div className="container flex items-center justify-between">
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
          <Link to="/" className="text-2xl font-serif text-[#212121]">
            SkinCare AI
          </Link>
        </div>

        <button
          className="md:hidden text-[#212121] focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link-primary">
            Home
          </Link>
          <Link to="/get-help" className="nav-link-primary">
            Expert Help
          </Link>
          <Link to="/blogs" className="nav-link-primary">
            Blogs
          </Link>
          {user ? (
            <>
              <Link to="/history" className="nav-link-secondary">
                History
              </Link>
              {user.role === "officer" && (
                <Link to="/dashboard" className="nav-link-secondary">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="nav-link-secondary flex items-center">
                <FiUser className="mr-1" /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link-secondary flex items-center"
              >
                <FiLogOut className="mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-secondary">
                Login
              </Link>
              <Link to="/register" className="nav-link-secondary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 bg-[#F5F7FA] rounded-b-xl">
          <div className="container flex flex-col space-y-4">
            <Link
              to="/"
              className="nav-link-primary"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/get-help"
              className="nav-link-primary"
              onClick={() => setIsOpen(false)}
            >
              Expert Help
            </Link>
            <Link
              to="/blogs"
              className="nav-link-primary"
              onClick={() => setIsOpen(false)}
            >
              Blogs
            </Link>
            {user ? (
              <>
                <Link
                  to="/history"
                  className="nav-link-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  History
                </Link>
                {user.role === "officer" && (
                  <Link
                    to="/dashboard"
                    className="nav-link-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="nav-link-secondary flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <FiUser className="mr-1" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link-secondary flex items-center text-left"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-link-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;