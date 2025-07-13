
import React from 'react';
import { Card } from '@/components/ui/card';

interface MarkerData {
  prep: number;
  num: number;
  center: [number, number, number];
}

interface CoordinateLegendProps {
  mesh1Centers?: Record<string, MarkerData>;
  mesh2Centers?: Record<string, MarkerData>;
  mesh1Name: string;
  mesh2Name: string;
}

const COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8000', '#8000ff', '#00ff80', '#ff0080', '#80ff00', '#0080ff',
  '#ff4040', '#40ff40', '#4040ff', '#ffff40', '#ff40ff', '#40ffff'
];

const CoordinateLegend: React.FC<CoordinateLegendProps> = ({ 
  mesh1Centers, 
  mesh2Centers, 
  mesh1Name, 
  mesh2Name 
}) => {
  const getColorForNum = (num: number) => {
    const index = Math.abs(num) % COLORS.length;
    return COLORS[index];
  };

  const renderCenters = (centers: Record<string, MarkerData> | undefined, meshName: string) => {
    if (!centers) return null;
    
    return Object.entries(centers).map(([key, data]) => {
      const color = getColorForNum(data.num);
      return (
        <div key={`${meshName}-${key}`} className="flex items-center gap-2 text-xs">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          ></div>
          <span>Point {data.num} (prep: {data.prep})</span>
        </div>
      );
    });
  };

  return (
    <Card className="p-4 bg-gray-700 border-gray-600">
      <h3 className="text-sm font-medium mb-4 text-gray-200">Coordinate Points</h3>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {mesh1Centers && (
          <div>
            <h4 className="text-xs font-semibold text-blue-400 mb-2">{mesh1Name}</h4>
            <div className="space-y-1">
              {renderCenters(mesh1Centers, mesh1Name)}
            </div>
          </div>
        )}
        {mesh2Centers && (
          <div>
            <h4 className="text-xs font-semibold text-green-400 mb-2">{mesh2Name}</h4>
            <div className="space-y-1">
              {renderCenters(mesh2Centers, mesh2Name)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CoordinateLegend;
