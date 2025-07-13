
import React from 'react';
import * as THREE from 'three';

interface MarkerData {
  prep: number;
  num: number;
  center: [number, number, number];
}

interface CoordinateMarkersProps {
  centers: Record<string, MarkerData>;
  meshName: string;
}

const COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8000', '#8000ff', '#00ff80', '#ff0080', '#80ff00', '#0080ff',
  '#ff4040', '#40ff40', '#4040ff', '#ffff40', '#ff40ff', '#40ffff'
];

const CoordinateMarkers: React.FC<CoordinateMarkersProps> = ({ centers, meshName }) => {
  const getColorForNum = (num: number) => {
    const index = Math.abs(num) % COLORS.length;
    return COLORS[index];
  };

  return (
    <>
      {Object.entries(centers).map(([key, data]) => {
        const color = getColorForNum(data.num);
        return (
          <mesh key={`${meshName}-${key}`} position={data.center}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.3} 
            />
          </mesh>
        );
      })}
    </>
  );
};

export default CoordinateMarkers;
