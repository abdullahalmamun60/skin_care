import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#F5F7FA] to-[#E3F2FD] py-12 text-[#212121]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <svg
                className="w-10 h-10 text-[#212121] hover:text-[#FF6F61] hover:scale-110 transition-all duration-300"
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
              <h3 className="text-2xl font-serif font-bold tracking-wide">Skincare AI</h3>
            </div>
            <p className="text-[#757575] text-sm font-light">
              Discover personalized skincare solutions with advanced AI technology.
            </p>
            <p className="text-[#FF6F61] text-xs mt-2 italic">Your skin, our science.</p>
          </div>
          <div className="card p-6 animate-fade-in">
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="footer-link">
                  Skincare Blogs
                </Link>
              </li>
              <li>
                <Link to="/get-help" className="footer-link">
                  Get Skincare Help
                </Link>
              </li>
            </ul>
          </div>
          <div className="card p-6 animate-fade-in">
            <h4 className="text-xl font-semibold mb-4">Connect With Us</h4>
            <p className="text-[#757575] mb-2">Email: support@skincareai.com</p>
            <p className="text-[#757575] mb-4">Phone: (123) 456-7890</p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072c-4.95.232-6.532 2.317-6.764 6.764C.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.232 4.947 2.317 6.532 6.764 6.764 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c4.947-.232 6.532-2.317 6.764-6.764.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.232-4.947-2.317-6.532-6.764-6.764C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 footer-divider" />
        <div className="text-center text-[#757575] text-sm animate-fade-in">
          <p>© {new Date().getFullYear()} Skincare AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;