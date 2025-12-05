
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { STLFile, ViewerControls } from '../../types/stl';
import './STLViewer.css';

interface STLViewerProps {
  stlFile: STLFile | null;
  controls: ViewerControls;
  onError: (error: string) => void;
}

const STLViewer: React.FC<STLViewerProps> = ({ stlFile, controls, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeRef = useRef<THREE.LineSegments | null>(null);
  const normalsHelperRef = useRef<VertexNormalsHelper | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initThreeJS = useCallback(() => {
    if (!canvasRef.current || isInitialized) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true 
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.screenSpacePanning = true;
    controlsRef.current = orbitControls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add initial grid and axes
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    gridHelper.position.y = -1;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    // Set initial background
    scene.background = new THREE.Color(controls.backgroundColor);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (meshRef.current && controls.rotationSpeed > 0) {
        meshRef.current.rotation.y += controls.rotationSpeed * 0.01;
      }
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    setIsInitialized(true);
  }, [isInitialized, controls.backgroundColor]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
        onError('Fullscreen mode is not supported or was denied.');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, [onError]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    initThreeJS();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Clean up geometries and materials
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(m => m.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
      
      if (wireframeRef.current) {
        wireframeRef.current.geometry.dispose();
        wireframeRef.current.material.dispose();
      }
      
      if (normalsHelperRef.current) {
        normalsHelperRef.current.dispose();
      }
    };
  }, [initThreeJS]);

  useEffect(() => {
    if (!sceneRef.current || !stlFile || !isInitialized) return;

    const loadSTL = async () => {
      try {
        const loader = new STLLoader();
        const geometry = loader.parse(stlFile.arrayBuffer);
        
        // Center geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Scale geometry to fit view
        const size = new THREE.Vector3();
        geometry.boundingBox?.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        geometry.scale(scale, scale, scale);

        // Clear previous mesh
        if (meshRef.current) {
          sceneRef.current?.remove(meshRef.current);
          meshRef.current.geometry.dispose();
          if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach(m => m.dispose());
          } else {
            meshRef.current.material.dispose();
          }
        }

        if (wireframeRef.current) {
          sceneRef.current?.remove(wireframeRef.current);
          wireframeRef.current.geometry.dispose();
          wireframeRef.current.material.dispose();
        }

        if (normalsHelperRef.current) {
          sceneRef.current?.remove(normalsHelperRef.current);
          normalsHelperRef.current.dispose();
        }

        // Create new mesh
        const material = new THREE.MeshPhongMaterial({ 
          color: controls.modelColor,
          shininess: 100,
          specular: 0x222222
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        sceneRef.current.add(mesh);
        meshRef.current = mesh;

        // Create wireframe
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
          color: 0xffffff, 
          linewidth: 1,
          transparent: true,
          opacity: 0.3
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        wireframe.visible = controls.showWireframe;
        sceneRef.current.add(wireframe);
        wireframeRef.current = wireframe;

        // Create normals helper
        const normalsHelper = new VertexNormalsHelper(mesh, 0.1, 0xff0000);
        normalsHelper.visible = controls.showNormals;
        sceneRef.current.add(normalsHelper);
        normalsHelperRef.current = normalsHelper;

        // Reset camera position
        if (cameraRef.current && controlsRef.current) {
          geometry.computeBoundingSphere();
          const boundingSphere = geometry.boundingSphere;
          
          if (boundingSphere) {
            cameraRef.current.position.set(
              boundingSphere.center.x,
              boundingSphere.center.y,
              boundingSphere.center.z + boundingSphere.radius * 2
            );
            controlsRef.current.target.copy(boundingSphere.center);
            controlsRef.current.update();
          }
        }

      } catch (error) {
        console.error('STL loading error:', error);
        onError('Failed to parse STL file. Please ensure it is a valid STL file.');
      }
    };

    loadSTL();
  }, [stlFile, onError, isInitialized]);

  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    // Update mesh color
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshPhongMaterial) {
      meshRef.current.material.color.set(controls.modelColor);
    }

    // Update wireframe visibility
    if (wireframeRef.current) {
      wireframeRef.current.visible = controls.showWireframe;
    }

    // Update normals helper visibility
    if (normalsHelperRef.current) {
      normalsHelperRef.current.visible = controls.showNormals;
    }

    // Update grid helper
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = controls.showGrid;
    }

    // Update axes helper
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = controls.showAxes;
    }

    // Update background color
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(controls.backgroundColor);
    }

    // Update lighting intensity
    sceneRef.current.traverse((object) => {
      if (object instanceof THREE.Light) {
        object.intensity = controls.lightingIntensity;
      }
    });

  }, [controls, isInitialized]);

  return (
    <div className={`stl-viewer ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="stl-canvas"
      />
      <div className="viewer-controls-hint">
        <span className="hint-icon">🎮</span>
        <span>Left drag: Orbit • Right drag: Pan • Scroll: Zoom</span>
      </div>
      <button 
        className="fullscreen-toggle"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default STLViewer;
