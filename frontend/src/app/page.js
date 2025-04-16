'use client';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import axios from 'axios';
import Building from '../components/Building';

export default function Home() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [origin, setOrigin] = useState([0, 0]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/buildings')
      .then((response) => {
        const features = response.data.features || [];
        setBuildings(features);
  
        // Calculate the global origin (e.g., average of all coords)
        const allCoords = features.flatMap(f => f.geometry.coordinates[0]);
        const avg = allCoords.reduce(
          (acc, [lon, lat]) => [acc[0] + lon / allCoords.length, acc[1] + lat / allCoords.length],
          [0, 0]
        );
        setOrigin(avg);
      })
      .catch((error) => {
        console.error('Error fetching buildings:', error);
      });
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        // onClick={() => setSelectedBuilding(building)}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {buildings.map((building) => (
            console.log('Rendering building:', building.id),
            <Building
              key={building.id}
              building={building}
              origin={origin}
              onClick={() => setSelectedBuilding(building)}
            />
          ))}
        </group>
        <OrbitControls />
      </Canvas>
      {selectedBuilding && (
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm">
          <h3 className="text-lg text-black font-semibold mb-2">Building Info</h3>
          <p className="text-sm">
            <span className="font-medium text-black">Address:</span> {selectedBuilding.properties.address || 'Unknown'}
          </p>
          <p className="text-sm">
            <span className="font-medium text-black">Type:</span> {selectedBuilding.properties.building}
          </p>
          <p className="text-sm">
            <span className="font-medium text-black">Height:</span> {selectedBuilding.properties.height}m
          </p>
          <button
            onClick={() => setSelectedBuilding(building)}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
      
    </div>
  );
}