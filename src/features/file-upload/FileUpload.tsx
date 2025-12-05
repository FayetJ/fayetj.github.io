
import React, { useCallback, useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      onFileUpload(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleClick = () => {
    const input = document.getElementById('stl-file-input') as HTMLInputElement;
    input?.click();
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading STL file...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="upload-text">
              <h3>Drop STL file here</h3>
              <p>or click to browse</p>
            </div>
            <p className="file-types">Supports .stl files (binary & ASCII)</p>
          </>
        )}
      </div>
      
      <input
        id="stl-file-input"
        type="file"
        accept=".stl"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="upload-hints">
        <div className="hint">
          <span className="hint-icon">💡</span>
          <span>Maximum file size: 50MB</span>
        </div>
        <div className="hint">
          <span className="hint-icon">⚡</span>
          <span>Processing happens in your browser</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
