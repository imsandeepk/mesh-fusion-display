
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { TrackballControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import CoordinateMarkers from '@/components/CoordinateMarkers';
import CoordinateLegend from '@/components/CoordinateLegend';

interface MeshComponentProps {
  file: File | null;
  color: string;
  visible: boolean;
  position?: [number, number, number];
}

const MeshComponent: React.FC<MeshComponentProps> = ({ file, color, visible, position = [0, 0, 0] }) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!file) return;

    const loader = new STLLoader();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const geometry = loader.parse(arrayBuffer);
        geometry.computeBoundingBox();
        setGeometry(geometry);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, [file]);

  if (!geometry || !visible) return null;

  return (
    <mesh
      geometry={geometry}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.2}
        emissive={new THREE.Color(color).multiplyScalar(0.1)}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

interface MarkerData {
  prep: number;
  num: number;
  center: [number, number, number];
}

interface ApiData {
  mesh1: {
    is_lower: boolean;
    centers: Record<string, MarkerData>;
  };
  mesh2: {
    is_lower: boolean;
    centers: Record<string, MarkerData>;
  };
  id: string;
}

const Viewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mesh1Visible, setMesh1Visible] = useState(true);
  const [mesh2Visible, setMesh2Visible] = useState(true);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [mesh1Name, setMesh1Name] = useState<string>('');
  const [mesh2Name, setMesh2Name] = useState<string>('');
  const [showGrid, setShowGrid] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [apiData, setApiData] = useState<ApiData | null>(null);

  useEffect(() => {
    const state = location.state as {
      file1: File;
      file2: File;
      mesh1Name: string;
      mesh2Name: string;
      apiData?: ApiData;
    };
    
    console.log('Viewer state:', state);
    
    if (!state?.file1 || !state?.file2) {
      console.log('Missing file data, redirecting to upload');
      navigate('/');
      return;
    }
    
    setFile1(state.file1);
    setFile2(state.file2);
    setMesh1Name(state.mesh1Name || 'Mesh 1');
    setMesh2Name(state.mesh2Name || 'Mesh 2');
    
    if (state.apiData) {
      setApiData(state.apiData);
    }
  }, [navigate, location.state]);

  const handleBackToUpload = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      {/* Control Panel */}
      <div className={`${panelOpen ? 'w-80' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {panelOpen && <h2 className="text-lg font-semibold">Controls</h2>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanelOpen(!panelOpen)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {panelOpen && (
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            <Card className="p-4 bg-gray-700 border-gray-600">
              <h3 className="text-sm font-medium mb-4 text-gray-200">Mesh Visibility</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    {mesh1Name}
                  </span>
                  <Switch
                    checked={mesh1Visible}
                    onCheckedChange={setMesh1Visible}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    {mesh2Name}
                  </span>
                  <Switch
                    checked={mesh2Visible}
                    onCheckedChange={setMesh2Visible}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gray-700 border-gray-600">
              <h3 className="text-sm font-medium mb-4 text-gray-200">Display Options</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Grid</span>
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
            </Card>

            {apiData && (
              <CoordinateLegend
                mesh1Centers={apiData.mesh1.centers}
                mesh2Centers={apiData.mesh2.centers}
                mesh1Name={mesh1Name}
                mesh2Name={mesh2Name}
              />
            )}
          </div>
        )}

        <div className="p-4 border-t border-gray-700">
          <Button
            onClick={handleBackToUpload}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {panelOpen ? 'Back to Upload' : ''}
          </Button>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [10, 10, 10], fov: 50 }}
          className="bg-gradient-to-b from-gray-900 to-black"
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
          <directionalLight position={[-10, -15, -10]} intensity={0.5} castShadow />
          <pointLight position={[5, -10, 5]} intensity={0.5} />
          <pointLight position={[-10, 10, -5]} intensity={0.3} />
          
          {/* Grid */}
          {showGrid && (
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#444444"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#666666"
              fadeDistance={30}
              fadeStrength={1}
            />
          )}

          {/* Meshes */}
          <MeshComponent
            file={file1}
            color="#3b82f6"
            visible={mesh1Visible}
            position={[-2, 0, 0]}
          />
          <MeshComponent
            file={file2}
            color="#10b981"
            visible={mesh2Visible}
            position={[2, 0, 0]}
          />

          {/* Coordinate Markers from API */}
          {apiData && (
            <>
              <CoordinateMarkers 
                centers={apiData.mesh1.centers} 
                meshName="mesh1" 
              />
              <CoordinateMarkers 
                centers={apiData.mesh2.centers} 
                meshName="mesh2" 
              />
            </>
          )}

          <TrackballControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={100}
            minDistance={0.1}
            panSpeed={0.8}
            rotateSpeed={1.0}
            zoomSpeed={1.2}
          />
        </Canvas>

        {/* Instructions Overlay */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 p-4 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Controls:</strong><br />
            • Left click + drag: Rotate<br />
            • Right click + drag: Pan<br />
            • Scroll: Zoom in/out
          </p>
        </div>
      </div>
    </div>
  );
};

export default Viewer;
