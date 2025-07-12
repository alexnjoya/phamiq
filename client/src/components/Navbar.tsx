import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Upload, HelpCircle, User, LogOut, Plus, Bot, History as HistoryIcon, Search, Settings, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/api/authService";

export const Navbar = ({ hideLogo = false }: { hideLogo?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, handleDetectionClick } = useAuth();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await authService.getCurrentUser();
        setUserEmail(user.email);
      } catch (e) {
        setUserEmail("");
      }
    }
    if (isAuthenticated) fetchUser();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 ">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Home Icon */}
          <div className="flex items-center space-x-2">
            {!hideLogo && (
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 ag-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌱</span>
                </div>
              </Link>
            )}
            <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-green-50 -ml-2">
              <Home className="w-6 h-6 text-gray-600 hover:text-green-700" />
            </Link>
            <Link to="/discovery" className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-blue-50 ml-1">
              <Search className="w-6 h-6 text-blue-600 hover:text-blue-700" />
            </Link>
          </div>

          {/* Center Navigation - Detection Button */}
          <div className="hidden md:flex items-center">
            <Button
              onClick={handleDetectionClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Detection
            </Button>
          </div>

          <div className="flex-1" />

          {/* Language Selector & Profile (right end) */}
          <div className="flex items-center space-x-2 md:space-x-4 ml-2">
            {/* Language selector moved to profile dropdown */}
            
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              /* Profile Dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center space-x-2 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 focus:outline-none"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                    {userEmail && (
                      <div className="px-4 py-2 border-b border-gray-100 mb-2">
                        <span className="block text-xs text-gray-500 truncate" title={userEmail}>{userEmail}</span>
                      </div>
                    )}
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                      <select className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="en">English</option>
                        <option value="tw">Twi</option>
                        <option value="ev">Ewe</option>
                        <option value="dag">Dagbani</option>
                      </select>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
