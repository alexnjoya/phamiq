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
  const [pendingDelete, setPendingDelete] = useState<HistoryListItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

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
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Analysis History</h3>
            <p className="text-gray-500 mb-6">Your prediction history will appear here once you start analyzing images.</p>
            <Button onClick={() => window.location.href = '/upload'} className="bg-teal-600 hover:bg-teal-700">
              Start Analysis
            </Button>
          </CardContent>
        </Card>
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
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by disease or crop type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Severities</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </div>
      
      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{filteredHistory.length} of {history.length} results</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
                
      {/* Expandable History List */}
      <div className="space-y-3">
        {filteredHistory.map((item) => {
          const expanded = expandedId === item.id;
          if (item.type === 'multispectral') {
            // Multispectral card (clean, professional, only relevant fields)
            return (
              <Card
                key={item.id}
                className={`hover:shadow-lg transition-all duration-200 border-purple-200 cursor-pointer ${expanded ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setExpandedId(expanded ? null : item.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center px-6 py-4">
                    <div className="mr-4 flex-shrink-0">
                      {expanded ? (
                        <ChevronDown className="w-6 h-6 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-purple-800 text-lg truncate">
                            {item.prediction}
                          </h3>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2">Multispectral</Badge>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Crop className="w-4 h-4" />
                            {item.best_crop}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            <span className="truncate max-w-xs">{item.filename}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {historyService.formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Expandable Details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 bg-purple-50 border-t border-purple-100 ${expanded ? 'max-h-96 py-4 px-8' : 'max-h-0 py-0 px-8'}`}
                    style={{}}
                  >
                    {expanded && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">File: {item.filename}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span>Created: {historyService.formatDate(item.created_at)}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleViewDetails(item)}>
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          } else if (item.type === 'image') {
            // Image card rendering
            return (
              <Card
                key={item.id}
                className={`hover:shadow-lg transition-all duration-200 border-gray-200 cursor-pointer ${expanded ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setExpandedId(expanded ? null : item.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center px-6 py-4">
                    {/* Chevron */}
                    <div className="mr-4 flex-shrink-0">
                      {expanded ? (
                        <ChevronDown className="w-6 h-6 text-green-600" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    {/* Main Info */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-green-800 text-lg truncate">
                            {item.disease}
                          </h3>
                          <Badge className={`ml-2 ${getSeverityColor(item.severity)} border`}>{item.severity}</Badge>
                          {item.is_multispectral && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2">Multispectral</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            <span className="truncate max-w-xs">{item.filename}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {historyService.formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {/* Chat Button */}
                        <Button
                          onClick={(e) => handleChatClick(e, item)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Chat</span>
                        </Button>
                        {/* Confidence Score */}
                        <div className="flex flex-col items-end">
                          <div className={`text-3xl font-bold ${getConfidenceColor(item.confidence)}`}>{(item.confidence * 100).toFixed(0)}%</div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Expandable Details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 bg-green-50 border-t border-green-100 ${expanded ? 'max-h-96 py-4 px-8' : 'max-h-0 py-0 px-8'}`}
                    style={{}}
                  >
                    {expanded && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">File: {item.filename}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Bot className="w-4 h-4" />
                          <span>LLM Recommendations: <span className="font-medium">{(item as any).recommendations ? 'Cached' : 'Available (regenerated on view)'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span>Created: {historyService.formatDate(item.created_at)}</span>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          <Button 
                            onClick={(e) => handleChatClick(e, item)}
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat with AI
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleViewDetails(item)}>
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                          <Button 
                            onClick={(e) => handleDeleteHistory(e, item)}
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </div>
      
      {/* Load More */}
      {history.length >= 20 && (
        <div className="text-center">
          <Button
            onClick={() => historyService.getPredictionHistory(50).then(data => setHistory(data as HistoryListItem[]))}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Load More History
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredHistory.length === 0 && history.length > 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Results Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History; 