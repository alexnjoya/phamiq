import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyService, HistoryItem, MultispectralHistoryItem } from '../api/historyService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Crop, 
  TrendingUp,
  Clock,
  Image as ImageIcon,
  Eye,
  Filter,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Bot,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '../lib/utils';

interface HistoryProps {
  className?: string;
}

type HistoryListItem = (HistoryItem & { type: 'image' }) | (MultispectralHistoryItem & { type: 'multispectral' });

const History: React.FC<HistoryProps> = ({ className = '' }) => {
  const [history, setHistory] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [pendingDelete, setPendingDelete] = useState<HistoryListItem | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadHistory();
    }
  }, [isAuthenticated, authLoading]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First test if backend is reachable
      const isBackendReachable = await historyService.testBackendConnection();
      if (!isBackendReachable) {
        setError('Backend server is not reachable. Please ensure the server is running on http://localhost:8000');
        return;
      }
      
      const historyData = await historyService.getPredictionHistory(20); // Load last 20 entries
      setHistory(historyData as HistoryListItem[]);
    } catch (err) {
      console.error('History load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = () => {
    loadHistory();
  };

  const handleChatClick = (e: React.MouseEvent, item: HistoryListItem) => {
    e.stopPropagation(); // Prevent card expansion
    if (item.type === 'image') {
      // Store the chat context in localStorage for the chat page
      localStorage.setItem('chatContext', JSON.stringify({
        disease: item.disease,
        cropType: item.crop_type,
        confidence: item.confidence,
        severity: item.severity,
        filename: item.filename,
        created_at: item.created_at,
        image_url: item.image_url
      }));
      navigate('/chat');
    }
  };

  const handleViewDetails = async (item: HistoryListItem) => {
    if (item.type === 'multispectral') {
      // Only include relevant fields for multispectral
      const msResult = {
        analysis_type: 'multispectral',
        bestCrop: item.best_crop,
        prediction: item.prediction,
        filename: item.filename,
        created_at: item.created_at,
        // Add more fields if needed
      };
      localStorage.setItem('detectionResult', JSON.stringify(msResult));
    } else {
      // For image analysis, use cached recommendations if available
      const detectionResult = {
        disease: item.disease,
        confidence: item.confidence * 100,
        severity: item.severity,
        cropType: item.crop_type,
        imageUrl: item.image_url || '/placeholder.svg',
        llm_available: true,
        recommendations: (item as any).recommendations || null // Use cached recommendations
      };
      
      // Store the result with cached recommendations
      localStorage.setItem('detectionResult', JSON.stringify(detectionResult));
    }
    navigate('/results');
  };

  const handleDeleteHistory = async (e: React.MouseEvent, item: HistoryListItem) => {
    e.stopPropagation();
    setPendingDelete(item);
    toast({
      title: 'Delete Analysis?',
      description: `Are you sure you want to delete this analysis: ${item.type === 'multispectral' ? item.prediction : item.disease}?`,
      variant: 'destructive',
      action: (
        <div className="flex gap-2 mt-2">
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
    try {
      await historyService.deleteHistoryEntry(item.id);
      setHistory(prev => prev.filter(historyItem => historyItem.id !== item.id));
              toast({ title: 'Deleted', description: 'Analysis deleted successfully.' });
              setPendingDelete(null);
    } catch (error) {
              toast({ title: 'Error', description: 'Failed to delete history entry. Please try again.', variant: 'destructive' });
            }
          }}>
            Delete
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setPendingDelete(null); toast({ title: 'Cancelled', description: 'Delete action cancelled.' }); }}>
            Cancel
          </Button>
        </div>
      )
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'mild':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredHistory = history.filter(item => {
    if (item.type === 'multispectral') {
      return (
        (item.prediction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.best_crop?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else if (item.type === 'image') {
      return (
        item.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.crop_type.toLowerCase().includes(searchTerm.toLowerCase())
      ) && (filterSeverity === 'all' || (item.severity && item.severity.toLowerCase() === filterSeverity.toLowerCase()));
    }
    return false;
  });

  if (authLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
            <p className="text-gray-500 mt-1">Review your previous crop disease detections</p>
          </div>
        </div>

        {/* Authentication Loading State */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
            <p className="text-gray-500 mt-1">Review your previous crop disease detections</p>
          </div>
        </div>

        {/* Not Authenticated State */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
            <p className="text-yellow-700 mb-4">Please log in to view your analysis history.</p>
            <Button onClick={() => navigate('/login')} className="bg-yellow-600 hover:bg-yellow-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
            <p className="text-gray-500 mt-1">Review your previous crop disease detections</p>
          </div>
          <Button
            onClick={refreshHistory}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
            <p className="text-gray-500 mt-1">Review your previous crop disease detections</p>
          </div>
          <Button
            onClick={refreshHistory}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={refreshHistory} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
            <p className="text-gray-500 mt-1">Review your previous crop disease detections</p>
          </div>
          <Button
            onClick={refreshHistory}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        {/* Empty State */}
        <div className="text-center text-gray-500 py-12">
          No analysis history found.
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
          <p className="text-gray-500 mt-1">Review your previous crop disease detections</p>
        </div>
        <Button
          onClick={refreshHistory}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none flex-1"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-gray-100 p-2 rounded-md"
        >
          <option value="all">All Severities</option>
          <option value="severe">Severe</option>
          <option value="moderate">Moderate</option>
          <option value="mild">Mild</option>
        </select>
      </div>
      
      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-gray-200">
            <div className="flex-1 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {item.type === 'image' ? (
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                      ) : (
                  <Crop className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.type === 'image' ? item.disease : item.prediction}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.type === 'image' ? (
                    <>
                      Crop: {item.crop_type}, Severity: {item.severity}
                    </>
                  ) : (
                    <>
                      Crop: {item.best_crop}, Confidence: {item.confidence * 100}%
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </p>
                        </div>
                      </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleViewDetails(item)}
                className="flex items-center gap-1"
              >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        <Button
                          variant="outline"
                          size="sm"
                            onClick={(e) => handleChatClick(e, item)}
                className="flex items-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                Chat
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                onClick={(e) => handleDeleteHistory(e, item)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
              </Card>
        ))}
      </div>
    </div>
  );
};

export default History; 