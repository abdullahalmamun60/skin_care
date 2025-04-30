import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, notify } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate("/skin-analysis");
    } catch (error) {
      console.error("Login error:", error);
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E3F2FD] flex items-center justify-center py-16">
      <div className="max-w-md w-full mx-auto">
        <div className="card animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-[#212121]">SkinCare AI Login</h1>
            <p className="text-[#757575] mt-2">Unlock Your Personalized Skincare Journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-[#FF6F61]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="   Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-[#FF6F61]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="   Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <FiEyeOff className="text-[#757575]" /> : <FiEye className="text-[#757575]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#757575] text-sm">
              New to SkinCare AI?{" "}
              <Link to="/register" className="nav-link-primary">
                Start Your Skincare Journey
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;