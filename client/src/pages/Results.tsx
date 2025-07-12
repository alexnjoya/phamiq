import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Bot,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Shield,
  Zap,
  Download,
  Share,
  Copy,
} from "lucide-react";
import SidebarLayout from '../components/SidebarLayout';
import { getImageUrl } from '../lib/utils';

interface TreatmentProtocols {
  organic: string;
  chemical: string;
  application: string;
}

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: string;
  cropType: string;
  imageUrl: string;
  recommendations?: {
    disease_overview: string;
    immediate_actions: string;
    treatment_protocols: TreatmentProtocols;
    prevention: string;
    monitoring: string;
    cost_effective: string;
    severity_level: string;
    professional_help: string;
  };
  llm_available?: boolean;
}

// Add type guards
function isMultispectralResult(res: any): boolean {
  return res && (res.analysis_type === 'multispectral' || res.bestCrop || res.environmentalStats);
}
function isLimitedMultispectralResult(res: any): boolean {
  return res && res.limited === true;
}

const Results = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const navigate = useNavigate();
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("detectionResult");
    if (storedResult) {
      const parsedResult = JSON.parse(storedResult);
      console.log('Retrieved detection result:', parsedResult);
      console.log('LLM available:', parsedResult.llm_available);
      console.log('Recommendations:', parsedResult.recommendations);
      
      // If this is a history item without recommendations, regenerate them
      if (parsedResult.llm_available && !parsedResult.recommendations && !parsedResult.analysis_type) {
        console.log('Regenerating LLM recommendations for history item');
        regenerateRecommendations(parsedResult);
      } else {
        console.log('Using cached recommendations or no regeneration needed');
        setResult(parsedResult);
      }
    } else {
      navigate("/upload");
    }
  }, [navigate]);

  const regenerateRecommendations = async (detectionResult: any) => {
    try {
      // Import the prediction service
      const { predictionService } = await import('@/api/predictionService');
      
      // Create a mock prediction response to get LLM recommendations
      const mockPrediction = {
        status: "success",
        predictions: [{
          class: detectionResult.disease,
          confidence: detectionResult.confidence / 100,
          confidence_percentage: `${detectionResult.confidence}%`
        }],
        total_classes: 0,
        llm_available: true
      };
      
      // Get LLM recommendations using the disease name and confidence
      const recommendations = await predictionService.getDiseaseRecommendations(
        detectionResult.disease,
        detectionResult.confidence / 100,
        detectionResult.cropType
      );
      
      // Update the result with the new recommendations
      const updatedResult = {
        ...detectionResult,
        recommendations: recommendations
      };
      
      console.log('Regenerated recommendations:', recommendations);
      setResult(updatedResult);
      
      // Update localStorage with the new data
      localStorage.setItem("detectionResult", JSON.stringify(updatedResult));
      
    } catch (error) {
      console.error('Failed to regenerate recommendations:', error);
      // Set the result anyway, just without recommendations
      setResult(detectionResult);
    }
  };

  if (!result) {
    return <div>Loading...</div>;
  }

  if (isMultispectralResult(result) || isLimitedMultispectralResult(result)) {
    // Multispectral result rendering (clean, no image, no confidence, no treatment)
    const msResult = result as any;
    return (
      <SidebarLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link to="/upload">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Multispectral Analysis Results</h1>
                    <p className="text-xs text-gray-500">AI-powered multispectral crop analysis</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2">Multispectral</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-purple-800 mb-2">Multispectral Analysis Summary</h2>
                {isLimitedMultispectralResult(result) ? (
                  <div>
                    <p className="text-yellow-800 mb-3">{msResult.message}</p>
                    {/* Show metadata if available */}
                    {msResult.metadata && (
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-700 mb-1">Metadata</h3>
                        <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(msResult.metadata, null, 2)}</pre>
                      </div>
                    )}
                    {msResult.rawMetadata && (
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-700 mb-1">Raw Metadata</h3>
                        <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(msResult.rawMetadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 mb-2">
                      {msResult.bestCrop && (
                        <div>
                          <span className="font-semibold text-gray-700">Best Crop:</span> {msResult.bestCrop}
                        </div>
                      )}
                      {msResult.prediction && (
                        <div>
                          <span className="font-semibold text-gray-700">Prediction:</span> {msResult.prediction}
                        </div>
                      )}
                    </div>
                    {msResult.environmentalStats && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Environmental Statistics</h3>
                        <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(msResult.environmentalStats, null, 2)}</pre>
                      </div>
                    )}
                    {msResult.cropSuitabilityStats && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Crop Suitability Statistics</h3>
                        <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(msResult.cropSuitabilityStats, null, 2)}</pre>
                      </div>
                    )}
                    {msResult.analysisSummary && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Analysis Summary</h3>
                        <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(msResult.analysisSummary, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </SidebarLayout>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-green-100 text-green-700 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "severe":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Download report as JSON
  const handleDownloadReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `analysis_report_${result.disease.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Share results using Web Share API or fallback to copy
  const handleShareResults = async () => {
    const shareText = `Crop Disease Analysis Result\n\nDisease: ${result.disease}\nCrop: ${result.cropType}\nSeverity: ${result.severity}\nConfidence: ${result.confidence}%\n\nTreatment: ${result.recommendations?.disease_overview || 'N/A'}\nPrevention: ${result.recommendations?.prevention || 'N/A'}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Analysis Result: ${result.disease}`,
          text: shareText,
          url: window.location.href
        });
        setShareSuccess("Results shared successfully!");
        setTimeout(() => setShareSuccess(null), 2000);
      } catch (err) {
        setShareSuccess("Share cancelled or failed.");
        setTimeout(() => setShareSuccess(null), 2000);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess("Results copied to clipboard!");
        setTimeout(() => setShareSuccess(null), 2000);
      } catch (err) {
        setShareSuccess("Failed to copy results.");
        setTimeout(() => setShareSuccess(null), 2000);
      }
    }
  };

  // Helper to safely get recommendations
  const rec = result.recommendations;

  // Disease Overview
  const diseaseOverview = rec?.disease_overview || "This disease affects crop health and can impact yield. Early detection and proper management are crucial.";

  // Immediate Actions
  const immediateActions = rec?.immediate_actions
    ? rec.immediate_actions.split(/[.;]\s+/).filter(Boolean)
    : [];

  // Treatment Protocols
  const treatmentProtocols = rec?.treatment_protocols || { organic: '', chemical: '', application: '' };
  const treatmentSteps = [
    treatmentProtocols.organic && `Organic: ${treatmentProtocols.organic}`,
    treatmentProtocols.chemical && `Chemical: ${treatmentProtocols.chemical}`,
    treatmentProtocols.application && `Application: ${treatmentProtocols.application}`,
  ].filter(Boolean);

  // Prevention
  const preventionTips = rec?.prevention
    ? rec.prevention.split(/[.;]\s+/).filter(Boolean)
    : [];

  // Monitoring
  const monitoringTips = rec?.monitoring
    ? rec.monitoring.split(/[.;]\s+/).filter(Boolean)
    : [];

  // Cost-effective
  const costEffectiveTips = rec?.cost_effective
    ? rec.cost_effective.split(/[.;]\s+/).filter(Boolean)
    : [];

  // Professional Help
  const professionalHelp = rec?.professional_help || '';

  // Severity Level
  const severityLevel = rec?.severity_level || result.severity;

  // Update getTreatmentData to use new structure
  const getTreatmentData = () => {
    if (rec) {
      return [
        {
          icon: Shield,
          title: "Immediate Actions",
          color: "bg-blue-50",
          steps: immediateActions,
          llmGenerated: true
        },
        {
          icon: Zap,
          title: "Treatment Protocols",
          color: "bg-yellow-50",
          steps: treatmentSteps,
          llmGenerated: true
        },
        {
          icon: Lightbulb,
          title: "Prevention",
          color: "bg-green-50",
          steps: preventionTips,
          llmGenerated: true
        },
        {
          icon: Info,
          title: "Monitoring",
          color: "bg-purple-50",
          steps: monitoringTips,
          llmGenerated: true
        },
        {
          icon: CheckCircle,
          title: "Cost-Effective Solutions",
          color: "bg-teal-50",
          steps: costEffectiveTips,
          llmGenerated: true
        },
        {
          icon: AlertTriangle,
          title: "Professional Help",
          color: "bg-red-50",
          steps: professionalHelp ? [professionalHelp] : [],
          llmGenerated: true
        },
      ];
    }
    // Fallback to empty
    return [];
  };

  const treatments = getTreatmentData();

  return (
    <SidebarLayout>
      {/* Main Content */}
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/upload">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analysis Results</h1>
                  <p className="text-xs text-gray-500">AI-powered crop disease diagnosis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Disease Detection Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getImageUrl(result.imageUrl)}
                      alt="Analyzed crop"
                      className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-xl border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 shadow-sm">
                      {result.cropType}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 break-words">
                        {result.disease}
                      </h2>
                      <Badge className={`px-3 py-1 text-sm font-medium ${getSeverityColor(result.severity)}`}>
                        {result.severity}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className="font-semibold text-green-700">{result.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>High accuracy</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>AI verified</span>
                        </div>
                        {result.llm_available && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>LLM enhanced</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disease Information */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                  About This Disease
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 text-sm leading-relaxed">
                    {diseaseOverview}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-semibold text-red-600">{severityLevel}</div>
                    <div className="text-sm text-gray-600">Severity Level</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-semibold text-yellow-600">{preventionTips.length}</div>
                    <div className="text-sm text-gray-600">Prevention Tips</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-semibold text-green-600">{treatmentSteps.length}</div>
                    <div className="text-sm text-gray-600">Treatment Steps</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Recommendations */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  Treatment Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {rec ? (
                  <div className="space-y-4">
                    {/* Professional horizontal layout */}
                    <div className="space-y-4">
                      {/* Immediate Actions */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Immediate Action</h4>
                            <p className="text-sm text-gray-600">Take these steps right away to control the disease</p>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {rec.immediate_actions?.split('\n').map((action: string, index: number) => (
                            action.trim() && (
                              <div key={index} className="flex items-start">
                                <span className="text-gray-500 mr-2 mt-1">•</span>
                                <span className="text-sm text-gray-700">{action.trim()}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Treatment Options */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Treatment Options</h4>
                            <p className="text-sm text-gray-600">Choose between organic and chemical treatments</p>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-3">
                          {rec.treatment_protocols?.organic && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-800 mb-1">Organic Methods</h5>
                              <div className="text-sm text-gray-700 space-y-1">
                                {rec.treatment_protocols.organic.split('\n').map((method: string, index: number) => (
                                  method.trim() && (
                                    <div key={index} className="flex items-start">
                                      <span className="text-gray-500 mr-2 mt-1">•</span>
                                      <span>{method.trim()}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          {rec.treatment_protocols?.chemical && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-800 mb-1">Chemical Options</h5>
                              <div className="text-sm text-gray-700 space-y-1">
                                {rec.treatment_protocols.chemical.split('\n').map((method: string, index: number) => (
                                  method.trim() && (
                                    <div key={index} className="flex items-start">
                                      <span className="text-gray-500 mr-2 mt-1">•</span>
                                      <span>{method.trim()}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prevention */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Prevention</h4>
                            <p className="text-sm text-gray-600">Long-term strategies to prevent future outbreaks</p>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {rec.prevention?.split('\n').map((prevention: string, index: number) => (
                            prevention.trim() && (
                              <div key={index} className="flex items-start">
                                <span className="text-gray-500 mr-2 mt-1">•</span>
                                <span className="text-sm text-gray-700">{prevention.trim()}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Monitoring */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Monitoring</h4>
                            <p className="text-sm text-gray-600">Track progress and effectiveness of treatments</p>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {rec.monitoring?.split('\n').map((monitor: string, index: number) => (
                            monitor.trim() && (
                              <div key={index} className="flex items-start">
                                <span className="text-gray-500 mr-2 mt-1">•</span>
                                <span className="text-sm text-gray-700">{monitor.trim()}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Additional Information */}
                      {rec.cost_effective && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Cost-Effective Solutions</h4>
                              <p className="text-sm text-gray-600">Budget-friendly treatment options</p>
                            </div>
                            <div className="text-right">
                              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            {rec.cost_effective.split('\n').map((solution: string, index: number) => (
                              solution.trim() && (
                                <div key={index} className="flex items-start">
                                  <span className="text-gray-500 mr-2 mt-1">•</span>
                                  <span className="text-sm text-gray-700">{solution.trim()}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {rec.professional_help && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">When to Seek Help</h4>
                              <p className="text-sm text-gray-600">Professional consultation guidance</p>
                            </div>
                            <div className="text-right">
                              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-sm text-gray-700">
                              {rec.professional_help}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No treatment recommendations available.</p>
                  </div>
                )}
                
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Important Notice</p>
                      <p className="text-gray-700 text-sm mt-1">
                        Consult with a local agricultural extension officer for region-specific treatment recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Button onClick={() => navigate('/upload')} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                  Analyze Another Image
                </Button>
                <Button onClick={handleDownloadReport} variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={handleShareResults} variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
                {shareSuccess && (
                  <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {shareSuccess}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prevention Tips */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Prevention Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {preventionTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="inline-block w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </span>
                      <span className="text-sm text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
};

export default Results;
