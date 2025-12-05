
import React, { useState, useEffect, useRef } from 'react';
import STLViewer from './features/stl-viewer/STLViewer';
import FileUpload from './features/file-upload/FileUpload';
import ControlsPanel from './features/controls-panel/ControlsPanel';
import StatsOverlay from './features/stats-overlay/StatsOverlay';
import { STLFile } from './types/stl';
import './App.css';

function App() {
  const [stlFile, setStlFile] = useState<STLFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState({
    showWireframe: false,
    showNormals: false,
    showGrid: true,
    showAxes: true,
    backgroundColor: '#0f172a',
    modelColor: '#3b82f6',
    lightingIntensity: 1.0,
    rotationSpeed: 0,
  });
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const appInitialized = useRef(false);

  useEffect(() => {
    // Ensure the app only initializes once
    if (!appInitialized.current) {
      appInitialized.current = true;
      console.log('STL 3D Viewer initialized');
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const stlFile: STLFile = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        arrayBuffer,
      };
      setStlFile(stlFile);
    } catch (err) {
      setError('Failed to load STL file. Please try again.');
      console.error('File loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStlFile(null);
    setError(null);
    setControls({
      showWireframe: false,
      showNormals: false,
      showGrid: true,
      showAxes: true,
      backgroundColor: '#0f172a',
      modelColor: '#3b82f6',
      lightingIntensity: 1.0,
      rotationSpeed: 0,
    });
  };

  const toggleHeaderCollapse = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
  };

  return (
    <div className="app">
      <header className={`app-header ${isHeaderCollapsed ? 'collapsed' : ''}`}>
        <div className="header-main">
          <div className="header-content">
            <h1>STL 3D Viewer</h1>
            <p className="subtitle">Load, preview, and interact with STL files directly in your browser</p>
          </div>
          <div className="header-actions">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            <button 
              className="reset-button" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </div>
        
        <button 
          className="collapse-toggle"
          onClick={toggleHeaderCollapse}
          aria-label={isHeaderCollapsed ? "Expand header" : "Collapse header"}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={isHeaderCollapsed ? 'collapsed' : ''}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="viewer-container">
          <STLViewer 
            stlFile={stlFile} 
            controls={controls}
            onError={(err) => setError(err)}
          />
          
          {stlFile && (
            <>
              <ControlsPanel 
                controls={controls}
                onControlsChange={setControls}
              />
              <StatsOverlay stlFile={stlFile} />
            </>
          )}
        </div>

        {!stlFile && !isLoading && (
          <div className="welcome-message">
            <div className="welcome-card">
              <h2>Welcome to STL 3D Viewer</h2>
              <p>Upload an STL file to begin exploring your 3D model with interactive controls.</p>
              <div className="features-grid">
                <div className="feature">
                  <div className="feature-icon">📁</div>
                  <h3>Drag & Drop</h3>
                  <p>Upload STL files directly from your computer</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🎮</div>
                  <h3>Interactive Controls</h3>
                  <p>Orbit, zoom, and pan around your model</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🎨</div>
                  <h3>Customization</h3>
                  <p>Adjust colors, lighting, and visual aids</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">📊</div>
                  <h3>Real-time Stats</h3>
                  <p>View model statistics and file information</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with Three.js & React • STL 3D Viewer v1.0</p>
        <p className="footer-note">
          Supports binary and ASCII STL files • Works entirely in your browser
        </p>
      </footer>
    </div>
  );
}

export default App;
