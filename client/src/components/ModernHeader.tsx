import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/api/authService";

const ModernHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.verifyToken();
        setIsAuthenticated(isValid);
        if (isValid) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Detection", href: "/upload" },
    { name: "Help", href: "/help" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Layout - Menu Icon on Left */}
          <div className="md:hidden flex items-center justify-between w-full">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                PhamIQ
              </span>
            </Link>
            
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                PhamIQ
              </span>
            </Link>

            <nav className="flex items-center space-x-6 ml-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-md font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-green-600"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {user?.first_name || "User"}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 block truncate" title={user?.email}>{user?.email}</p>
                      <div className="mt-2">
                        <select className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="en">English</option>
                          <option value="tw">Twi</option>
                          <option value="ev">Ewe</option>
                          <option value="dag">Dagbani</option>
                        </select>
                      </div>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 block"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-green-600">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-base font-medium py-3 px-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 block truncate" title={user?.email}>{user?.email}</p>
                      <div className="mt-2">
                        <select className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="en">English</option>
                          <option value="tw">Twi</option>
                          <option value="ev">Ewe</option>
                          <option value="dag">Dagbani</option>
                        </select>
                      </div>
                    </div>
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-green-600 h-12">
                        Settings
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-600 hover:text-green-600 h-12"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-green-600 h-12">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white h-12">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ModernHeader;
