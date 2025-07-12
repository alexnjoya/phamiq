import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import { alleaiService } from '../api/alleaiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const AITestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    backendConnection: boolean;
    aiConnection: boolean;
    chatTest: boolean;
    diseaseAnalysis: boolean;
  }>({
    backendConnection: false,
    aiConnection: false,
    chatTest: false,
    diseaseAnalysis: false
  });

  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { chat, getDiseaseRecommendations, loading: aiLoading, error: aiError } = useAI();

  const runTests = async () => {
    setLoading(true);
    setError(null);
    
    const results = {
      backendConnection: false,
      aiConnection: false,
      chatTest: false,
      diseaseAnalysis: false
    };

    try {
      // Test backend connection
      console.log('Testing backend connection...');
      const backendTest = await alleaiService.testBackendConnection();
      results.backendConnection = backendTest.connected;
      
      if (!backendTest.connected) {
        throw new Error(`Backend connection failed: ${backendTest.error}`);
      }

      // Test AI connection
      console.log('Testing AI connection...');
      const aiTest = await alleaiService.testConnection();
      results.aiConnection = aiTest;

      if (aiTest) {
        // Test chat functionality
        console.log('Testing chat functionality...');
        try {
          const chatResponse = await chat('Hello! This is a test message. Please respond with "Test successful" if you can read this.');
          results.chatTest = chatResponse.includes('Test successful') || chatResponse.length > 0;
        } catch (error) {
          console.error('Chat test failed:', error);
        }

        // Test disease analysis
        console.log('Testing disease analysis...');
        try {
          const analysisResponse = await getDiseaseRecommendations('tomato_leaf_blight', 85, 'tomato');
          results.diseaseAnalysis = analysisResponse && typeof analysisResponse === 'object';
        } catch (error) {
          console.error('Disease analysis test failed:', error);
        }
      }

      setTestResults(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testChat = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      const response = await chat(chatMessage);
      setChatResponse(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chat failed');
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            AI Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run AI Integration Tests'
            )}
          </Button>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.backendConnection)}
              <span>Backend Connection</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.aiConnection)}
              <span>AI Service Connection</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.chatTest)}
              <span>Chat Functionality</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.diseaseAnalysis)}
              <span>Disease Analysis</span>
            </div>
          </div>

          {Object.values(testResults).every(Boolean) && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                All tests passed! AI integration is working correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Enter a message to test AI chat..."
              rows={3}
            />
          </div>
          
          <Button 
            onClick={testChat} 
            disabled={aiLoading || !chatMessage.trim()}
            className="w-full"
          >
            {aiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>

          {aiError && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          )}

          {chatResponse && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Response:</label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <pre className="whitespace-pre-wrap text-sm">{chatResponse}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 