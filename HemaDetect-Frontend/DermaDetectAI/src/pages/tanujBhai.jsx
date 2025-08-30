
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileImage, ZoomIn, ZoomOut, RotateCcw, AlertCircle, Upload, Shield, Activity, Brain, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";


export default function TanujBhai() {
  const [confidence, setConfidence] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState(null);

  // Backend response states
  const [predictions, setPredictions] = useState([0, 0, 0, 0]);
  const [predictedClass, setPredictedClass] = useState(null);
  const [predictedClassName, setPredictedClassName] = useState("");
  const [gradCam, setGradCam] = useState(null);
  const [segmentationMask, setSegmentationMask] = useState(null);

  // Class names that match your backend
  const classNames = ['EarlyPreB', 'PreB', 'ProB', 'Benign'];

  // Enable analyze button if file selected
  useEffect(() => {
    setIsFormValid(!!selectedFile);
  }, [selectedFile]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setSelectedFile(file);
      setPreviewSrc(URL.createObjectURL(file));
      setError(null);
      // Reset all results
      setSegmentationMask(null);
      setGradCam(null);
      setPredictions([0, 0, 0, 0]);
      setPredictedClass(null);
      setPredictedClassName("");
      setConfidence(null);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      setError("Please select an image file before analyzing");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      console.log("Sending request to backend...");
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        { 
          headers: { 
            "Content-Type": "multipart/form-data"
          },
          timeout: 300000, // 5 minutes timeout
          withCredentials: false
        }
      );
      
      console.log("Response received:", response.data);
      
      if (response.data) {
        // Handle all backend response fields
        if (Array.isArray(response.data.predictions)) {
          setPredictions(response.data.predictions);
        }
        
        if (typeof response.data.predicted_class === 'number') {
          setPredictedClass(response.data.predicted_class);
        }
        
        if (response.data.predicted_class_name) {
          setPredictedClassName(response.data.predicted_class_name);
        }
        
        if (typeof response.data.confidence === 'number') {
          setConfidence(response.data.confidence);
        }
        
        if (response.data.gradcam) {
          setGradCam(`data:image/png;base64,${response.data.gradcam}`);
        }
        
        if (response.data.segmented) {
          setSegmentationMask(`data:image/png;base64,${response.data.segmented}`);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      
      if (error.code === 'ECONNABORTED') {
        setError("Request timed out. The image processing is taking too long. Please try with a smaller image.");
      } else if (error.response) {
        // Server responded with error status
        setError(`Server error (${error.response.status}): ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        // Request was made but no response received
        setError("Cannot connect to backend server. Please ensure your Flask app is running on http://127.0.0.1:5000 and CORS is enabled.");
      } else {
        // Something else happened
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Helper for chart data
  const getChartData = () =>
    predictions.map((val, idx) => ({
      name: classNames[idx],
      value: Math.round(val * 100),
      highlight: idx === predictedClass,
    }));
    
  const getBarColor = (entry) =>
    entry.highlight ? '#6366f1' : '#c7d2fe';

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 py-4 px-6 mb-6">
        <a href="/" className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">HemaDetect AI</h1>
          </div>
        </a>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Dermoscopic Image</h2>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                <label
                  htmlFor="fileUpload"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition duration-150"
                >
                  <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <FileImage className="h-10 w-10 text-gray-400 mb-2" />
                  <div className="text-center">
                    <span className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700 transition duration-150">
                      Choose file
                    </span>
                    <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Supported formats: JPG, PNG, JPEG (max. 10MB)
                  </p>
                </label>
                
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected file: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium ${
                    !isFormValid || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  } transition duration-150`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Image Preview</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleZoomIn}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-150"
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleZoomOut}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-150"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleResetZoom}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-150"
                  >
                    <RotateCcw className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden p-4 flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-500">Analyzing image...</p>
                  </div>
                ) : previewSrc ? (
                  <div className="overflow-hidden flex justify-center items-center bg-gray-100" style={{ maxHeight: '400px', height: '400px' }}>
                    <img
                      src={previewSrc}
                      alt="Dermoscopic preview"
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <FileImage className="h-16 w-16 mb-2" />
                    <p>No image selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Diagnostic Results</h2>
              </div>

              {/* Prediction Summary */}
              {predictedClassName && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    <h3 className="text-sm font-medium text-red-800">Predicted Classification</h3>
                  </div>
                  <p className="text-xl font-bold text-red-900">{predictedClassName}</p>
                  {confidence !== null && (
                    <p className="text-sm text-red-700 mt-1">
                      Confidence: <span className="font-semibold">{(confidence * 100).toFixed(2)}%</span>
                    </p>
                  )}
                </div>
              )}

              {/* Probability Distribution */}
              {predictions.some(p => p > 0) && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <h3 className="text-sm font-medium text-gray-700">Probability Distribution</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getChartData()}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]} 
                          tick={{ fontSize: 12 }} 
                          unit="%" 
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          tick={{ fontSize: 12 }} 
                          width={100} 
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Probability']}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {getChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Grad-CAM++ Visualization */}
              {gradCam && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Grad-CAM++ Attention Map</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-center mb-3">
                      <img
                        src={gradCam}
                        alt="Grad-CAM++ heatmap"
                        className="max-w-full border border-gray-200 rounded shadow-sm"
                        style={{ maxHeight: 250 }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-center">
                      🧠 Areas highlighted in <span className="text-red-500 font-medium">red/yellow</span> indicate regions the AI model focused on for making its prediction
                    </p>
                  </div>
                </div>
              )}

              {/* Segmentation Mask */}
              {segmentationMask && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Lesion Segmentation</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-center mb-3">
                      <img
                        src={segmentationMask}
                        alt="Lesion segmentation"
                        className="max-w-full border border-gray-200 rounded shadow-sm"
                        style={{ maxHeight: 250 }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-center">
                      🔍 Automated segmentation showing identified lesion boundaries and characteristics
                    </p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!predictedClassName && !gradCam && !segmentationMask && (
                <div className="text-center py-8">
                  <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Upload and analyze an image to see results here</p>
                </div>
              )}

              {/* Medical Disclaimer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-xs text-gray-500 gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <p className="text-center">
                    <span className="font-medium">Medical Disclaimer:</span> This is an AI-assisted tool for educational purposes. 
                    Always consult with a qualified healthcare professional for medical diagnosis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          Dermatological Diagnostic Assistant &copy; 2025 | For educational purposes only
        </div>
      </footer>
    </div>
  );
}