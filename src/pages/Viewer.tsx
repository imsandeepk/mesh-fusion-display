
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

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

interface CoordinateMarkerProps {
  position: [number, number, number];
  color?: string;
}

const CoordinateMarker: React.FC<CoordinateMarkerProps> = ({ position, color = '#ff6b6b' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
};

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

  // Sample coordinates for markers
  const coordinates = [
  [13.972716013590496, 28.874358495076496, -7.2957695325215655],
  [17.147003809611004, 22.4296137491862, -6.625541845957439],
  [-27.87714258829753, 14.992266654968262, -8.217494010925293],
  [9.96170425415039, 35.24715805053711, -9.481896082560223],
  [-12.27313009897868, 39.499619801839195, -9.315000851949057],
  [-3.460191011428833, 41.300444285074875, -9.04151217142741],
  [4.280679861704509, 39.128387451171875, -8.016834894816082],
  [-17.52207056681315, 35.32466125488281, -8.93694845835368],
  [-29.31557909647624, 5.085844039916992, -7.397113641103109],
  [-24.06572723388672, 31.36399714152018, -6.939029852549235],
  [-25.735349655151367, 23.512896855672203, -5.105265458424887],
  [20.77125358581543, 15.68517812093099, -6.6283787091573085]
] as [number, number, number][];

  useEffect(() => {
    const state = location.state as {
      file1: File;
      file2: File;
      mesh1Name: string;
      mesh2Name: string;
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
          <div className="flex-1 p-4 space-y-6">
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
            maxDistance={100}
            minDistance={0.1}
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
