
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, EyeOff, Settings } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

interface MeshComponentProps {
  data: string;
  color: string;
  visible: boolean;
  position?: [number, number, number];
}

const MeshComponent: React.FC<MeshComponentProps> = ({ data, color, visible, position = [0, 0, 0] }) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!data) return;

    try {
      const loader = new STLLoader();
      // Convert data URL back to ArrayBuffer
      const base64 = data.split(',')[1];
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const geometry = loader.parse(bytes.buffer);
      geometry.computeBoundingBox();
      geometry.center();
      setGeometry(geometry);
    } catch (error) {
      console.error('Error loading mesh:', error);
    }
  }, [data]);

  if (!geometry || !visible) return null;

  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};

interface CoordinateMarkerProps {
  position: [number, number, number];
  color?: string;
}

const CoordinateMarker: React.FC<CoordinateMarkerProps> = ({ position, color = '#ff6b6b' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
};

const Viewer: React.FC = () => {
  const navigate = useNavigate();
  const [mesh1Visible, setMesh1Visible] = useState(true);
  const [mesh2Visible, setMesh2Visible] = useState(true);
  const [mesh1Data, setMesh1Data] = useState<string>('');
  const [mesh2Data, setMesh2Data] = useState<string>('');
  const [showGrid, setShowGrid] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  // Sample coordinates for markers
  const coordinates = [
    [2, 2, 0],
    [-2, 2, 0],
    [0, -2, 1],
    [3, 0, -1],
    [-1, 3, 2]
  ] as [number, number, number][];

  useEffect(() => {
    const mesh1 = localStorage.getItem('mesh1');
    const mesh2 = localStorage.getItem('mesh2');
    
    if (!mesh1 || !mesh2) {
      navigate('/');
      return;
    }
    
    setMesh1Data(mesh1);
    setMesh2Data(mesh2);
  }, [navigate]);

  const handleBackToUpload = () => {
    localStorage.removeItem('mesh1');
    localStorage.removeItem('mesh2');
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
          <div className="flex-1 p-4 space-y-6">
            <Card className="p-4 bg-gray-700 border-gray-600">
              <h3 className="text-sm font-medium mb-4 text-gray-200">Mesh Visibility</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Mesh 1
                  </span>
                  <Switch
                    checked={mesh1Visible}
                    onCheckedChange={setMesh1Visible}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Mesh 2
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

            <Card className="p-4 bg-gray-700 border-gray-600">
              <h3 className="text-sm font-medium mb-4 text-gray-200">Coordinate Markers</h3>
              <div className="text-xs text-gray-400 space-y-1">
                {coordinates.map((coord, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    ({coord[0]}, {coord[1]}, {coord[2]})
                  </div>
                ))}
              </div>
            </Card>
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
          camera={{ position: [10, 10, 10], fov: 50 }}
          className="bg-gradient-to-b from-gray-900 to-black"
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
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
            data={mesh1Data}
            color="#3b82f6"
            visible={mesh1Visible}
            position={[-2, 0, 0]}
          />
          <MeshComponent
            data={mesh2Data}
            color="#10b981"
            visible={mesh2Visible}
            position={[2, 0, 0]}
          />

          {/* Coordinate Markers */}
          {coordinates.map((position, index) => (
            <CoordinateMarker
              key={index}
              position={position}
              color="#ef4444"
            />
          ))}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={50}
            minDistance={2}
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
