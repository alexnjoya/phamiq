import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, History as HistoryIcon, Bot, Search, Settings, ChevronDown } from "lucide-react";
import SidebarLayout from '../components/SidebarLayout';
import { Button } from "@/components/ui/button";
import { predictionService, DetectionResult } from '@/api/predictionService';
import { multispectralService, MultispectralDetectionResult } from '@/api/multispectralService';
import { askAiChat } from '../api/aiChatService';
import { useToast } from "@/hooks/use-toast";

// Import upload components
import UploadInput from '../components/upload/UploadInput';
import AnalysisProgress from '../components/upload/AnalysisProgress';
import ChatHistory from '../components/upload/ChatHistory';
import AiChatHistory from '../components/upload/AiChatHistory';
import MobileMenu from '../components/upload/MobileMenu';

type LimitedMultispectralResult = { limited: true; message: string; band_references: any; calibration_constants: any; general_metadata: any; rawMetadata: any };
type MultispectralResultUnion = MultispectralDetectionResult | LimitedMultispectralResult;

// Add a type for chat history entries
type ChatEntry = {
  userFile: File;
  userImagePreview: string;
  result: DetectionResult | MultispectralResultUnion;
  isMultispectral: boolean;
};

const UploadPage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<DetectionResult | null>(null);
  const [multispectralResult, setMultispectralResult] = useState<MultispectralResultUnion | null>(null);
  const [multiSpectralMode, setMultiSpectralMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<'prediction' | 'llm' | 'complete'>('prediction');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o", "yi-large"]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Track if we have prediction results to encourage AI questions
  const hasPredictionResults = analysisResult || multispectralResult || chatHistory.length > 0;

  // Helper to get user initials (placeholder for now)
  const userInitials = "U"; // Replace with real initials if available
  const userName = "User"; // Replace with real name if available
  const userEmail = "user@email.com"; // Replace with real email if available

  // Close profile dropdown on click outside or Escape
  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e: MouseEvent) {
      const dropdown = document.getElementById('profile-dropdown');
      const avatar = document.getElementById('profile-avatar');
      if (dropdown && !dropdown.contains(e.target as Node) && avatar && !avatar.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [profileOpen]);

  // Close model dropdown on click outside or Escape
  useEffect(() => {
    if (!modelDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      const dropdown = document.querySelector('[data-model-dropdown]');
      const button = document.querySelector('[data-model-button]');
      if (dropdown && !dropdown.contains(e.target as Node) && button && !button.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setModelDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [modelDropdownOpen]);

  const resumePolling = async (job_id: string) => {
    setIsAnalyzing(true);
    setCurrentStage('prediction');
    setAnalysisLog(["multispectral analysis..."]);
    setProgress(10);
    let jobStatus = "pending";
    let jobResult = null;
    let pollCount = 0;
    while (jobStatus !== "completed" && jobStatus !== "failed" && pollCount < 120) {
      await new Promise(res => setTimeout(res, 2000));
      pollCount++;
      const job = await multispectralService.pollJobStatus(job_id);
      jobStatus = job.status;
      setProgress(10 + pollCount * 0.7);
      if (jobStatus === "completed") {
        jobResult = job.result;
        setAnalysisLog(log => [...log, "Analysis complete! Preparing results..."]);
        break;
      } else if (jobStatus === "failed") {
        setAnalysisLog(log => [...log, `Analysis failed: ${job.error}`]);
        setError(job.error || "Analysis failed");
        setIsAnalyzing(false);
        sessionStorage.removeItem('pending_multispectral_job');
        return;
      } else {
        setAnalysisLog(log => [...log, `Job status: ${jobStatus}...`]);
      }
    }
    sessionStorage.removeItem('pending_multispectral_job');
    if (jobStatus !== "completed") {
      setAnalysisLog(log => [...log, "Analysis timed out. Please try again later."]);
      setError("Analysis timed out. Please try again later.");
      setIsAnalyzing(false);
      return;
    }
    const multispectralResult = multispectralService.convertMultispectralToDetectionResult(jobResult as any) as MultispectralResultUnion;
    setProgress(100);
    setCurrentStage('complete');
    setMultispectralResult(multispectralResult);
    setAnalysisResult(null);
    setChatHistory((prev) => [
      ...prev,
      {
        userFile: { name: jobResult?.filename || 'multispectral.zip' } as File,
        userImagePreview: '',
        result: multispectralResult,
        isMultispectral: true,
      },
    ]);
    setSelectedFiles([]);
    setImagePreview("");
    setError("");
    setAnalysisLog([]);
    setCurrentStage('prediction');
    toast({
      title: "Analysis complete!",
      description: "Your results are now available in the chat history.",
      variant: "default"
    });
    setIsAnalyzing(false);
  };

  useEffect(() => {
    const pendingJobId = sessionStorage.getItem('pending_multispectral_job');
    if (pendingJobId) {
      resumePolling(pendingJobId);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      console.log('Files selected:', fileArray.length, 'Types:', fileArray.map(f => f.type), 'Sizes:', fileArray.map(f => f.size));
      
      // Check file size (1GB limit)
      const maxSize = 1024 * 1024 * 1024; // 1GB
      for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 1GB. Please compress your data or use a smaller file.`);
        return;
        }
      }
      
      setSelectedFiles(fileArray);
      setError("");
      
      // Handle different file types
      if (fileArray[0].type.startsWith('image/')) {
        // Regular image file
        console.log('Processing as image file');
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(fileArray[0]);
      } else if (fileArray[0].name.toLowerCase().endsWith('.txt')) {
        // Multispectral data file
        console.log('Processing as txt file');
        setImagePreview('/placeholder.svg'); // Use placeholder for text files
      } else if (fileArray[0].name.toLowerCase().endsWith('.zip')) {
        // Multispectral zip file
        console.log('Processing as zip file');
        setImagePreview('/placeholder.svg'); // Use placeholder for zip files
      } else {
        console.log('Unsupported file type:', fileArray[0].type, fileArray[0].name);
        setError("Unsupported file type. Please upload an image, .txt, or .zip file for multispectral analysis.");
        return;
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const fileArray = Array.from(files);
      console.log('Files dropped:', fileArray.length, 'Types:', fileArray.map(f => f.type), 'Sizes:', fileArray.map(f => f.size));
      
      // Check file size (1GB limit)
      const maxSize = 1024 * 1024 * 1024; // 1GB
      for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 1GB. Please compress your data or use a smaller file.`);
        return;
        }
      }
      
      setSelectedFiles(fileArray);
      setError("");
      
      // Handle different file types
      if (fileArray[0].type.startsWith('image/')) {
        // Regular image file
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(fileArray[0]);
      } else if (fileArray[0].name.toLowerCase().endsWith('.txt')) {
        // Multispectral data file
        setImagePreview('/placeholder.svg'); // Use placeholder for text files
      } else if (fileArray[0].name.toLowerCase().endsWith('.zip')) {
        // Multispectral zip file
        setImagePreview('/placeholder.svg'); // Use placeholder for zip files
      } else {
        setError("Unsupported file type. Please upload an image, .txt, or .zip file for multispectral analysis.");
        return;
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleZipSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      console.log('Zip files selected:', fileArray.length, 'Types:', fileArray.map(f => f.type), 'Sizes:', fileArray.map(f => f.size));
      
      // Check file size (1GB limit)
      const maxSize = 1024 * 1024 * 1024; // 1GB
      for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 1GB. Please compress your data or use a smaller file.`);
        return;
        }
      }
      
      setSelectedFiles(fileArray);
      setError("");
      setImagePreview('/placeholder.svg'); // Use placeholder for zip files
    }
  };

  const performAnalysis = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setCurrentStage('prediction');
    setProgress(0);
    setError("");
    setAnalysisLog(["Preparing files for upload..."]);
    setPredictionResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Determine analysis type based on file type and mode
      const isMultispectralFile = selectedFiles.some(file => file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.zip'));
      const shouldUseMultispectral = multiSpectralMode || isMultispectralFile;

      if (shouldUseMultispectral && isMultispectralFile) {
        setCurrentStage('prediction');
        setAnalysisLog(log => [...log, "Uploading files to server and submitting analysis job..."]);
        // Submit async job
        const { job_id } = await multispectralService.submitMultispectralJob(selectedFiles);
        setAnalysisLog(log => [...log, `Job submitted! Tracking job ID: ${job_id}`]);
        setAnalysisLog(log => [...log, "Waiting for analysis to complete..."]);
        setProgress(10);
        // Store job_id in sessionStorage to resume polling if user navigates away
        sessionStorage.setItem('pending_multispectral_job', job_id);
        let jobStatus = "pending";
        let jobResult = null;
        let pollCount = 0;
        while (jobStatus !== "completed" && jobStatus !== "failed" && pollCount < 120) { // max 2 min
          await new Promise(res => setTimeout(res, 2000));
          pollCount++;
          const job = await multispectralService.pollJobStatus(job_id);
          jobStatus = job.status;
          setProgress(10 + pollCount * 0.7); // progress bar moves slowly
          if (jobStatus === "completed") {
            jobResult = job.result;
            setAnalysisLog(log => [...log, "Analysis complete! Preparing results..."]);
            break;
          } else if (jobStatus === "failed") {
            setAnalysisLog(log => [...log, `Analysis failed: ${job.error}`]);
            setError(job.error || "Analysis failed");
            setIsAnalyzing(false);
            sessionStorage.removeItem('pending_multispectral_job');
            return;
          } else {
            setAnalysisLog(log => [...log, `Job status: ${jobStatus}...`]);
          }
        }
        sessionStorage.removeItem('pending_multispectral_job');
        if (jobStatus !== "completed") {
          setAnalysisLog(log => [...log, "Analysis timed out. Please try again later."]);
          setError("Analysis timed out. Please try again later.");
          setIsAnalyzing(false);
          return;
        }
        // Convert and show result
        const multispectralResult = multispectralService.convertMultispectralToDetectionResult(jobResult as any) as MultispectralResultUnion;
        setProgress(100);
        setCurrentStage('complete');
        setMultispectralResult(multispectralResult);
        setAnalysisResult(null);
        // Add to chat history
        setChatHistory((prev) => [
          ...prev,
          {
            userFile: selectedFiles[0], // Use first file for preview
            userImagePreview: imagePreview,
            result: multispectralResult,
            isMultispectral: true,
          },
        ]);
        // Reset input area (so files disappear from input box)
        setSelectedFiles([]);
        setImagePreview("");
        setError("");
        setAnalysisLog([]);
        setCurrentStage('prediction');
        // Show notification (toast)
        toast({
          title: "Analysis complete!",
          description: "Your results are now available in the chat history.",
          variant: "default"
        });
        return;
      } else if (selectedFiles[0].type.startsWith('image/')) {
        setAnalysisLog(log => [...log, "Uploading image to server..."]);
        
        // Stage 1: Model Prediction
        setCurrentStage('prediction');
        setProgress(10);
        setAnalysisLog(log => [...log, "Running AI model analysis..."]);
        
        const prediction = await predictionService.predictDisease(selectedFiles[0], 3);
        setProgress(50);
        setAnalysisLog(log => [...log, "Model analysis complete!"]);
        
        // Store prediction result for display
        const topPrediction = prediction.predictions[0];
        const predictionData = {
          disease: topPrediction.class,
          confidence: Math.round(topPrediction.confidence * 100 * 10) / 10,
          severity: topPrediction.confidence * 100 > 80 ? 'Severe' : 
                   topPrediction.confidence * 100 > 60 ? 'Moderate' : 'Mild'
        };
        setPredictionResult(predictionData);
        
        // Stage 2: LLM Processing
        setCurrentStage('llm');
        setProgress(60);
        setAnalysisLog(log => [...log, "Generating AI recommendations..."]);
        
        // Convert to detection result
        const detectionResult = predictionService.convertPredictionToDetectionResult(
          prediction, 
          imagePreview,
          multiSpectralMode
        );
        
        // Add recommendation data if available
        if (prediction.recommendations) {
          detectionResult.recommendations = prediction.recommendations;
          detectionResult.llm_available = prediction.llm_available;
        }
        
        setProgress(90);
        setAnalysisLog(log => [...log, "Finalizing results..."]);
        
        // Store the result in localStorage for the Results page
        localStorage.setItem("detectionResult", JSON.stringify(detectionResult));
        
        // Debug logging
        console.log('Stored detection result:', detectionResult);
        console.log('LLM available:', detectionResult.llm_available);
        console.log('Recommendations:', detectionResult.recommendations);
        
        setProgress(100);
        setCurrentStage('complete');
        setAnalysisLog(log => [...log, "Analysis complete! Preparing results..."]);
        setAnalysisResult(detectionResult);
        setMultispectralResult(null); // Clear multispectral result
        
        // Add to chat history
        setChatHistory((prev) => [
          ...prev,
          {
            userFile: selectedFiles[0],
            userImagePreview: imagePreview,
            result: detectionResult,
            isMultispectral: false,
          },
        ]);
        
        // Reset input area (so files disappear from input box)
        setSelectedFiles([]);
        setImagePreview("");
        setError("");
        setAnalysisLog([]);
        setPredictionResult(null);
        setCurrentStage('prediction');
        
        // Show notification (toast)
        toast({
          title: "Analysis complete!",
          description: "Your results are now available in the chat history.",
          variant: "default"
        });
      } else {
        throw new Error("Unsupported file type for analysis");
      }
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisLog(log => [...log, `Error: ${errorMessage}`]);
      
      // Handle specific error cases
      if (errorMessage.includes('File too large')) {
        errorMessage = 'File too large. Maximum size is 1GB. Please compress your data or use a smaller file.';
      } else if (errorMessage.includes('Missing required band')) {
        errorMessage = 'Missing required band files. Please ensure your zip file contains all required bands (B2, B4, B5, B6, B10) and the MTL metadata file.';
      }
      
      setError(errorMessage);
      toast({
        title: "Analysis Error",
        description: errorMessage || "Analysis failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentStage('prediction');
      setPredictionResult(null);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFiles([file]);
      setError("");
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedFiles([]);
    setImagePreview("");
    setProgress(0);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'moderate':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'severe':
        return 'bg-gray-200 text-gray-900 border-gray-400';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const sidebarItems = [
    { icon: Plus, label: " Analysis", active: true, href: "/upload" },
    { icon: HistoryIcon, label: "History", href: "/history" },
    { icon: Bot, label: "Chat", href: "/chat" },
    { icon: Search, label: "Discovery", href: "/discovery" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.clear();
    navigate("/login");
  };

  // When a new classification is made, clear the AI chat history
  useEffect(() => {
    if (analysisResult || multispectralResult) {
      setAiChatHistory([]);
    }
  }, [analysisResult, multispectralResult]);

  // Helper to get context string for LLM
  const getDiseaseContext = () => {
    if (analysisResult) {
      return `The last image was classified as ${analysisResult.disease} with ${analysisResult.confidence}% confidence. Severity: ${analysisResult.severity}. Crop: ${analysisResult.cropType}.`;
    }
    if (multispectralResult && 'disease' in multispectralResult && 'confidence' in multispectralResult) {
      return `The last multispectral analysis detected ${multispectralResult.disease} with ${multispectralResult.confidence}% confidence.`;
    }
    return '';
  };

  // Handle asking AI about a specific prediction
  const handleAskAIAboutPrediction = (disease: string, confidence: number, cropType: string) => {
    // Enable AI chat mode
    // setAiChatMode(true); // This state is removed
    
    // Set a contextual initial message
    const contextMessage = `I have a ${cropType} plant that was diagnosed with ${disease} (${confidence}% confidence). Can you help me understand this disease and provide treatment recommendations?`;
    
    // Add the context message to chat history
    setAiChatHistory([{ role: 'user', content: contextMessage }]);
    
    // Automatically send the message to get AI response
    handleAiSendWithMessage(contextMessage);
  };

  // Handle sending AI chat with a specific message
  const aiSendInProgress = useRef(false);
  async function handleAiSendWithMessage(message: string) {
    if (!message.trim() || aiLoading || aiSendInProgress.current) return;
    aiSendInProgress.current = true;
    setAiLoading(true);
    try {
      const context = getDiseaseContext();
      const aiResponse = await askAiChat(message, context, selectedModels);
      setAiChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setAiChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, the AI could not respond at this time.' }]);
    } finally {
      setAiLoading(false);
      aiSendInProgress.current = false;
    }
  }

  // Handle sending AI chat
  async function handleAiSend() {
    if (!aiChatInput.trim() || aiLoading || aiSendInProgress.current) return;
    aiSendInProgress.current = true;
    const userMessage = aiChatInput.trim();
    setAiLoading(true);
    setAiChatInput('');
    setAiChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    try {
      const context = getDiseaseContext();
      const aiResponse = await askAiChat(userMessage, context, selectedModels);
      setAiChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setAiChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, the AI could not respond at this time.' }]);
    } finally {
      setAiLoading(false);
      aiSendInProgress.current = false;
    }
  }

  const handleNavigateToResults = (result: any) => {
    localStorage.setItem('detectionResult', JSON.stringify(result));
    navigate('/results');
  };

  // Add handler to toggle multispectral mode
  const handleToggleMultiSpectralMode = () => {
    setMultiSpectralMode((prev) => !prev);
  };

  return (
    <SidebarLayout>
      {/* Main Content with fixed input at bottom */}
      <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
        {/* Header with Logo - only show if no result is displayed and AI chat is not active */}
        {!(analysisResult || multispectralResult) && (
          <div className="py-6 sm:py-8 flex justify-center lg:-ml-44 mt-12">
            <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
              PhamIQ
            </h1>
          </div>
        )}

        {/* Model Selection Dropdown - Top Right */}
        <div className="absolute top-4 right-4 z-40">
          <div className="relative">
            <button
              data-model-button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span>AI Models</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {modelDropdownOpen && (
              <div data-model-dropdown className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {["gpt-4o", "yi-large"].map((model) => (
                    <label key={model} className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => {
                          const newModels = selectedModels.includes(model)
                            ? selectedModels.filter(m => m !== model)
                            : [...selectedModels, model];
                          setSelectedModels(newModels);
                        }}
                        className="mr-3 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{model}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-200 px-4 py-2">
                  <button
                    onClick={() => setSelectedModels(["gpt-4o", "yi-large"])}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedModels([])}
                    className="text-xs text-gray-500 hover:text-gray-700 ml-4"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Error Display */}
          {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

        {/* Analysis Progress */}
        <AnalysisProgress
          isAnalyzing={isAnalyzing}
          progress={progress}
          analysisLog={analysisLog}
          currentStage={currentStage}
          predictionResult={predictionResult}
          error={error}
        />


        
        {/* Chat History */}
        <ChatHistory
          chatHistory={chatHistory}
          onNavigateToResults={handleNavigateToResults}
          getSeverityColor={getSeverityColor}
          predictionService={predictionService}
          onAskAI={handleAskAIAboutPrediction}
          aiChatHistory={aiChatHistory}
          aiChatInput={aiChatInput}
          onAiChatInputChange={aiLoading ? () => {} : setAiChatInput}
          onAiSend={aiLoading ? () => {} : handleAiSend}
          aiLoading={aiLoading}
          selectedModels={selectedModels}
        />

        {/* Upload Input */}
        <UploadInput
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClear={clearImage}
          onCameraCapture={handleCameraCapture}
          onSend={performAnalysis}
          isAnalyzing={isAnalyzing}
          multiSpectralMode={multiSpectralMode}
          onToggleMultiSpectralMode={handleToggleMultiSpectralMode}
        />

        {/* Hidden file inputs */}
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={handleZipSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraSelect}
            className="hidden"
          />
      </div>
    </SidebarLayout>
  );
};

export default UploadPage;
