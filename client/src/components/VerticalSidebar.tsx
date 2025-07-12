import React, { useState } from 'react';
import { Home, User, LogOut, Menu, Plus, Edit3 } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

interface VerticalSidebarProps {
  sidebarItems: SidebarItem[];
  handleLogout: () => void;
  navigate: (href: string) => void;
}

const VerticalSidebar: React.FC<VerticalSidebarProps> = ({
  sidebarItems,
  handleLogout,
  navigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false);
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen w-20 border-r border-gray-200 flex-col items-center bg-white/95 px-2 py-6 gap-6 justify-between z-30 pb-4 transition-all duration-200">
        <div className="flex flex-col items-center w-full gap-6">
          {/* Home Icon at the top */}
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-3 text-gray-600 hover:bg-teal-50 hover:text-teal-700 focus:ring-2 focus:ring-teal-200"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
          {/* Nav links */}
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => navigate(item.href)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-1 text-gray-600 hover:bg-teal-50 hover:text-teal-700 focus:ring-2 focus:ring-teal-200 ${
                    item.active ? 'bg-teal-600 text-white shadow' : ''
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
                <span className={`text-xs font-medium ${
                  item.active ? 'text-teal-700' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Create Icon at the bottom */}
        <div className="flex flex-col items-center mb-2 w-full mt-8">
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-teal-50 border border-gray-200 focus:outline-none text-gray-700 transition-all"
            title="Create"
            aria-label="Create"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-teal-700 ">Create</span>
        </div>
      </div>
      {/* Mobile Hamburger Menu Icon */}
      {/* Removed mobile hamburger menu and drawer to prevent duplicate menu icons */}
    </>
  );
};

export default VerticalSidebar; 