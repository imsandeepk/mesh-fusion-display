
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface DualMeshPreviewProps {
  file1: File | null;
  file2: File | null;
}

const DualMeshPreview: React.FC<DualMeshPreviewProps> = ({ file1, file2 }) => {
  const [geometry1, setGeometry1] = useState<THREE.BufferGeometry | null>(null);
  const [geometry2, setGeometry2] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!file1) {
      setGeometry1(null);
      return;
    }

    const loader = new STLLoader();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const geometry = loader.parse(arrayBuffer);
        geometry.computeBoundingBox();
        geometry.center();
        setGeometry1(geometry);
      }
    };
    
    reader.readAsArrayBuffer(file1);
  }, [file1]);

  useEffect(() => {
    if (!file2) {
      setGeometry2(null);
      return;
    }

    const loader = new STLLoader();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const geometry = loader.parse(arrayBuffer);
        geometry.computeBoundingBox();
        geometry.center();
        setGeometry2(geometry);
      }
    };
    
    reader.readAsArrayBuffer(file2);
  }, [file2]);

  if (!geometry1 && !geometry2) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Upload files to see preview</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {geometry1 && (
          <mesh geometry={geometry1} position={[-3, 0, 0]}>
            <meshStandardMaterial color="#3b82f6" side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {geometry2 && (
          <mesh geometry={geometry2} position={[3, 0, 0]}>
            <meshStandardMaterial color="#10b981" side={THREE.DoubleSide} />
          </mesh>
        )}
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          maxDistance={20}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
};

export default DualMeshPreview;
