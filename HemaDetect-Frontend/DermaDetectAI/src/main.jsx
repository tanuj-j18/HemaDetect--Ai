import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import Layout from './Layout';
import Home from './pages/Home';
import DiagnosticTool from './pages/DiagnosticTool';
import DiagnosticToolTwo from './pages/DiagnosticTooltwo';
import DiagnosticToolThree from './pages/DiagnosticToolthree';
import TanujBhai from './pages/tanujBhai';

// Define routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="diagnostic" element={<DiagnosticTool />} />
      <Route path="diagnostictwo" element={<DiagnosticToolTwo />} />
      <Route path="diagnosticthree" element={<DiagnosticToolThree />} />
      <Route path="blood" element={<TanujBhai />} />
    </Route>
  )
);

// Render application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
