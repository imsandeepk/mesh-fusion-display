
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload as UploadIcon, Eye, FileText, ArrowRight } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface MeshPreviewProps {
  file: File | null;
}

const MeshPreview: React.FC<MeshPreviewProps> = ({ file }) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  React.useEffect(() => {
    if (!file) {
      setGeometry(null);
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
        setGeometry(geometry);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, [file]);

  if (!geometry) {
    return (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No preview available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          maxDistance={20}
          minDistance={1}
        />
      </Canvas>
    </div>
  );
};

interface FileUploadProps {
  title: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadSection: React.FC<FileUploadProps> = ({ title, file, onFileChange }) => {
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

      {file && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="h-4 w-4" />
            Preview (scroll to zoom, drag to rotate/pan):
          </div>
          <MeshPreview file={file} />
        </div>
      )}
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
        // Convert files to ArrayBuffer for more efficient storage
        const arrayBuffer1 = await file1.arrayBuffer();
        const arrayBuffer2 = await file2.arrayBuffer();
        
        // Store as base64 but with compression-friendly approach
        const base64_1 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer1)));
        const base64_2 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer2)));
        
        // Store in sessionStorage instead of localStorage for temporary storage
        sessionStorage.setItem('mesh1', base64_1);
        sessionStorage.setItem('mesh2', base64_2);
        sessionStorage.setItem('mesh1Name', file1.name);
        sessionStorage.setItem('mesh2Name', file2.name);
        
        navigate('/viewer');
      } catch (error) {
        console.error('Error processing files:', error);
        // Fallback: try to store files in a more memory-efficient way
        alert('Files are too large for browser storage. Please use smaller STL files.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">STL Mesh Viewer</h1>
          <p className="text-lg text-gray-600">Upload your STL files to visualize them in 3D</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FileUploadSection
            title="Mesh File 1"
            file={file1}
            onFileChange={setFile1}
          />
          <FileUploadSection
            title="Mesh File 2"
            file={file2}
            onFileChange={setFile2}
          />
        </div>

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
