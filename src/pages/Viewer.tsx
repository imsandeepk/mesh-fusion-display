import React, { useState, useEffect,useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const colorMap = {
  '1': '#ff0000', // red
  '2': '#00ff00', // green
  '3': '#0000ff', // blue
  '4': '#ffff00', // yellow
  '5': '#ffa500', // orange
  '6': '#800080', // purple
  '7': '#00ffff', // cyan
  '8': '#ffc0cb'  // pink
};

interface MeshComponentProps {
  file: File | null;
  color: string;
  visible: boolean;
  position?: [number, number, number];
}

function mapToothNumberToFDI(input: number, ul_bool: boolean): number {
  const mapping: { [key: number]: number } = {};

  if (ul_bool) {
    for (let i = 0; i < 8; i++) {
      mapping[i] = i === 0 ? 0 : 40 + i;
    }
    for (let i = 8; i < 15; i++) {
      mapping[i] = 23 + i; // 8:41, ..., 14:47
    }
  } else {
    for (let i = 0; i < 8; i++) {
      mapping[i] = i === 0 ? 0 : 20 + i;
    }
    for (let i = 8; i < 15; i++) {
      mapping[i] = 3 + i; // 8:21, ..., 14:27
    }
  }

  return mapping[input] ?? input;
}

const extractCenters = (data: any): [number, number, number][] => {
  if (!data || !data.mesh1 || !data.mesh1.centers) return [];

  const centers = Object.values(data.mesh1.centers) as any[];
  return centers.map((entry) => entry.center as [number, number, number]);
};

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
  size?: number;
}

const CoordinateMarker: React.FC<CoordinateMarkerProps> = ({
  position,
  color = '#ffffff',
  size = 0.5,
}) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
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
  const [apiData, setApiData] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<
  { pos: [number, number, number]; num: number; prep: number; color: string; source: string }[]
>([]);

  useEffect(() => {
  const state = location.state as {
    file1: File;
    file2: File;
    mesh1Name: string;
    mesh2Name: string;
    apiData?: any;
  };

  if (!state?.file1 || !state?.file2) {
    navigate('/');
    return;
  }

  setFile1(state.file1);
  setFile2(state.file2);
  setApiData(state.apiData || null);
  setMesh1Name(state.mesh1Name || 'Mesh 1');
  setMesh2Name(state.mesh2Name || 'Mesh 2');

  type CenterEntry = {
  center: [number, number, number];
  num: number;
  prep: number;
  is_lower: boolean;
};

const mesh1Data = state.apiData?.mesh1?.centers as Record<string, CenterEntry> || {};
const mesh2Data = state.apiData?.mesh2?.centers as Record<string, CenterEntry> || {};

const mesh1Entries = Object.entries(mesh1Data);
const mesh2Entries = Object.entries(mesh2Data);

const mesh2Coords = mesh2Entries
  .map(([id, entry]) => {
    const fdiNum = entry.num;
    const fdiLastDigit = Math.abs(fdiNum) % 10;
    const colorgiven = colorMap[fdiLastDigit.toString()] || '#AAAAAA';

    console.log(`Tooth Number (mesh2): ${fdiNum}, Color: ${colorgiven}`);

    return {
      pos: entry.center,
      num: fdiNum,
      prep: entry.prep,
      color: colorgiven,
      source: 'mesh2',
    };
  })
  .filter((coord) => coord.num !== -1); // Filter out invalid coordinates

const mesh1Coords = mesh1Entries
  .map(([id, entry]) => {
    const fdiNum = mapToothNumberToFDI(entry.num, entry.is_lower);
    const fdiLastDigit = Math.abs(fdiNum) % 10;
    const colorgiven = colorMap[fdiLastDigit.toString()] || '#AAAAAA';

    console.log(`Tooth Number: ${entry.num}, FDI: ${fdiNum}, Color: ${colorgiven}`);

    return {
      pos: entry.center,
      num: fdiNum,
      prep: entry.prep,
      color: colorgiven,
      source: 'mesh1',
    };
  })
  .filter((coord) => coord.num !== -1); // Filter out invalid coordinates

setCoordinates([...mesh1Coords, ...mesh2Coords]);

}, [navigate, location.state]);

  // Filter coordinates to exclude num === -1 for rendering
  const validCoordinates = coordinates.filter(coord => coord.num !== -1);

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
              <div className="mt-2 overflow-y-auto max-h-[80vh]">
                {validCoordinates.map((coord, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border-b border-gray-600">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: coord.color }}
                    />
                    <span className="text-sm font-medium text-gray-300">
                      {coord.source.toUpperCase()} - Num: {coord.num}
                    </span>
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
            color="#FFFFE3"
            visible={mesh1Visible}
            position={[-2, 0, 0]}
          />
          <MeshComponent
            file={file2}
            color="#FFFFE3"
            visible={mesh2Visible}
            position={[2, 0, 0]}
          />

          {/* Coordinate Markers */}
          {validCoordinates
            .filter(coord =>
              (coord.source === 'mesh1' && mesh1Visible) ||
              (coord.source === 'mesh2' && mesh2Visible)
            )
            .map((coord, index) => (
              <CoordinateMarker
                key={index}
                position={coord.pos}
                color={coord.color}
                size={coord.prep === 1 ? 1.2 : 0.5}
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