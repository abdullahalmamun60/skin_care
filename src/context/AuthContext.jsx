"use client"

import { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";

/**
 * Authentication context for managing user state and auth operations
 */
const AuthContext = createContext();

/**
 * Hook to access the auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Provider component for authentication context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme configuration for consistent styling
  const theme = {
    colors: {
      primary: '#1E88E5', // Ocean Blue
      secondary: '#F5F7FA', // Pearl White
      accent: '#FF6F61', // Coral Glow
      background: '#E3F2FD', // Soft Sky
      success: '#4DB6AC', // Mint Breeze
      error: '#E57373', // Rose Blush
      text: '#212121', // Deep Charcoal
      muted: '#757575', // Secondary Text
    },
    fonts: {
      sans: 'Montserrat, sans-serif',
      serif: 'Lora, serif',
    },
  };

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);

    // Cleanup
    return () => setLoading(false);
  }, []);

  /**
   * Custom toast notification with themed styling
   * @param {'success' | 'error'} type - Toast type
   * @param {string} message - Message to display
   */
  const notify = (type, message) => {
    const toastClass = type === 'success' ? 'toast-success' : 'toast-error';
    const title = type === 'success' ? 'Success!' : 'Error';
    toast(
      <div className={toastClass}>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>,
      { duration: 4000 }
    );
  };

  /**
   * Log in a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data
   */
  const login = async (email, password) => {
    if (!email || !password) {
      notify('error', 'Please provide both email and password.');
      throw new Error('Missing credentials');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        const message = error.detail || 'Unable to log in to SkinCare AI. Please verify your email and password.';
        notify('error', message);
        throw new Error(message);
      }

      const data = await response.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      // notify('success', 'Logged in to SkinCare AI successfully');
      return data;
    } catch (error) {
      console.error("Login error:", error);
      const message = error.message || 'A network error occurred. Please try again later.';
      notify('error', message);
      throw error;
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<boolean>} Success status
   */
  const register = async (userData) => {
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(userData)) {
        formData.append(key, value);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        const message = error.detail || 'Failed to register with SkinCare AI. Please check your details and try again.';
        notify('error', message);
        throw new Error(message);
      }

      notify('success', 'Registered with SkinCare AI successfully. Please log in.');
      return true;
    } catch (error) {
      console.error("Register error:", error);
      const message = error.message || 'A network error occurred during registration. Please try again.';
      notify('error', message);
      throw error;
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    notify('success', 'Logged out of SkinCare AI successfully');
  };

  /**
   * Check if the user is an officer
   * @returns {boolean} True if user is an officer
   */
  const isOfficer = () => {
    return user && user.role === "officer";
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isOfficer,
    theme,
    notify,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;