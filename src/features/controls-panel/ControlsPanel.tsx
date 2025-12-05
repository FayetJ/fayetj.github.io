
import React from 'react';
import { ViewerControls } from '../../types/stl';
import './ControlsPanel.css';

interface ControlsPanelProps {
  controls: ViewerControls;
  onControlsChange: (controls: ViewerControls) => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ controls, onControlsChange }) => {
  const handleToggle = (key: keyof ViewerControls) => {
    onControlsChange({
      ...controls,
      [key]: !controls[key]
    });
  };

  const handleColorChange = (key: 'backgroundColor' | 'modelColor', value: string) => {
    onControlsChange({
      ...controls,
      [key]: value
    });
  };

  const handleSliderChange = (key: 'lightingIntensity' | 'rotationSpeed', value: number) => {
    onControlsChange({
      ...controls,
      [key]: value
    });
  };

  const colorPresets = [
    { label: 'Ocean', value: '#0f172a' },
    { label: 'Midnight', value: '#1e1b4b' },
    { label: 'Charcoal', value: '#1f2937' },
    { label: 'Forest', value: '#064e3b' },
  ];

  const modelColorPresets = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Violet', value: '#8b5cf6' },
  ];

  return (
    <div className="controls-panel">
      <div className="panel-header">
        <h3>Viewer Controls</h3>
        <div className="panel-subtitle">Customize your 3D view</div>
      </div>

      <div className="controls-grid">
        <div className="control-group">
          <h4>Visual Aids</h4>
          <div className="toggle-grid">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={controls.showWireframe}
                onChange={() => handleToggle('showWireframe')}
              />
              <span className="toggle-label">Wireframe</span>
              <span className="toggle-description">Show mesh structure</span>
            </label>
            
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={controls.showNormals}
                onChange={() => handleToggle('showNormals')}
              />
              <span className="toggle-label">Normals</span>
              <span className="toggle-description">Show surface normals</span>
            </label>
            
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={controls.showGrid}
                onChange={() => handleToggle('showGrid')}
              />
              <span className="toggle-label">Grid</span>
              <span className="toggle-description">Show reference grid</span>
            </label>
            
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={controls.showAxes}
                onChange={() => handleToggle('showAxes')}
              />
              <span className="toggle-label">Axes</span>
              <span className="toggle-description">Show coordinate axes</span>
            </label>
          </div>
        </div>

        <div className="control-group">
          <h4>Background Color</h4>
          <div className="color-presets">
            {colorPresets.map((preset) => (
              <button
                key={preset.value}
                className={`color-preset ${controls.backgroundColor === preset.value ? 'active' : ''}`}
                style={{ backgroundColor: preset.value }}
                onClick={() => handleColorChange('backgroundColor', preset.value)}
                title={preset.label}
              />
            ))}
          </div>
          <div className="color-input">
            <input
              type="color"
              value={controls.backgroundColor}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
            />
            <span>Custom</span>
          </div>
        </div>

        <div className="control-group">
          <h4>Model Color</h4>
          <div className="color-presets">
            {modelColorPresets.map((preset) => (
              <button
                key={preset.value}
                className={`color-preset ${controls.modelColor === preset.value ? 'active' : ''}`}
                style={{ backgroundColor: preset.value }}
                onClick={() => handleColorChange('modelColor', preset.value)}
                title={preset.label}
              />
            ))}
          </div>
          <div className="color-input">
            <input
              type="color"
              value={controls.modelColor}
              onChange={(e) => handleColorChange('modelColor', e.target.value)}
            />
            <span>Custom</span>
          </div>
        </div>

        <div className="control-group">
          <h4>Lighting Intensity</h4>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={controls.lightingIntensity}
              onChange={(e) => handleSliderChange('lightingIntensity', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="slider-value">{controls.lightingIntensity.toFixed(1)}</div>
          </div>
          <div className="slider-labels">
            <span>Dim</span>
            <span>Normal</span>
            <span>Bright</span>
          </div>
        </div>

        <div className="control-group">
          <h4>Auto Rotation</h4>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={controls.rotationSpeed}
              onChange={(e) => handleSliderChange('rotationSpeed', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="slider-value">{controls.rotationSpeed.toFixed(1)}</div>
          </div>
          <div className="slider-labels">
            <span>Off</span>
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>

      <div className="panel-footer">
        <div className="controls-hint">
          <span className="hint-icon">💡</span>
          <span>Changes apply in real-time to the 3D viewer</span>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;
