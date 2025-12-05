
import React from 'react';
import { STLFile } from '../../types/stl';
import './StatsOverlay.css';

interface StatsOverlayProps {
  stlFile: STLFile | null;
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({ stlFile }) => {
  if (!stlFile) return null;

  // Calculate approximate triangle count (binary STL: 50 bytes per triangle)
  const triangleCount = Math.floor(stlFile.arrayBuffer.byteLength / 50);
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="stats-overlay">
      <div className="stats-header">
        <h3>Model Statistics</h3>
        <div className="stats-subtitle">File Analysis</div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-label">File Name</div>
            <div className="stat-value" title={stlFile.name}>
              {stlFile.name.length > 20 
                ? stlFile.name.substring(0, 20) + '...' 
                : stlFile.name}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">File Size</div>
            <div className="stat-value">{formatFileSize(stlFile.size)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔺</div>
          <div className="stat-content">
            <div className="stat-label">Triangles</div>
            <div className="stat-value">{triangleCount.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-label">Last Modified</div>
            <div className="stat-value">{formatDate(stlFile.lastModified)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔢</div>
          <div className="stat-content">
            <div className="stat-label">Format</div>
            <div className="stat-value">
              {stlFile.arrayBuffer.byteLength > 84 ? 'Binary STL' : 'ASCII STL'}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <div className="stat-label">Resolution</div>
            <div className="stat-value">
              {triangleCount > 100000 ? 'High' : 
               triangleCount > 10000 ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="stats-footer">
        <div className="stats-hint">
          <span className="hint-icon">💡</span>
          <span>Triangle count is estimated based on file size</span>
        </div>
      </div>
    </div>
  );
};

export default StatsOverlay;
