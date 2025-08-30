
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileImage, ZoomIn, ZoomOut, RotateCcw, FileText, AlertCircle, Upload, Shield, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DiagnosticTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // New patient data states
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [anatomySite, setAnatomySite] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  
  const ANATOM_SITE_CATEGORIES = [
    'head/neck', 
    'upper extremity', 
    'lower extremity',
    'torso', 
    'palms/soles', 
    'oral/genital'
  ];

  const [diagnosisData, setDiagnosisData] = useState({
    Melanoma: 0,
    Nevus: 0
  });
  
  const [interpretation, setInterpretation] = useState("No image analyzed");
  const [explanationText, setExplanationText] = useState(
    "Upload a dermoscopic image to receive an AI-assisted diagnosis."
  );
  
  const [segmentationMask, setSegmentationMask] = useState(null);
  const [segmentationDetails, setSegmentationDetails] = useState({
    lesion_area_percentage: 0,
    border_complexity: 0
  });

  // Check if all required fields are filled to enable the analyze button
  useEffect(() => {
    if (selectedFile && patientAge && patientGender && anatomySite) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [selectedFile, patientAge, patientGender, anatomySite]);
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewSrc(URL.createObjectURL(file));
      setSegmentationMask(null);
      setSegmentationDetails({
        lesion_area_percentage: 0,
        border_complexity: 0
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Please complete all required fields before analyzing");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("age", patientAge);
    formData.append("gender", patientGender);
    formData.append("anatomy_site", anatomySite);
    ///data set details
    //structure
    //proposed diagram
    //embedding effiecient net contatnate of features
    //future scope
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      if (response.data) {
        if (response.data.diagnosis) {
          setDiagnosisData(response.data.diagnosis);
        }
        if (response.data.interpretation) {
          setInterpretation(response.data.interpretation);
          generateExplanation(response.data.interpretation, response.data.diagnosis);
        }
        if (response.data.segmentation_mask) {
          setSegmentationMask(`data:image/png;base64,${response.data.segmentation_mask}`);
        }
        
        if (response.data.segmentation_details) {
          setSegmentationDetails(response.data.segmentation_details);
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
    
    // Format anatomy site to be more readable
    const formattedSite = anatomySite.split('/').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('/');
    
    let explanationDetails = "";
    
    if (melProb > 0.7) {
      explanationDetails = `The analysis indicates a ${(melProb * 100).toFixed(1)}% probability of melanoma. 
      This result is concerning for a ${patientAge}-year-old ${patientGender} patient with a lesion on the ${formattedSite}. 
      The location and patient demographics, combined with the image characteristics, suggest a high-risk lesion.
      Immediate consultation with a dermatologist is highly recommended for proper evaluation and potential biopsy.`;
    } else if (melProb > 0.4) {
      explanationDetails = `The analysis shows a moderate probability of melanoma (${(melProb * 100).toFixed(1)}%). 
      Some concerning features are present in the image that warrant further professional examination, particularly given
      the patient's age (${patientAge}) and the location (${formattedSite}). 
      While not definitively malignant, this lesion should be evaluated by a dermatologist to rule out melanoma or other skin cancers.`;
    } else {
      explanationDetails = `The analysis indicates a low probability of melanoma (${(melProb * 100).toFixed(1)}%). 
      The lesion appears to have characteristics consistent with a benign nevus (${(nvProb * 100).toFixed(1)}% probability). 
      For a ${patientAge}-year-old ${patientGender} patient with a lesion on the ${formattedSite}, regular monitoring is still recommended,
      and any changes in appearance should prompt a dermatologist visit.`;
    }
    
    setExplanationText(explanationDetails);
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

  const getBorderComplexityText = () => {
    const complexity = segmentationDetails.border_complexity;
    if (complexity > 2) return "Highly irregular";
    if (complexity > 1.5) return "Irregular";
    if (complexity > 1.2) return "Slightly irregular";
    return "Regular";
  };

  // Helper function to format anatomy site display names
  const formatAnatomySite = (site) => {
    return site.split('/').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('/');
  };
  
  // New function to generate and download CSV report
  const generateReport = () => {
    // Get current date and time in Indian Standard Time (IST)
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata' };
    const istTime = now.toLocaleTimeString('en-IN', options);
    const istDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Generate detailed lesion report based on analysis
    // let lesionReport = getLesionReport();
    let classificationReport = getClassificationReport();
    let overallExplanation = getOverallExplanation();
    
    // Create CSV content
    const csvContent = [
      "DermaDetect AI - Dermatological Analysis Report",
      `Generated on: ${istDate} at ${istTime} (IST)`,
      "",
      "PATIENT INFORMATION",
      `Image Name: ${selectedFile ? selectedFile.name : "N/A"}`,
      `Patient Age: ${patientAge}`,
      `Patient Gender: ${patientGender}`,
      `Anatomy Site: ${formatAnatomySite(anatomySite)}`,
      "",
      "DIAGNOSTIC RESULTS",
      `Primary Diagnosis: ${interpretation}`,
      `Melanoma Probability: ${(diagnosisData.Melanoma * 100).toFixed(1)}%`,
      `Nevus (Benign) Probability: ${(diagnosisData.Nevus * 100).toFixed(1)}%`,
      "",
      "LESION ANALYSIS",
      `Lesion Area: ${segmentationDetails.lesion_area_percentage.toFixed(1)}% of image`,
      `Border Complexity: ${getBorderComplexityText()} (${segmentationDetails.border_complexity.toFixed(2)})`,
      "",
      "",
      "CLASSIFICATION REPORT",
      classificationReport,
      "",
      "OVERALL ASSESSMENT",
      overallExplanation,
      "",
      "DISCLAIMER",
      "This is an AI-assisted analysis and should not replace professional medical advice.",
      "Please consult with a dermatologist for proper diagnosis and treatment options."
    ].join("\n");
    
    // Create downloadable file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `DermaDetect_Report_${istDate.replace(/\//g, '-')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const getClassificationReport = () => {
    const melProb = diagnosisData.Melanoma;
    
    if (melProb > 0.7) {
      return "HIGH RISK: The lesion exhibits multiple characteristics consistent with melanoma including asymmetry, border irregularity, color variegation, and potentially concerning structural patterns. The algorithm detected features highly suspicious for malignancy.";
    } else if (melProb > 0.4) {
      return "MODERATE RISK: The lesion shows some concerning features that warrant professional evaluation. While not definitively malignant, the presence of atypical features suggests the need for clinical correlation and possibly dermoscopic evaluation by a specialist.";
    } else {
      return "LOW RISK: The lesion demonstrates characteristics highly consistent with a benign nevus. Regular monitoring is still advised, but immediate concern is low based on the current appearance and analysis.";
    }
  };
  
  const getOverallExplanation = () => {
    const melProb = diagnosisData.Melanoma;
    const formattedSite = formatAnatomySite(anatomySite);
    
    if (melProb > 0.7) {
      return `This ${patientAge}-year-old ${patientGender} patient presents with a concerning lesion on the ${formattedSite} that demonstrates high-risk features for melanoma (${(melProb * 100).toFixed(1)}% probability). The lesion shows significant asymmetry, irregular borders, and uneven coloration patterns typical of melanocytic malignancies. Given the patient demographics and lesion characteristics, urgent dermatological consultation is strongly recommended for consideration of biopsy and histopathological examination. The combination of anatomical location and lesion appearance significantly elevates the risk profile. RECOMMENDATION: Immediate dermatology referral.`;
    } else if (melProb > 0.4) {
      return `This ${patientAge}-year-old ${patientGender} patient presents with a lesion on the ${formattedSite} that demonstrates some concerning features (${(melProb * 100).toFixed(1)}% probability of melanoma). While not definitively malignant, the lesion exhibits sufficient atypical characteristics to warrant a careful dermatological evaluation. The moderate risk assessment is based on a combination of patient factors and lesion appearance. The border complexity score and pigmentation pattern suggest this lesion should not be dismissed without professional examination. RECOMMENDATION: Dermatology referral within 2-4 weeks.`;
    } else {
      return `This ${patientAge}-year-old ${patientGender} patient presents with a lesion on the ${formattedSite} that demonstrates predominantly benign characteristics (${(diagnosisData.Nevus * 100).toFixed(1)}% probability of benign nevus). The regular border, consistent coloration, and overall symmetry are reassuring findings. For a patient of this demographic profile, this type of lesion represents a low risk for malignancy. However, standard dermatological monitoring practices should still be followed, with special attention to any changes in appearance over time. RECOMMENDATION: Routine monitoring with annual skin examinations.`;
    }
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
                
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected file: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Age Input */}
                <div>
                  <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="patientAge"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    min="0"
                    max="120"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter age"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for risk assessment</p>
                </div>
                
                {/* Gender Input */}
                <div>
                  <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="patientGender"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Gender-specific risk patterns vary</p>
                </div>
                
                {/* Anatomy Site Input */}
                <div>
                  <label htmlFor="anatomySite" className="block text-sm font-medium text-gray-700 mb-1">
                    Anatomy Site <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="anatomySite"
                    value={anatomySite}
                    onChange={(e) => setAnatomySite(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select location</option>
                    {ANATOM_SITE_CATEGORIES.map((site) => (
                      <option key={site} value={site}>
                        {formatAnatomySite(site)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Location affects diagnostic probability</p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium ${
                    !isFormValid || loading
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
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Lesion Segmentation Analysis</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-center mb-3">
                      <img 
                        src={segmentationMask} 
                        alt="Lesion segmentation visualization" 
                        className="max-w-full border border-gray-200 rounded shadow-sm" 
                      />
                    </div>
                    
                    {/* Segmentation metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Lesion Area</h4>
                        <p className="text-sm font-semibold text-indigo-600">
                          {segmentationDetails.lesion_area_percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Border Shape</h4>
                        <p className="text-sm font-semibold text-indigo-600">
                          {getBorderComplexityText()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Computer vision analysis highlighting lesion boundaries and characteristics
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
                  onClick={generateReport}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Factor Information</h2>
              <div className="text-sm text-gray-600 space-y-4">
                <p>
                  <span className="font-medium block mb-1">Common Risk Factors:</span>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li>Family history of melanoma</li>
                    <li>Previous melanoma diagnosis</li>
                    <li>Multiple moles ({">"}50)</li>
                    <li>Fair skin, light hair, freckles</li>
                    <li>History of sunburns</li>
                  </ul>
                </p>
                <p>
                  <span className="font-medium block mb-1">High-Risk Anatomy Sites:</span>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li><strong>Head/Neck</strong>: High sun exposure area</li>
                    <li><strong>Palms/Soles</strong>: Acral melanomas often detected late</li>
                    <li><strong>Torso</strong>: Often missed in self-examinations</li>
                    <li><strong>Lower Extremity</strong>: Common in women</li>
                    <li><strong>Upper Extremity</strong>: Frequent sun exposure</li>
                  </ul>
                </p>
                <p>
                  <span className="font-medium block mb-1">Age Considerations:</span>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li>Melanoma can affect any age group</li>
                    <li>Increased risk with age {">"}50 years</li>
                    <li>Growing incidence in young adults (25-40)</li>
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