import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discoveryService, Insight } from '../api/discoveryService';
import { Button } from '@/components/ui/button';
import SidebarLayout from '../components/SidebarLayout';
import { getImageUrl } from '../lib/utils';

const DiscoveryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        if (!id) return;
        const data = await discoveryService.getInsightDetail(id);
        setInsight(data);
      } catch (err) {
        setError('Failed to load discovery details');
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !insight) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Not found'}</div>;

  return (
    <SidebarLayout>
      <div className="flex flex-col items-center min-h-screen bg-gray-50 pt-16">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-8 mt-8">
          {insight.image_url && (
            <img src={getImageUrl(insight.image_url)} alt={insight.title} className="w-full h-64 object-cover rounded-lg mb-6 border" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">{insight.category}</span>
            <span className="text-xs text-gray-400">{new Date(insight.published_date).toLocaleDateString()}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{insight.title}</h1>
          <div className="text-gray-700 mb-4 text-lg">{insight.description}</div>
          <div className="prose max-w-none text-gray-800 mb-6 whitespace-pre-line">{insight.content}</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {insight.tags.map(tag => (
              <span key={tag} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-6">By {insight.author}</div>
          <Button variant="outline" onClick={() => navigate('/discovery')}>Back to Discovery</Button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default DiscoveryDetails; 