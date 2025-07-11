
import React from 'react';
import { Card } from '@/components/ui/card';
import { UploadIcon, FileText } from 'lucide-react';

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

export default FileUploadSection;
