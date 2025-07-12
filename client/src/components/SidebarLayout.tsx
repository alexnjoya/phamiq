import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerticalSidebar from './VerticalSidebar';
import MobileMenu from './upload/MobileMenu';
import { useAuth } from '@/hooks/useAuth';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Example sidebar items (should be passed as props or context in a real app)
import { Plus, History as HistoryIcon, Bot, Search, Settings, Edit3 } from "lucide-react";

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigation = (href: string) => {
    navigate(href);
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Define sidebar items based on authentication status
  const getSidebarItems = () => {
    const baseItems = [
      { icon: HistoryIcon, label: "History", href: "/history" },
      { icon: Bot, label: "Chat", href: "/chat" },
      { icon: Search, label: "Discovery", href: "/discovery" },
    ];

    if (isAuthenticated) {
      return [
        { icon: Plus, label: " Analysis", active: false, href: "/upload" },
        ...baseItems,
        { icon: Edit3, label: "Create", href: "/profile" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ];
    } else {
      return [
        ...baseItems,
        { icon: Plus, label: "Get Started", active: false, href: "/login" },
      ];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu */}
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        sidebarItems={sidebarItems}
        navigate={handleNavigation}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        handleLogout={handleLogout}
        userInitials={isAuthenticated ? "U" : "G"}
        userName={isAuthenticated ? "User" : "Guest"}
        userEmail={isAuthenticated ? "user@email.com" : "guest@example.com"}
      />
      {/* Desktop Sidebar */}
      <VerticalSidebar
        sidebarItems={sidebarItems}
        handleLogout={handleLogout}
        navigate={handleNavigation}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout; 