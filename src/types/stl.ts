
export interface STLFile {
  name: string;
  size: number;
  lastModified: number;
  arrayBuffer: ArrayBuffer;
}

export interface STLStats {
  triangleCount: number;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  fileSize: string;
  fileName: string;
}

export interface ViewerControls {
  showWireframe: boolean;
  showNormals: boolean;
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: string;
  modelColor: string;
  lightingIntensity: number;
  rotationSpeed: number;
}
