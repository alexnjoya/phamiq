import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot,
  History as HistoryIcon,
  Settings,
  Plus,
  Search,
  Calendar,
  Image,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye
} from "lucide-react";
import SidebarLayout from '../components/SidebarLayout';
import History from '../components/History';
import { useAuth } from '../hooks/useAuth';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const sidebarItems = [
    { icon: Plus, label: "Analysis", href: "/upload" },
    { icon: HistoryIcon, label: "History", active: true, href: "/history" },
    { icon: Bot, label: "Chat", href: "/chat" },
    { icon: Search, label: "Discovery", href: "/discovery" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const [profileOpen, setProfileOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <SidebarLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col mt-16 md:mt-0 pt-16 md:pt-0 ml-0 md:ml-24">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-6">
          {/* Header */}
          <div className="py-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Analysis History
            </h1>
            <p className="text-gray-500">Review your previous crop disease detections</p>
          </div>

          {/* History Component */}
          <History className="mb-8" />
        </div>
      </div>
    </SidebarLayout>
  );
};

export default HistoryPage;
