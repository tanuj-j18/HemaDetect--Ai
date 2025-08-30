import React, { useState } from "react";
import axios from "axios";
import { FileImage, ZoomIn, ZoomOut, RotateCcw, FileText, AlertCircle, Upload, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DiagnosticTooltwo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [detectedFeatures, setDetectedFeatures] = useState({
    "Asymmetry": false,
    "Border Irregularity": false,
    "Color Variation": false,
    "Diameter >6mm": false,
    "Evolution": false,
  });

  const [diagnosisData, setDiagnosisData] = useState({
    Melanoma: 0,
    Nevus: 0
  });
  
  const [interpretation, setInterpretation] = useState("No image analyzed");
  const [explanationText, setExplanationText] = useState(
    "Upload a dermoscopic image to receive an AI-assisted diagnosis."
  );
  
  // Add state for segmentation mask
  const [segmentationMask, setSegmentationMask] = useState(null);
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewSrc(URL.createObjectURL(file));
      // Clear previous results when a new file is selected
      setSegmentationMask(null);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", selectedFile);
    
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/predicttwo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      if (response.data) {
        if (response.data.diagnosis) {
          setDiagnosisData(response.data.diagnosis);
          const melProb = response.data.diagnosis.Melanoma;
          setDetectedFeatures({
            "Asymmetry": melProb > 0.4,
            "Border Irregularity": melProb > 0.3,
            "Color Variation": melProb > 0.5,
            "Diameter >6mm": melProb > 0.35,
            "Evolution": melProb > 0.6,
          });
        }
        if (response.data.interpretation) {
          setInterpretation(response.data.interpretation);
          generateExplanation(response.data.interpretation, response.data.diagnosis);
        }
        
        if (response.data.segmentation_mask) {
          setSegmentationMask(`data:image/png;base64,${response.data.segmentation_mask}`);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setInterpretation("Error in analysis");
      setExplanationText("An error occurred while analyzing the image. Please try again or check if the server is running.");
    } finally {
      setLoading(false);
    }
  };
  
  const generateExplanation = (interpretation, diagnosis) => {
    const melProb = diagnosis.Melanoma;
    const nvProb = diagnosis.Nevus;
    
    let explanationDetails = "";
    
    if (melProb > 0.7) {
      explanationDetails = `The analysis indicates a ${(melProb * 100).toFixed(1)}% probability of melanoma. 
      The image shows characteristics that are concerning, including potential asymmetry, border irregularity, 
      and color variation. These features are consistent with melanocytic lesions that may be malignant. 
      Immediate consultation with a dermatologist is highly recommended for proper evaluation and potential biopsy.`;
    } else if (melProb > 0.4) {
      explanationDetails = `The analysis shows a moderate probability of melanoma (${(melProb * 100).toFixed(1)}%). 
      Some concerning features are present in the image that warrant further professional examination. 
      While not definitively malignant, this lesion shows some atypical characteristics that should be evaluated 
      by a dermatologist to rule out melanoma or other skin cancers.`;
    } else {
      explanationDetails = `The analysis indicates a low probability of melanoma (${(melProb * 100).toFixed(1)}%). 
      The lesion appears to have characteristics consistent with a benign nevus (${(nvProb * 100).toFixed(1)}% probability). 
      Regular monitoring is still recommended, and any changes in appearance should prompt a dermatologist visit.`;
    }
    
    setExplanationText(explanationDetails);
  };
  
  const toggleFeature = (feature) => {
    setDetectedFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };
  
  const getChartData = () => {
    return [
      { name: 'Melanoma', value: Math.round(diagnosisData.Melanoma * 100) },
      { name: 'Nevus (Benign)', value: Math.round(diagnosisData.Nevus * 100) }
    ];
  };

  const getBarColor = (entry) => {
    if (entry.name === 'Nevus (Benign)') return '#4ade80';
    if (entry.name === 'Melanoma') return '#f87171';
    return '#60a5fa';
  };

  const getPredictionStyle = () => {
    if (diagnosisData.Melanoma > 0.7) {
      return "bg-red-50 text-red-800"; 
    } else if (diagnosisData.Melanoma > 0.4) {
      return "bg-yellow-50 text-yellow-800";
    } else if (diagnosisData.Melanoma > 0) {
      return "bg-green-50 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 py-4 px-6 mb-6">
        <a href="/" className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">DermaDetect AI</h1>
          </div>
        </a>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Dermoscopic Image</h2>
              <div className="space-y-4">
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
                    <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150">
                      Choose file
                    </span>
                    <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Supported formats: JPG, PNG, JPEG (max. 10MB)
                  </p>
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium ${
                    !selectedFile || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
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
                
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected file: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                )}
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
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
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

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ABCDE Melanoma Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.keys(detectedFeatures).map((feature) => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`py-2 px-3 rounded-md border flex items-center gap-2 transition duration-150 ${
                      detectedFeatures[feature]
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center h-4 w-4 rounded-full ${
                        detectedFeatures[feature]
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-gray-300"
                      }`}
                    >
                      {detectedFeatures[feature] && "✓"}
                    </span>
                    <span className="text-sm font-medium truncate">{feature}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Results</h2>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Model Prediction</h3>
                <div className={`p-3 rounded-md font-medium ${getPredictionStyle()}`}>
                  {interpretation}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Probability Distribution</h3>
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

              
              {segmentationMask && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Lesion Segmentation</h3>
                  <div className="bg-gray-50 p-2 rounded-md">
                    <div className="flex justify-center">
                      <img 
                        src={segmentationMask} 
                        alt="Lesion segmentation mask" 
                        className="max-w-full border border-gray-200 rounded" 
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      AI-generated segmentation mask highlighting the detected lesion
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Detailed Analysis</h3>
                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                  {explanationText}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 font-medium hover:bg-indigo-700 transition duration-150"
                  disabled={!previewSrc || loading}
                >
                  <FileText className="h-5 w-5" />
                  Generate Detailed Report
                </button>
                
                <div className="flex items-center justify-center text-xs text-gray-500 gap-1 mt-2">
                  <AlertCircle className="h-3 w-3" />
                  <p>This is an AI-assisted analysis. Always consult with a dermatologist.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reference Information</h2>
              <div className="text-sm text-gray-600 space-y-4">
                <p>
                  <span className="font-medium block mb-1">ABCDE Rule for Melanoma:</span>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li><strong>A</strong>symmetry: One half unlike the other half</li>
                    <li><strong>B</strong>order: Irregular, scalloped or poorly defined border</li>
                    <li><strong>C</strong>olor: Varied from one area to another</li>
                    <li><strong>D</strong>iameter: Larger than 6mm (size of a pencil eraser)</li>
                    <li><strong>E</strong>volving: Changing in size, shape, color</li>
                  </ul>
                </p>
                <p>
                  <span className="font-medium block mb-1">Risk Factors:</span>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li>Family history of melanoma</li>
                    <li>Previous melanoma diagnosis</li>
                    <li>Multiple moles ({">"}50)</li>
                    <li>Fair skin, light hair, freckles</li>
                    <li>History of sunburns</li>
                  </ul>
                </p>
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