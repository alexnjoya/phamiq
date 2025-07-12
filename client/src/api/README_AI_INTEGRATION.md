# AlleAI Integration Guide

This document describes the comprehensive AI integration for the PhamIQ application using AlleAI services.

## Overview

The AI integration provides multiple layers of functionality:

1. **Backend AI Router** (`backend/app/routes/ai_router.py`) - API endpoints for AI services
2. **Frontend AI Services** - TypeScript services for communicating with the backend
3. **React Hooks** - Easy-to-use hooks for AI functionality in components
4. **Type Definitions** - TypeScript types and constants

## Backend Integration

### AI Router Endpoints

The backend provides the following AI endpoints:

- `POST /ai/chat` - General AI chat
- `POST /ai/disease-analysis` - Specialized disease analysis
- `POST /ai/generate-title` - Generate content titles
- `POST /ai/generate-description` - Generate content descriptions
- `POST /ai/generate-image` - Generate images (placeholder)
- `GET /ai/status` - Get AI service status

### AlleAI Service

The backend uses the `AlleAIService` class which provides:

- Disease analysis with structured recommendations
- Agricultural chat functionality
- Model selection support
- Error handling and fallbacks

## Frontend Services

### Core AI Services

#### `alleaiService.ts`
Main service for all AI operations:

```typescript
import { alleaiService } from '@/api/alleaiService';

// Basic chat
const response = await alleaiService.chat("How do I treat plant diseases?");

// Disease analysis
const analysis = await alleaiService.analyzeDisease("Blight", 85, "Tomato");

// Generate content
const title = await alleaiService.generateTitle("Sustainable farming");
```

#### `aiIntegrationService.ts`
High-level integration functions:

```typescript
import { getDiseaseRecommendations, askAboutDisease } from '@/api/aiIntegrationService';

// Get comprehensive disease recommendations
const recommendations = await getDiseaseRecommendations("Blight", 85, "Tomato");

// Ask specific questions about diseases
const answer = await askAboutDisease("Blight", 85, "Tomato", "What are the early symptoms?");
```

#### `aiChatService.ts`
Legacy chat service (maintained for backward compatibility):

```typescript
import { askAiChat } from '@/api/aiChatService';

const response = await askAiChat("How do I prevent plant diseases?");
```

### React Hooks

#### `useAI()` Hook
Comprehensive AI functionality:

```typescript
import { useAI } from '@/hooks/useAI';

const MyComponent = () => {
  const { 
    chat, 
    getDiseaseRecommendations, 
    loading, 
    error, 
    available 
  } = useAI();

  const handleChat = async () => {
    const response = await chat("How do I treat blight?");
    console.log(response);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleChat}>Ask AI</button>
    </div>
  );
};
```

#### `useAIChat()` Hook
Specialized chat functionality:

```typescript
import { useAIChat } from '@/hooks/useAI';

const ChatComponent = () => {
  const { messages, sendMessage, loading, clearMessages } = useAIChat();

  const handleSend = async () => {
    await sendMessage("How do I prevent plant diseases?");
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      <button onClick={handleSend}>Send</button>
      <button onClick={clearMessages}>Clear</button>
    </div>
  );
};
```

#### `useDiseaseAnalysis()` Hook
Disease-specific analysis:

```typescript
import { useDiseaseAnalysis } from '@/hooks/useAI';

const DiseaseComponent = () => {
  const { analysis, analyzeDisease, loading } = useDiseaseAnalysis();

  const handleAnalysis = async () => {
    await analyzeDisease("Blight", 85, "Tomato");
  };

  return (
    <div>
      {loading && <p>Analyzing...</p>}
      {analysis && (
        <div>
          <h3>Overview</h3>
          <p>{analysis.overview}</p>
          <h3>Treatment</h3>
          <p>{analysis.treatment}</p>
        </div>
      )}
      <button onClick={handleAnalysis}>Analyze Disease</button>
    </div>
  );
};
```

## Type Definitions

### AI Types (`types/ai.ts`)

```typescript
import { 
  AIRecommendations, 
  DiseaseAnalysis, 
  AIMessage,
  AI_MODELS,
  SEVERITY_LEVELS 
} from '@/types/ai';

// Use predefined types
const recommendations: AIRecommendations = {
  disease_overview: "...",
  immediate_actions: "...",
  treatment_protocols: {
    organic: "...",
    chemical: "...",
    application: "..."
  },
  // ... other fields
};
```

## Usage Examples

### 1. Basic AI Chat

```typescript
import { useAI } from '@/hooks/useAI';

const ChatComponent = () => {
  const { chat, loading, error } = useAI();
  const [response, setResponse] = useState('');

  const handleAsk = async () => {
    try {
      const result = await chat("How do I treat tomato blight?");
      setResponse(result);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Asking...' : 'Ask AI'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {response && <p>{response}</p>}
    </div>
  );
};
```

### 2. Disease Analysis

```typescript
import { useDiseaseAnalysis } from '@/hooks/useAI';

const DiseaseAnalysisComponent = ({ disease, confidence, cropType }) => {
  const { analysis, analyzeDisease, loading, error } = useDiseaseAnalysis();

  useEffect(() => {
    if (disease && cropType) {
      analyzeDisease(disease, confidence, cropType);
    }
  }, [disease, confidence, cropType]);

  if (loading) return <div>Analyzing disease...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analysis) return null;

  return (
    <div>
      <h3>Disease Analysis</h3>
      <div>
        <h4>Overview</h4>
        <p>{analysis.overview}</p>
      </div>
      <div>
        <h4>Treatment</h4>
        <p>{analysis.treatment}</p>
      </div>
      <div>
        <h4>Prevention</h4>
        <p>{analysis.prevention}</p>
      </div>
    </div>
  );
};
```

### 3. Discovery Content Generation

```typescript
import { generateDiscoveryContent } from '@/api/aiIntegrationService';

const DiscoveryComponent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateContent = async (topic: string) => {
    setLoading(true);
    try {
      const result = await generateDiscoveryContent(topic);
      setContent(result);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => generateContent("Sustainable farming")}>
        Generate Content
      </button>
      {loading && <p>Generating...</p>}
      {content && (
        <div>
          <h3>{content.title}</h3>
          <p>{content.description}</p>
        </div>
      )}
    </div>
  );
};
```

## Configuration

### Backend Configuration

1. **API Key Setup**: Ensure the AlleAI API key is configured in `backend/app/config.py`:
   ```python
   ALLEAI_API_KEY: str = "your-alleai-api-key-here"
   ```

2. **Environment Variables**: The backend uses environment variables for configuration. Create a `.env` file in the backend directory:
   ```env
   ALLEAI_API_KEY=your-alleai-api-key-here
   ```

3. **Service Initialization**: The AlleAI service is automatically initialized when the FastAPI application starts.

### Frontend Configuration

1. **API Base URL**: The frontend automatically detects the API base URL from environment variables:
   ```typescript
   const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
   ```

2. **Environment Variables**: Create a `.env` file in the client directory:
   ```env
   VITE_API_BASE=http://localhost:8000
   ```

3. **Error Handling**: The frontend includes comprehensive error handling for:
   - Network connectivity issues
   - API authentication errors
   - Service unavailability
   - Invalid responses

4. **Connection Testing**: Use the `AITestComponent` to verify the integration:
   ```typescript
   import { AITestComponent } from './components/AITestComponent';
   ```

### Environment Variables

```env
# Backend
ALLEAI_API_KEY=your_alleai_api_key_here

# Frontend
VITE_API_BASE=http://localhost:8000
```

### Model Selection

```typescript
import { AI_MODELS, DEFAULT_MODELS } from '@/types/ai';

// Use specific models
const response = await chat("How do I treat blight?", [AI_MODELS.GPT4O]);

// Use default models
const response = await chat("How do I treat blight?", DEFAULT_MODELS);
```

## Error Handling

The AI services include comprehensive error handling:

```typescript
try {
  const response = await chat("How do I treat blight?");
  // Handle success
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle API key issues
  } else if (error.message.includes('timeout')) {
    // Handle timeout
  } else {
    // Handle other errors
  }
}
```

## Testing

### Test AI Connection

```typescript
import { testAIConnection } from '@/api/aiIntegrationService';

const testConnection = async () => {
  const result = await testAIConnection();
  console.log('AI Available:', result.available);
  console.log('Available Models:', result.models);
  console.log('Error:', result.error);
};
```

### Test Disease Analysis

```typescript
import { getDiseaseRecommendations } from '@/api/aiIntegrationService';

const testDiseaseAnalysis = async () => {
  try {
    const result = await getDiseaseRecommendations("Blight", 85, "Tomato");
    console.log('Analysis Result:', result);
  } catch (error) {
    console.error('Analysis Error:', error);
  }
};
```

## Best Practices

1. **Always handle loading states** - Use the loading state from hooks
2. **Implement error handling** - Catch and display errors appropriately
3. **Use appropriate models** - Select models based on the task
4. **Cache responses** - Consider caching for repeated requests
5. **Validate responses** - Use the validation functions from types
6. **Test connections** - Test AI availability before making requests

## Troubleshooting

### Common Issues

1. **API Key Not Configured**
   - Check that `ALLEAI_API_KEY` is set in backend environment
   - Verify the API key format starts with "alle-"

2. **Connection Failed**
   - Check network connectivity
   - Verify backend is running on correct port
   - Check CORS settings

3. **Invalid Response**
   - Use validation functions to check response format
   - Handle both JSON and string responses

4. **Timeout Issues**
   - Increase timeout settings for complex requests
   - Implement retry logic for failed requests

### Debug Mode

Enable debug logging:

```typescript
// In your component
console.log('AI State:', { loading, error, available, models });

// In services
console.log('AI Request:', { prompt, models });
console.log('AI Response:', response);
```

## Future Enhancements

1. **Streaming Responses** - Implement real-time response streaming
2. **Image Generation** - Add actual image generation capabilities
3. **Voice Integration** - Add voice input/output capabilities
4. **Offline Support** - Cache responses for offline access
5. **Multi-language Support** - Add support for multiple languages
6. **Advanced Analytics** - Track AI usage and performance metrics 