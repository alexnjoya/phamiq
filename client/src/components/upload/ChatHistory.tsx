import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageCircle, Send } from "lucide-react";
import { DetectionResult } from '@/api/predictionService';
import { MultispectralDetectionResult } from '@/api/multispectralService';

type LimitedMultispectralResult = { limited: true; message: string; band_references: any; calibration_constants: any; general_metadata: any; rawMetadata: any };
type MultispectralResultUnion = MultispectralDetectionResult | LimitedMultispectralResult;

type ChatEntry = {
  userFile: File;
  userImagePreview: string;
  result: DetectionResult | MultispectralResultUnion;
  isMultispectral: boolean;
};

interface ChatHistoryProps {
  chatHistory: ChatEntry[];
  onNavigateToResults: (result: any) => void;
  getSeverityColor: (severity: string) => string;
  predictionService: any;
  onAskAI?: (disease: string, confidence: number, cropType: string) => void;
  aiChatHistory?: { role: 'user' | 'assistant'; content: string }[];
  aiChatInput?: string;
  onAiChatInputChange?: (value: string) => void;
  onAiSend?: () => void;
  aiLoading?: boolean;
  selectedModels?: string[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  onNavigateToResults,
  getSeverityColor,
  predictionService,
  onAskAI,
  aiChatHistory = [],
  aiChatInput = "",
  onAiChatInputChange,
  onAiSend,
  aiLoading = false,
  selectedModels = [],
}) => {
  const [expandedChats, setExpandedChats] = useState<Set<number>>(new Set());

  const toggleChat = (index: number) => {
    const newExpanded = new Set(expandedChats);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChats(newExpanded);
  };

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl mx-auto lg:-ml-8 xl:-ml-12 pb-44 pt-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Hide scrollbar for Webkit browsers */}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none !important; }`}</style>
      {/* Render chat history */}
      {chatHistory.map((entry, idx) => (
        <div key={idx} className="space-y-2 mb-8 flex flex-col w-full px-2 sm:px-4 md:px-6">
          <div className="mx-auto w-full bg-gray-100 text-gray-900 rounded-2xl p-4 sm:p-6 mb-2 shadow-none">
            {/* User's uploaded image preview as a chat bubble */}
            {entry.userImagePreview && (
              <img
                src={entry.userImagePreview}
                alt="Uploaded thumbnail"
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 mb-2"
              />
            )}
            <span className="text-xs text-gray-500">You uploaded: {entry.userFile?.name}</span>
          </div>
          <div className="mx-auto w-full bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-none border border-gray-100">
            {/* The result as a chat bubble */}
            {/* Render result based on type */}
            {('disease' in entry.result) ? (
              <>
                {/* Disease detection result */}
                <div className="flex flex-col lg:flex-row items-start gap-6 mb-6">
                  <img
                    src={entry.result.imageUrl}
                    alt="Analyzed crop"
                    className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                        {entry.result.disease}
                      </h2>
                      <Badge className={getSeverityColor(entry.result.severity)}>
                        {entry.result.severity}
                      </Badge>
                      {entry.isMultispectral && (
                        <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                          Multi-spectral
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm lg:text-base text-gray-600 mb-4">
                      Detected in {entry.result.cropType} with {entry.result.confidence}% confidence
                    </p>
                    
                    {/* Disease Overview */}
                    {entry.result.recommendations?.disease_overview && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Disease Overview</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {entry.result.recommendations.disease_overview}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">High accuracy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <span className="text-sm text-gray-600">AI verified</span>
                      </div>
                      {entry.isMultispectral && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                          <span className="text-sm text-gray-600">Enhanced analysis</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Ask AI Button - prominently displayed */}
                {onAskAI && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Need help with this disease?</h3>
                        <p className="text-sm text-gray-700">Ask our AI assistant for personalized advice</p>
                      </div>
                      <Button
                        onClick={() => {
                          if ('disease' in entry.result) {
                            onAskAI(entry.result.disease, entry.result.confidence, entry.result.cropType);
                            toggleChat(idx);
                          }
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Ask AI
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* AI Chat Section - Integrated directly below the prediction */}
                {expandedChats.has(idx) && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    {/* AI Chat Header */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">AI Assistant</h4>
                          <p className="text-xs text-gray-700">Ask questions about {entry.result.disease}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide bg-gray-50 rounded-lg p-3 border border-gray-200" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {aiChatHistory.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <Bot className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs mb-3">Ask me about {entry.result.disease}</p>
                          
                          {/* Suggested Questions */}
                          <div className="space-y-2">
                            <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {[
                                "How do I treat this?",
                                "What causes this?",
                                "How to prevent it?",
                                "Is it contagious?",
                                "What are symptoms?"
                              ].map((question, qIdx) => (
                                <button
                                  key={qIdx}
                                  onClick={() => {
                                    if (onAiChatInputChange && onAiSend) {
                                      onAiChatInputChange(question);
                                      onAiSend();
                                    }
                                  }}
                                  className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-full transition-colors border border-gray-200"
                                >
                                  {question}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {aiChatHistory.map((msg, msgIdx) => (
                        <div key={msgIdx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
                          <div className={`text-xs max-w-[80%] whitespace-pre-line p-2 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-gray-200 text-gray-900 border border-gray-300' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}> 
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="flex justify-start">
                          <div className="text-xs text-gray-900 animate-pulse bg-gray-100 p-2 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* AI Chat Input */}
                    {onAiChatInputChange && onAiSend && (
                      <div className="mt-3 flex justify-center">
                        <div className="flex items-center gap-2 max-w-md w-full">
                          <input
                            type="text"
                            className="flex-1 text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Ask about this disease..."
                            value={aiChatInput}
                            onChange={e => onAiChatInputChange(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && aiChatInput.trim() && !aiLoading) {
                                e.preventDefault();
                                onAiSend();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                            disabled={!aiChatInput.trim() || aiLoading}
                            onClick={onAiSend}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Treatment Information and rest of the content */}
                {(() => {
                  const recommendations = 'recommendations' in entry.result ? entry.result.recommendations : undefined;
                  
                  if (recommendations) {
                    return (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Recommendations</h3>
                        
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
                              {recommendations.immediate_actions?.split('\n').map((action: string, index: number) => (
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
                              {recommendations.treatment_protocols?.organic && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-800 mb-1">Organic Methods</h5>
                                  <div className="text-sm text-gray-700 space-y-1">
                                    {recommendations.treatment_protocols.organic.split('\n').map((method: string, index: number) => (
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
                              {recommendations.treatment_protocols?.chemical && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-800 mb-1">Chemical Options</h5>
                                  <div className="text-sm text-gray-700 space-y-1">
                                    {recommendations.treatment_protocols.chemical.split('\n').map((method: string, index: number) => (
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
                              {recommendations.prevention?.split('\n').map((prevention: string, index: number) => (
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
                              {recommendations.monitoring?.split('\n').map((monitor: string, index: number) => (
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
                          {recommendations.cost_effective && (
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
                                {recommendations.cost_effective.split('\n').map((solution: string, index: number) => (
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
                          
                          {recommendations.professional_help && (
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
                                  {recommendations.professional_help}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          AI-generated recommendations are not available. Please ensure the AlleAI API is properly configured.
                        </p>
                      </div>
                    );
                  }
                })()}
                {/* View Detailed Results Button */}
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => onNavigateToResults(entry.result)}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    View Detailed Results
                  </Button>
                </div>
              </>
            ) : (
              // Multispectral result (full or limited)
              <>
                {('limited' in entry.result) ? (
                  // Limited multispectral result (metadata only)
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                        Multi-spectral
                      </Badge>
                      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Limited Analysis
                      </Badge>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-medium text-yellow-900 mb-2">Analysis Status</h3>
                      <p className="text-sm text-yellow-800 mb-3">{entry.result.message}</p>
                      <div className="text-xs text-yellow-700 space-y-1">
                        <p>• Only metadata was extracted from the MTL file</p>
                        <p>• For full analysis, ensure all band files (.TIF) are in the same folder</p>
                        <p>• Required bands: B2, B4, B5, B6, B10</p>
                      </div>
                    </div>
                    {entry.result.band_references && Object.keys(entry.result.band_references).length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Band References</h3>
                        <div className="text-xs text-blue-800 space-y-1">
                          {Object.entries(entry.result.band_references).slice(0, 5).map(([key, value]) => (
                            <p key={key}>• {key}: {String(value)}</p>
                          ))}
                          {Object.keys(entry.result.band_references).length > 5 && (
                            <p>• ... and {Object.keys(entry.result.band_references).length - 5} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Full multispectral result
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                        Multi-spectral
                      </Badge>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Full Analysis
                      </Badge>
                    </div>
                    
                    {/* Best Crop Prediction */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-900 mb-2">Recommended Crop</h3>
                      <p className="text-lg font-semibold text-green-800">{entry.result.bestCrop}</p>
                    </div>

                    {/* Prediction Text */}
                    {entry.result.prediction && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Analysis Summary</h3>
                        <div className="text-sm text-blue-800 whitespace-pre-line">
                          {entry.result.prediction}
                        </div>
                      </div>
                    )}

                    {/* Crop Suitability Statistics */}
                    {entry.result.cropSuitabilityStats && entry.result.cropSuitabilityStats.length > 0 && (
                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                        <h3 className="font-medium text-teal-900 mb-2">Crop Suitability Scores</h3>
                        <div className="space-y-2">
                          {entry.result.cropSuitabilityStats.map((crop, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm text-teal-800">{crop.crop}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-teal-200 rounded-full h-2">
                                  <div 
                                    className="bg-teal-600 h-2 rounded-full" 
                                    style={{ width: `${crop.mean * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-teal-700">{Math.round(crop.mean * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Environmental Statistics */}
                    {entry.result.environmentalStats && entry.result.environmentalStats.length > 0 && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-medium text-purple-900 mb-2">Environmental Indices</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {entry.result.environmentalStats.slice(0, 6).map((stat, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-purple-800">{stat.name}:</span>
                              <span className="text-purple-700">{stat.mean.toFixed(3)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analysis Summary */}
                    {entry.result.analysisSummary && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Analysis Summary</h3>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• Total pixels analyzed: {entry.result.analysisSummary.totalPixels.toLocaleString()}</p>
                          <p>• Valid pixels: {entry.result.analysisSummary.validPixels.toLocaleString()}</p>
                          <p>• Bands processed: {entry.result.analysisSummary.bandsProcessed.join(', ')}</p>
                        </div>
                      </div>
                    )}

                    {/* View Detailed Results Button */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => onNavigateToResults(entry.result)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        View Detailed Results
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory; 