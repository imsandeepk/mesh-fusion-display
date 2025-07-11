
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload as UploadIcon, Eye, FileText, ArrowRight } from 'lucide-react';
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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

interface FileUploadProps {
  title: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  color: string;
}

const FileUploadSection: React.FC<FileUploadProps> = ({ title, file, onFileChange, color }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.stl')) {
      onFileChange(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <div className={`w-4 h-4 rounded ${color}`}></div>
        <FileText className="h-5 w-5" />
        {title}
      </h3>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById(`file-input-${title}`)?.click()}
      >
        <UploadIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg mb-2">
          {file ? file.name : 'Drop STL file here or click to browse'}
        </p>
        <p className="text-sm text-gray-500">
          Supports .stl files only
        </p>
        <input
          id={`file-input-${title}`}
          type="file"
          accept=".stl"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    </Card>
  );
};

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (file1 && file2) {
      try {
        // Convert files to ArrayBuffer for passing to viewer
        const arrayBuffer1 = await file1.arrayBuffer();
        const arrayBuffer2 = await file2.arrayBuffer();
        
        // Store as base64 in sessionStorage (temporary solution)
        const base64_1 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer1)));
        const base64_2 = btoa(String.fromCharArray(...new Uint8Array(arrayBuffer2)));
        
        sessionStorage.setItem('mesh1', base64_1);
        sessionStorage.setItem('mesh2', base64_2);
        sessionStorage.setItem('mesh1Name', file1.name);
        sessionStorage.setItem('mesh2Name', file2.name);
        
        navigate('/viewer');
      } catch (error) {
        console.error('Error processing files:', error);
        alert('Error processing files. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">STL Mesh Viewer</h1>
          <p className="text-lg text-gray-600">Upload your STL files to visualize them in 3D</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FileUploadSection
            title="Mesh File 1"
            file={file1}
            onFileChange={setFile1}
            color="bg-blue-500"
          />
          <FileUploadSection
            title="Mesh File 2"
            file={file2}
            onFileChange={setFile2}
            color="bg-green-500"
          />
        </div>

        {(file1 || file2) && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Eye className="h-5 w-5" />
                Preview (scroll to zoom, drag to rotate/pan)
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>{file1?.name || 'No file selected'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>{file2?.name || 'No file selected'}</span>
                </div>
              </div>
              <DualMeshPreview file1={file1} file2={file2} />
            </div>
          </Card>
        )}

        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!file1 || !file2}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            View Meshes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
