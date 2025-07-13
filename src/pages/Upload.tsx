
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (file1 && file2) {
      setIsSubmitting(true);
      try {
        console.log('Submitting files to API:', file1.name, file2.name);
        
        const formData = new FormData();
        formData.append('mesh1', file1);
        formData.append('mesh2', file2);

        // const response = await fetch('http://34.134.57.141:8000/context_pipeline', {
        //   method: 'POST',
        //   body: formData,
        // });

        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // const apiData = await response.json();
        const apiData = {
    "mesh1": {
        "is_lower": false,
        "centers": {
            "0": {
                "prep": 0,
                "num": 8,
                "center": [
                    13.972716013590496,
                    28.874358495076496,
                    -7.2957695325215655
                ]
            },
            "1": {
                "prep": 0,
                "num": 1,
                "center": [
                    17.147003809611004,
                    22.4296137491862,
                    -6.625541845957439
                ]
            },
            "2": {
                "prep": 0,
                "num": -1,
                "center": [
                    -27.87714258829753,
                    14.992266654968262,
                    -8.217494010925293
                ]
            },
            "3": {
                "prep": 0,
                "num": 9,
                "center": [
                    9.96170425415039,
                    35.24715805053711,
                    -9.481896082560223
                ]
            },
            "4": {
                "prep": 1,
                "num": 12,
                "center": [
                    -12.27313009897868,
                    39.499619801839195,
                    -9.315000851949057
                ]
            },
            "5": {
                "prep": 1,
                "num": 11,
                "center": [
                    -3.460191011428833,
                    41.300444285074875,
                    -9.04151217142741
                ]
            },
            "6": {
                "prep": 1,
                "num": 10,
                "center": [
                    4.280679861704509,
                    39.128387451171875,
                    -8.016834894816082
                ]
            },
            "7": {
                "prep": 1,
                "num": 13,
                "center": [
                    -17.52207056681315,
                    35.32466125488281,
                    -8.93694845835368
                ]
            },
            "8": {
                "prep": 0,
                "num": 6,
                "center": [
                    -29.31557909647624,
                    5.085844039916992,
                    -7.397113641103109
                ]
            },
            "9": {
                "prep": 1,
                "num": -1,
                "center": [
                    -24.06572723388672,
                    31.36399714152018,
                    -6.939029852549235
                ]
            },
            "10": {
                "prep": 0,
                "num": -1,
                "center": [
                    -25.735349655151367,
                    23.512896855672203,
                    -5.105265458424887
                ]
            },
            "11": {
                "prep": 0,
                "num": -1,
                "center": [
                    20.77125358581543,
                    15.68517812093099,
                    -6.6283787091573085
                ]
            }
        }
    },
    "mesh2": {
        "is_lower": true,
        "centers": {
            "0": {
                "prep": 0,
                "num": 5,
                "center": [
                    13.949817339579266,
                    23.537224451700848,
                    -12.73359235127767
                ]
            },
            "1": {
                "prep": 0,
                "num": 13,
                "center": [
                    -28.55599021911621,
                    7.4773268699646,
                    -12.120619773864746
                ]
            },
            "2": {
                "prep": 0,
                "num": 11,
                "center": [
                    -23.761685053507485,
                    22.44250551859538,
                    -10.599377950032553
                ]
            },
            "3": {
                "prep": 0,
                "num": 7,
                "center": [
                    20.833663304646812,
                    8.91879192988078,
                    -10.270065307617188
                ]
            },
            "4": {
                "prep": 0,
                "num": 12,
                "center": [
                    -25.4768861134847,
                    15.491937637329102,
                    -11.95643424987793
                ]
            },
            "5": {
                "prep": 0,
                "num": 10,
                "center": [
                    -20.67736371358236,
                    29.8972536722819,
                    -10.946327845255535
                ]
            },
            "6": {
                "prep": 0,
                "num": 3,
                "center": [
                    6.124154567718506,
                    35.43918863932292,
                    -10.583480834960938
                ]
            },
            "7": {
                "prep": 0,
                "num": 4,
                "center": [
                    10.619296073913574,
                    30.341175715128582,
                    -10.102423350016277
                ]
            },
            "8": {
                "prep": 0,
                "num": 1,
                "center": [
                    -4.906789779663086,
                    37.26030349731445,
                    -14.78563944498698
                ]
            },
            "9": {
                "prep": 0,
                "num": 8,
                "center": [
                    -11.288938840230308,
                    36.38158925374349,
                    -14.854993184407551
                ]
            },
            "10": {
                "prep": 0,
                "num": 9,
                "center": [
                    -16.145054499308266,
                    34.68706258138021,
                    -12.05445416768392
                ]
            },
            "11": {
                "prep": 0,
                "num": 2,
                "center": [
                    0.44040214022000623,
                    36.89807764689128,
                    -14.111935297648113
                ]
            },
            "12": {
                "prep": 0,
                "num": 6,
                "center": [
                    18.30677604675293,
                    16.870755513509117,
                    -15.121723175048828
                ]
            }
        }
    },
    "id": "5a3898c8-1c23-4990-92e3-a030f34b0acd"
};
        console.log('API Response:', apiData);

        navigate('/viewer', {
          state: {
            file1: file1,
            file2: file2,
            mesh1Name: file1.name,
            mesh2Name: file2.name,
            apiData: apiData
          }
        });
      } catch (error) {
        console.error('Error submitting files:', error);
        alert('Error processing files. Please try again.');
      } finally {
        setIsSubmitting(false);
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
            disabled={!file1 || !file2 || isSubmitting}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            {isSubmitting ? 'Processing...' : 'Submit'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
