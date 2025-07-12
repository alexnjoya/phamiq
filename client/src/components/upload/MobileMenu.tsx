import React from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Home, User, LogOut, Menu } from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  sidebarItems: SidebarItem[];
  navigate: (href: string) => void;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  handleLogout: () => void;
  userInitials: string;
  userName: string;
  userEmail: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  sidebarItems,
  navigate,
  createOpen,
  setCreateOpen,
  handleLogout,
  userInitials,
  userName,
  userEmail,
}) => {
  return (
    <>
      {/* Mobile Menu Icon */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200 shadow-md hover:bg-gray-100 hover:scale-105 active:scale-95 transition-transform duration-150"
          aria-label="Open menu"
        >
          <Menu className="w-7 h-7 text-gray-700 font-bold" />
        </button>
      </div>
      
      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full pt-16">
            <div className="flex-1 px-4 py-6 space-y-2">
              {/* Home Icon */}
              <button
                onClick={() => { navigate("/"); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </button>
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => { navigate(item.href); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Profile/Logout at bottom - removed circular avatar icon */}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileMenu; 