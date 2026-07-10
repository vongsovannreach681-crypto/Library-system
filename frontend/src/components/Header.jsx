import React, { useState, useEffect } from "react";
import Logowhite from "../assets/Logo-white.png";
import logo from "../assets/NobgLogo.png";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { label: "ប្លុកវេទីកា", href: "/" },
    { label: "បណ្ណាល័យ", href: "/library" },
    { label: "វេដេអូមេរៀន", href: "" },
    { label: "អំពីយើង", href: "" },
  ];

  return (
    <>
      <header className="bg-nav flex justify-between items-center px-4 md:px-6 lg:px-8 py-2">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img className="w-20 md:w-25 h-auto" src={logo} alt="Logo" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-5 lg:gap-8">
          {navLinks.map((link, index) => (
            <a
              key={index}
              className="font-primary text-white hover:text-accent font-semibold text-lg lg:text-xl transition-colors duration-200"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex justify-center items-center gap-4 lg:gap-5">
          <div className="flex text-xl lg:text-2xl gap-3">
            <i className="fa-regular fa-sun text-white hover:text-accent cursor-pointer transition-colors duration-200"></i>
            <i className="fa-regular fa-heart text-white hover:text-red-600 cursor-pointer transition-colors duration-200"></i>
          </div>

          {user ? (
            // User Profile Dropdown
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={
                    user.profile
                      ? `http://localhost:8000/storage/${user.profile}`
                      : "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                />
                <span className="font-primary text-white font-semibold text-sm lg:text-base">
                  {user.name}
                </span>
                <i
                  className={`fa-solid fa-chevron-down text-white text-xs transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                ></i>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-nav border border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-600">
                    <p className="font-primary text-white font-semibold">
                      {user.name}
                    </p>
                    <p className="font-primary text-gray-300 text-xs">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 font-primary text-white hover:bg-primary transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <i className="fa-solid fa-user mr-2"></i>ប្រូហ្វាល់
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 font-primary text-red-400 hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2"></i>ចាកចេញ
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Login Button
            <button className="bg-primary px-4 py-2.5 font-primary text-white rounded text-sm lg:text-lg font-semibold cursor-pointer hover:bg-opacity-90 transition-all duration-200">
              <Link to={"/login"}>
                ចូលគណនី <i className="fa-solid fa-right-to-bracket ml-1"></i>
              </Link>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex text-lg gap-2">
            <i className="fa-regular fa-sun text-white hover:text-accent cursor-pointer"></i>
            <i className="fa-regular fa-heart text-white hover:text-red-600 cursor-pointer"></i>
          </div>
          <button
            onClick={toggleMenu}
            className="text-white text-2xl p-2 hover:text-accent transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <i
              className={`fa-solid ${isMenuOpen ? "fa-times" : "fa-bars"}`}
            ></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-nav border-t border-gray-700">
          <nav className="flex flex-col px-4 py-3 gap-2">
            {navLinks.map((link, index) => (
              <a
                key={index}
                className="font-primary text-white hover:text-accent font-semibold text-base py-2 px-3 rounded hover:bg-opacity-10 hover:bg-white transition-all duration-200"
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <>
                <div className="px-3 py-2 border-t border-gray-600 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={
                        user.profile
                          ? `http://localhost:8000/storage/${user.profile}`
                          : "https://via.placeholder.com/40"
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-accent"
                    />
                    <div>
                      <p className="font-primary text-white font-semibold text-sm">
                        {user.name}
                      </p>
                      <p className="font-primary text-gray-300 text-xs">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 font-primary text-white hover:bg-primary rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fa-solid fa-user mr-2"></i>ទស្សនវorgាង
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 font-primary text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2"></i>ចាកចេញ
                </button>
              </>
            ) : (
              <button className="bg-primary px-3 py-3 font-primary text-white rounded text-lg font-semibold cursor-pointer hover:bg-opacity-90 transition-all duration-200 w-full mt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  ចូលគណនី <i className="fa-solid fa-right-to-bracket ml-2"></i>
                </Link>
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
