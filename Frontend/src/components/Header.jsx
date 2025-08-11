import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Menu,
  X,
  User,
  ChevronDown,
  Calendar,
  Building2,
  Shield,
  LogOut,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState("Ahmedabad");
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user role for navigation
  const getUserRole = () => {
    return user?.role || "customer"; // Default to customer if no role
  };

  // Get navigation links based on user role
  const getNavigationLinks = () => {
    const role = getUserRole();
    const baseLinks = [{ name: "Home", path: "/", icon: Home }];

    if (!isAuthenticated) {
      // Show browse venues for non-authenticated users
      baseLinks.push({
        name: "Browse Venues",
        path: "/venues",
        icon: Building2,
      });
      return baseLinks;
    }

    if (role === "user") {
      // Players can browse venues and see their bookings
      baseLinks.push(
        { name: "Browse Venues", path: "/venues", icon: Building2 },
        { name: "My Bookings", path: "/my-bookings", icon: Calendar }
      );
    } else if (role === "owner") {
      // Owners only see their dashboard
      baseLinks.push({
        name: "Owner Dashboard",
        path: "/owner/dashboard",
        icon: Building2,
      });
    } else if (role === "admin") {
      // Admins only see their dashboard
      baseLinks.push({
        name: "Admin Dashboard",
        path: "/admin/dashboard",
        icon: Shield,
      });
    }

    return baseLinks;
  };

  // Get user menu items based on role
  const getUserMenuItems = () => {
    const role = getUserRole();
    const baseItems = [
      { name: "Profile", path: "/profile", icon: User },
      // Settings item removed for all roles
    ];

    if (role === "user") {
      // Players can see their bookings
      baseItems.splice(1, 0, {
        name: "My Bookings",
        path: "/my-bookings",
        icon: Calendar,
      });
    } else if (role === "owner") {
      // Owners see their dashboard
      baseItems.unshift({
        name: "Owner Dashboard",
        path: "/owner/dashboard",
        icon: Building2,
      });
    } else if (role === "admin") {
      // Admins see their dashboard
      baseItems.unshift({
        name: "Admin Dashboard",
        path: "/admin/dashboard",
        icon: Shield,
      });
    }

    return baseItems;
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    // Implement location search functionality
    console.log("Searching for:", searchLocation);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const navigationLinks = getNavigationLinks();
  const userMenuItems = getUserMenuItems();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              QUICKCOURT
            </button>
          </div>

          {/* Location Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleLocationSearch} className="w-full">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Search location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationLinks.slice(1).map((link) => {
              const IconComponent = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{link.name}</span>
                </button>
              );
            })}

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 font-medium transition-all duration-200 px-3 py-2 rounded-xl border ${
                    isUserMenuOpen
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 shadow-sm"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <User
                      className={`h-4 w-4 text-white ${
                        user?.avatarUrl ? "hidden" : "block"
                      }`}
                    />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold truncate max-w-24">
                      {user?.name}
                    </p>
                    <p
                      className={`text-xs capitalize ${
                        getUserRole() === "admin"
                          ? "text-purple-600"
                          : getUserRole() === "owner"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {getUserRole() === "user" ? "Player" : getUserRole()}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                            {user?.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <User
                              className={`h-5 w-5 text-white ${
                                user?.avatarUrl ? "hidden" : "block"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              getUserRole() === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : getUserRole() === "owner"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            {getUserRole() === "user"
                              ? "Player"
                              : getUserRole()}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {userMenuItems.map((item, index) => {
                          const IconComponent = item.icon;
                          const isFirstItem = index === 0;
                          const isDashboard = item.name.includes("Dashboard");

                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                navigate(item.path);
                                setIsUserMenuOpen(false);
                              }}
                              className={`flex items-center space-x-3 w-full px-4 py-2.5 text-sm transition-all duration-200 ${
                                isDashboard
                                  ? "text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-medium"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              } ${isFirstItem ? "mt-1" : ""}`}
                            >
                              <IconComponent
                                className={`h-4 w-4 ${
                                  isDashboard
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`}
                              />
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {/* Mobile Location Search */}
              <form onSubmit={handleLocationSearch} className="mb-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Search location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      navigate(link.path);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{link.name}</span>
                  </button>
                );
              })}

              {isAuthenticated ? (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {/* Mobile User Info */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 mx-3 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <User
                          className={`h-5 w-5 text-white ${
                            user?.avatarUrl ? "hidden" : "block"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                            getUserRole() === "admin"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : getUserRole() === "owner"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}
                        >
                          {getUserRole() === "user" ? "Player" : getUserRole()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="px-3 space-y-1">
                    {userMenuItems.map((item) => {
                      const IconComponent = item.icon;
                      const isDashboard = item.name.includes("Dashboard");

                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            navigate(item.path);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isDashboard
                              ? "text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <IconComponent
                            className={`h-4 w-4 ${
                              isDashboard ? "text-blue-600" : "text-gray-500"
                            }`}
                          />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Logout */}
                  <div className="px-3 pt-2 border-t border-gray-200 mt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
