import React, { useState, useRef } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { UploadCloud, FileText, Info, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { generateTitle, generateDescription, generateImage } from '../api/aiService';
import { discoveryService } from '../api/discoveryService';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../lib/utils';

const CreateDiscovery: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI modal states
  const [aiModal, setAiModal] = useState<'title' | 'description' | 'image' | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiImageUrl, setAiImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const modelOptions = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'yi-large', label: 'Yi-Large' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'dall-e-3', label: 'DALL-E 3 (image)' },
    { value: 'grok-2-image', label: 'Grok-2 Image (image)' },
  ];

  const [selectedPredictionModel, setSelectedPredictionModel] = useState('gpt-4o');
  const predictionModelOptions = [
    { value: 'gpt-4o', label: 'GPT-4o (Prediction)' },
    { value: 'yi-large', label: 'Yi-Large (Prediction)' },
    { value: 'gpt-4', label: 'GPT-4 (Prediction)' },
  ];

  const [category, setCategory] = useState('research');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const navigate = useNavigate();

  const categoryOptions = [
    { value: 'research', label: 'Research' },
    { value: 'community', label: 'Community' },
    { value: 'education', label: 'Education' },
    { value: 'tips', label: 'Tips' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await discoveryService.createInsight({
        title,
        description,
        category,
        author,
        image_url: filePreview || aiImageUrl || '',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
    setTitle('');
    setDescription('');
    setFile(null);
    setFileName('');
    setFilePreview(null);
      setAuthor('');
      setTags('');
      navigate('/discovery');
    } catch (err) {
      alert('Failed to create discovery');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target?.result as string);
        reader.readAsDataURL(droppedFile);
      } else {
        setFilePreview(null);
      }
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  // Placeholder AI generation handler
  const handleAIGenerate = async () => {
    setLoading(true);
    try {
      if (aiModal === 'title') {
        const result = await generateTitle(aiPrompt, selectedModel);
        setTitle(result);
        setAiResult(result);
      } else if (aiModal === 'description') {
        const result = await generateDescription(aiPrompt, selectedModel);
        setDescription(result);
        setAiResult(result);
      } else if (aiModal === 'image') {
        const url = await generateImage(aiPrompt, selectedModel);
        console.log('AI Image URL returned from backend:', url); // Debug log
        console.log('URL type:', typeof url);
        console.log('URL starts with /ai/proxy-image?', url?.startsWith('/ai/proxy-image?'));
        setAiImageUrl(url); // This should be the proxy URL from backend
      }
    } catch (err) {
      setAiResult('Error generating with AI');
      }
      setLoading(false);
  };

  const closeModal = () => {
    setAiModal(null);
    setAiPrompt('');
    setAiResult('');
    setAiImageUrl('');
    setLoading(false);
  };

  return (
    <SidebarLayout >
      <div className="flex justify-center  items-center bg-gradient-to-br from-gray-50 to-white py-12 px-2">
        <div className="w-full max-w-lg bg-white/90 rounded-2xl p-8 border border-gray-100 relative flex flex-col items-center justify-center mt-180px ">
          <div className="flex items-center gap-3 mb-6">
            <UploadCloud className="w-8 h-8 text-teal-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Discovery</h1>
          </div>
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            {/* Title Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 font-semibold" htmlFor="discovery-title">
                  Title <span className="text-teal-600">*</span>
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1 rounded transition"
                  onClick={() => { setAiModal('title'); setAiPrompt(''); setAiResult(''); }}
                  title="Generate Title with AI"
                >
                  <Sparkles className="w-4 h-4" /> Generate with AI
                </button>
              </div>
              <div className="relative">
                <input
                  id="discovery-title"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                  placeholder="e.g. Maize Disease Outbreak in North Region"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
                <FileText className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> Keep it concise and descriptive.</p>
            </div>
            {/* Description Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 font-semibold" htmlFor="discovery-description">
                  Description <span className="text-teal-600">*</span>
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1 rounded transition"
                  onClick={() => { setAiModal('description'); setAiPrompt(''); setAiResult(''); }}
                  title="Generate Description with AI"
                >
                  <Sparkles className="w-4 h-4" /> Generate with AI
                </button>
              </div>
              <textarea
                id="discovery-description"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition placeholder-gray-400 text-gray-900 bg-gray-50 resize-none"
                placeholder="Describe the discovery, context, and any relevant details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> Provide enough detail for others to understand the discovery.</p>
            </div>
            {/* Category Dropdown */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category <span className="text-teal-600">*</span></label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition text-gray-900 bg-gray-50"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* Author Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Author <span className="text-teal-600">*</span></label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                placeholder="Your name or organization"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
              />
            </div>
            {/* Tags Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tags <span className="text-gray-400 font-normal">(comma separated, optional)</span></label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                placeholder="e.g. maize, disease, prevention"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
            {/* Image/File Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 font-semibold">Attach Image/File <span className="text-gray-400 font-normal">(optional)</span></label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1 rounded transition"
                  onClick={() => { setAiModal('image'); setAiPrompt(''); setAiImageUrl(''); }}
                  title="Generate Image with AI"
                >
                  <Sparkles className="w-4 h-4" /> Generate Image with AI
                </button>
              </div>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-teal-300 bg-teal-50 hover:bg-teal-100 transition rounded-xl py-8 cursor-pointer relative group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <UploadCloud className="w-10 h-10 text-teal-400 mb-2 group-hover:text-teal-600 transition" />
                <span className="text-teal-700 font-medium">Click or drag & drop to upload</span>
                <span className="text-xs text-gray-500 mt-1">Accepted: PDF, DOCX, JPG, PNG, etc.</span>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {(filePreview || aiImageUrl) && (
                  <>
                  <img
                      src={getImageUrl(filePreview || aiImageUrl)}
                    alt="Preview"
                    className="rounded-lg shadow max-h-40 object-contain border border-gray-200 mt-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                        // Show URL when image fails to load
                        const urlDisplay = document.getElementById('image-url-display');
                        if (urlDisplay) {
                          urlDisplay.style.display = 'block';
                          urlDisplay.innerHTML = `Failed to load image. URL: ${getImageUrl(filePreview || aiImageUrl)}`;
                        }
                      }}
                    />
                    <div id="image-url-display" className="mt-2 text-xs text-gray-500 break-all">
                      Image URL: {getImageUrl(filePreview || aiImageUrl)}
                    </div>
                  </>
                )}
              </label>
              {fileName && (
                <div className="mt-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-teal-400" />
                  <span className="text-sm text-gray-700 truncate max-w-[180px]">{fileName}</span>
                </div>
              )}
            </div>
            {/* AI Model Selector */}
            {/* Removed AI Model(s) selector from main form */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold text-lg shadow-md hover:from-teal-700 hover:to-teal-600 transition focus:ring-2 focus:ring-teal-300"
            >
              Create Discovery
            </button>
          </form>
          {/* AI Modal */}
          {aiModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fade-in">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-teal-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {aiModal === 'title' && 'AI Title Generator'}
                    {aiModal === 'description' && 'AI Description Generator'}
                    {aiModal === 'image' && 'AI Image Generator'}
                  </h2>
                </div>
                {/* AI Model(s) Selector inside modal */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">AI Model</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition text-gray-900 bg-gray-50"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                  >
                    {modelOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <label className="block text-gray-700 font-medium mb-2">Describe what you want the AI to generate:</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded mb-4 focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition"
                  placeholder={aiModal === 'image' ? 'e.g. A healthy maize field at sunrise' : 'e.g. Maize disease outbreak in North Region'}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="w-full py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 transition mb-2 disabled:opacity-60"
                  onClick={handleAIGenerate}
                  disabled={loading || !aiPrompt}
                  type="button"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
                {/* Show AI result for title/description */}
                {aiResult && (aiModal !== 'image') && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded text-gray-700">
                    <span className="font-medium">AI Suggestion:</span> {aiResult}
                  </div>
                )}
                {/* Show AI image preview */}
                {aiImageUrl && aiModal === 'image' && (
                  <div className="mt-3 flex flex-col items-center">
                    <img
                      src={getImageUrl(aiImageUrl)}
                      alt="AI Generated"
                      className="rounded-lg shadow max-h-48 object-contain border border-gray-200"
                      onError={e => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">AI Generated Image Preview</span>
                    <div className="mt-2 text-xs text-gray-500 break-all max-w-full">
                      Image URL: {getImageUrl(aiImageUrl)}
                    </div>
                  </div>
                )}
                {/* Accept AI result button */}
                {(aiResult || aiImageUrl) && (
                  <button
                    className="w-full mt-4 py-2 rounded bg-teal-500 text-white font-semibold hover:bg-teal-600 transition"
                    onClick={() => {
                      if (aiModal === 'title') setTitle(aiResult);
                      if (aiModal === 'description') setDescription(aiResult);
                      if (aiModal === 'image') {
                        setFilePreview(aiImageUrl); // Set the AI image as the preview
                        setFile(null);             // Clear any uploaded file
                        setFileName('');           // Clear the file name
                      }
                      closeModal();
                    }}
                    type="button"
                  >
                    Use This
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CreateDiscovery; 