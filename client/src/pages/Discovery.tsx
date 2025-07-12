import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  History as HistoryIcon, 
  Bot,
  Search, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  LogOut
} from 'lucide-react';
import { discoveryService, TrendingDisease, Insight, DiseaseAlert } from '../api/discoveryService';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getImageUrl } from '../lib/utils';

// Mock data for articles
const mockArticles = [
 
];

const agriCategories = [
  { key: 'top', label: 'Top' },
  { key: 'crops', label: 'Crops' },
  { key: 'diseases', label: 'Diseases' },
  { key: 'research', label: 'Research' },
  { key: 'innovations', label: 'Innovations' },
  { key: 'community', label: 'Community' }
];

const Discovery = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingDiseases, setTrendingDiseases] = useState<TrendingDisease[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [alerts, setAlerts] = useState<DiseaseAlert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('top');
  const { id } = useParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: Plus, label: "Analysis", href: "/upload" },
    { icon: HistoryIcon, label: "History", href: "/history" },
    { icon: Bot, label: "Chat", href: "/chat" },
    { icon: Search, label: "Discovery", href: "/discovery", active: true },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: LogOut, label: "Logout", href: "/logout" }
  ];

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDiscoveryData();
    }
  }, [selectedCategory, selectedRegion, isAuthenticated, authLoading]);

  const fetchDiscoveryData = async () => {
    try {
      setLoading(true);
      
      // First test if backend is reachable
      const isBackendReachable = await discoveryService.testBackendConnection();
      if (!isBackendReachable) {
        toast.error('Backend server is not reachable. Please ensure the server is running on http://localhost:8000');
        return;
      }
      
      const [diseasesData, insightsData, alertsData] = await Promise.all([
        discoveryService.getTrendingDiseases(10, selectedRegion !== 'all' ? selectedRegion : undefined),
        discoveryService.getInsights(selectedCategory !== 'all' ? selectedCategory : undefined, 10),
        discoveryService.getDiseaseAlerts()
      ]);
      
      setTrendingDiseases(diseasesData);
      setInsights(insightsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching discovery data:', error);
      toast.error('Failed to load discovery content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discovery?')) return;
    setDeletingId(id);
    try {
      await discoveryService.deleteInsight(id);
      toast.success('Discovery deleted');
      fetchDiscoveryData();
    } catch (err) {
      toast.error('Failed to delete discovery');
    } finally {
      setDeletingId(null);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'stable':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'decreasing':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Update filteredInsights to use selectedTab for filtering
  const filteredInsights = insights.filter(insight => {
    const matchesSearch =
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    // If 'Top' is selected, show all
    if (selectedTab === 'top') return matchesSearch;
    // Otherwise, filter by category
    return matchesSearch && insight.category.toLowerCase() === selectedTab;
  });

  // Helper for meta info (sources, timestamp)
  const getMetaInfo = (insight: Insight) => (
    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="#e5e7eb"/></svg>
        1 source
      </span>
      <span>•</span>
      <span>{formatDate(insight.published_date)}</span>
    </div>
  );

  if (id) {
    // Detail page for a single article
    const article = mockArticles.find((a) => a.id === id);
    if (!article) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Article Not Found</h2>
            <p className="text-gray-500">The requested article does not exist.</p>
            <Button className="mt-6" onClick={() => navigate('/discovery')}>Back to Discovery</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16">
        <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden mt-8">
          <img src={getImageUrl(article.image)} alt={article.title} className="w-full h-72 object-cover" />
          <div className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">{article.category}</span>
              <span className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
              <span>By {article.author}</span>
            </div>
            <div className="prose max-w-none text-gray-800 mb-8">
              {article.content}
            </div>
            <Button variant="outline" onClick={() => navigate('/discovery')}>Back to Discovery</Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Checking authentication...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Search className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access the discovery features.</p>
              <Button onClick={() => navigate('/login')} className="bg-teal-600 hover:bg-teal-700">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="flex items-center w-full bg-white border-b border-gray-100 pt-6 pb-2 px-8">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border border-gray-200 mr-3">
        </span>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-24 bg-white">
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-8 pt-6 pb-16">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto bg-white px-0 border-0 justify-start scrollbar-none whitespace-nowrap touch-pan-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`
              .scrollbar-none::-webkit-scrollbar { display: none; }
            `}</style>
            {agriCategories.map((cat) => (
              <button
                key={cat.key}
                className={`px-4 py-1.5 rounded-full text-base font-semibold transition-colors duration-200 border-0 ${selectedTab === cat.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} min-w-[90px]`}
                onClick={() => setSelectedTab(cat.key)}
                style={{ boxShadow: selectedTab === cat.key ? '0 2px 8px 0 rgba(0,0,0,0.08)' : 'none' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Featured Article and Horizontal List for selected tab */}
          <div className="flex flex-col gap-8 mt-4">
            {filteredInsights.length === 0 && (
              <div className="text-gray-500 text-center">No discoveries found.</div>
            )}
            {/* Featured Card */}
            {filteredInsights.length > 0 && (
              <div className="w-full bg-white flex flex-col overflow-hidden mb-2">
                {filteredInsights[0].image_url && (
                  <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={getImageUrl(filteredInsights[0].image_url)} alt={filteredInsights[0].title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 pt-6 pb-2 px-0 flex flex-col justify-between items-start text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-base px-3 py-1 rounded-full bg-gray-900 text-white font-semibold">{filteredInsights[0].category}</Badge>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 line-clamp-2 leading-tight">{filteredInsights[0].title}</h2>
                    {getMetaInfo(filteredInsights[0])}
                    <div className="text-gray-700 text-base mt-2 mb-4 line-clamp-3">{filteredInsights[0].description}</div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button size="lg" className="text-base font-semibold px-6 py-2.5" onClick={() => navigate(`/discovery/${filteredInsights[0].id}`)}>
                      View Details
                    </Button>
                    <Button size="lg" variant="destructive" className="text-base font-semibold px-6 py-2.5" onClick={() => handleDelete(filteredInsights[0].id)} disabled={deletingId === filteredInsights[0].id}>
                      {deletingId === filteredInsights[0].id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Horizontal Scrollable List of Other Discoveries */}
            {filteredInsights.length > 1 && (
              <div className="flex gap-5 overflow-x-auto scrollbar-none pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {filteredInsights.slice(1).map(insight => (
                  <div key={insight.id} className="flex-shrink-0 w-72 bg-white flex flex-col overflow-hidden">
                    {insight.image_url && (
                      <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={getImageUrl(insight.image_url)} alt={insight.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 pt-4 pb-2 px-0 flex flex-col justify-between items-start text-left">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white font-semibold">{insight.category}</Badge>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">{insight.title}</h2>
                        {getMetaInfo(insight)}
                        <div className="text-gray-700 text-sm mt-1 mb-2 line-clamp-2">{insight.description}</div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="text-sm font-semibold px-4 py-2" onClick={() => navigate(`/discovery/${insight.id}`)}>
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive" className="text-sm font-semibold px-4 py-2" onClick={() => handleDelete(insight.id)} disabled={deletingId === insight.id}>
                          {deletingId === insight.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default Discovery;