
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, ArrowRight } from 'lucide-react';
import DualMeshPreview from '@/components/DualMeshPreview';
import FileUploadSection from '@/components/FileUploadSection';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (file1 && file2) {
      try {
        // Convert files to base64 for storage
        const arrayBuffer1 = await file1.arrayBuffer();
        const arrayBuffer2 = await file2.arrayBuffer();
        
        const base64_1 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer1)));
        const base64_2 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer2)));
        
        // Store in sessionStorage
        sessionStorage.setItem('mesh1', base64_1);
        sessionStorage.setItem('mesh2', base64_2);
        sessionStorage.setItem('mesh1Name', file1.name);
        sessionStorage.setItem('mesh2Name', file2.name);
        
        console.log('Files stored in sessionStorage, navigating to viewer...');
        navigate('/viewer');
      } catch (error) {
        console.error('Error processing files:', error);
        alert('Error processing files. Please try again.');
      }
    } else {
      alert('Please upload both STL files before proceeding.');
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
