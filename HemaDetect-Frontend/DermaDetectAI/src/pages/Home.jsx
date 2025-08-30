import React, { useState } from "react";
import { FileImage, Shield, Award, Users, ArrowRight, BookOpen, Calendar, MapPin } from "lucide-react";
import { ZoomIn, ZoomOut, RotateCcw, FileText, AlertCircle, Upload } from "lucide-react";

export default function Home() {
  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  };
  // const model_src = './systemArchitecture.svg';

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">HemaDetect AI</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Architecture</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">How It Works</a>
              <a href="#about" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">About</a>
            </nav>
            <div>
              <a 
                href="/blood" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Launch Tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Early Detection</span>
                  <span className="block text-red-600">Saves Lives</span>
                </h1>
                <p className="mt-6 max-w-xl text-xl text-gray-500">
                  HemaDetect AI uses advanced machine learning algorithms to help identify potential blood cancer conditions with high accuracy. Our diagnostic assistant tool supports healthcare professionals in early leukemia detection.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  <a
                    href="/blood"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Start Diagnosis
                  </a>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-md text-base font-medium text-red-600 bg-red-50 hover:bg-red-100"
                  >
                    Learn More
                  </a>
                </div>
              </div>
              
              <div className="relative h-64 sm:h-72 md:h-96 lg:h-full rounded-lg overflow-hidden shadow-xl">
                <img src="public\landin.jpg" alt="Hero illustration" className="w-full object-fill" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white py-16" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Model Architecture</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our model is built on efficient neural networks designed for high accuracy and speed in blood cell image analysis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">System Architecture</h2>
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
                  <div className="overflow-hidden flex justify-center items-center bg-gray-100" style={{ maxHeight: '400px', height: '400px' }}>
                    <img
                      src='/public/systemArchitecture.png'
                      alt="System Architecture"
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
              </div>
            </div>
        </div>
      </div>
      
      <div className="bg-gray-50 py-16" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Three simple steps to get a professional-grade blood cell analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm h-full">
                <div className="absolute -top-4 -left-4 h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 mt-6">Upload Image</h3>
                <p className="text-gray-500">
                  Upload a microscopic image of blood cells you want to analyze. Our system accepts high-resolution JPG, PNG, and JPEG files.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm h-full">
                <div className="absolute -top-4 -left-4 h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 mt-6">AI Analysis</h3>
                <p className="text-gray-500">
                  Our machine learning algorithm processes the image, identifying abnormal blood cells and patterns associated with various blood cancers.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm h-full">
                <div className="absolute -top-4 -left-4 h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 mt-6">Review Results</h3>
                <p className="text-gray-500">
                  Get immediate analysis with probability scores, cell type detection, and professional recommendations for next steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:px-20 xl:py-20">
              <div className="lg:self-center lg:max-w-3xl">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to try our</span>
                  <span className="block">Blood Cancer Diagnostic Assistant?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-red-50">
                  Get started with our AI-powered tool and experience how technology can assist in early blood cancer detection.
                </p>
                <div className="mt-8">
                  <div className="inline-flex rounded-md shadow">
                    <a
                      href="/blood"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50"
                    >
                      Launch Diagnostic Tool
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">About The Developer</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Bringing together expertise in artificial intelligence and healthcare innovation.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm text-center p-6 max-w-sm">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                  <Users className="h-12 w-12 text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Tanuj Jay</h3>
              <p className="text-red-600 mb-2">AI Developer & Researcher</p>
              <p className="text-gray-500 text-sm">
                Developed the complete system architecture and machine learning model for blood cancer detection. Expert in deep learning and medical image analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">HemaDetect AI</h3>
              </div>
              <p className="mt-4 text-gray-500 max-w-md">
                Empowering healthcare professionals and patients with advanced AI-driven blood cancer diagnostic tools for early detection.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">About</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 HemaDetect AI. All rights reserved. For educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
