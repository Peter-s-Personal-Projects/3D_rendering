'use client';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import axios from 'axios';
import Building from '../components/Building';

export default function Home() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/buildings')
      .then((response) => {
        setBuildings(response.data.features || []);
      })
      .catch((error) => {
        console.error('Error fetching buildings:', error);
      });
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        onClick={() => setSelectedBuilding(null)}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        <group>
          {buildings.map((building) => (
            <Building
              key={building.id}
              building={building}
              onClick={() => setSelectedBuilding(building)}
            />
          ))}
        </group>
        <OrbitControls />
      </Canvas>
      {selectedBuilding && (
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm">
          <h3 className="text-lg font-semibold mb-2">Building Info</h3>
          <p className="text-sm">
            <span className="font-medium">Address:</span> {selectedBuilding.properties.address || 'Unknown'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Type:</span> {selectedBuilding.properties.building}
          </p>
          <p className="text-sm">
            <span className="font-medium">Height:</span> {selectedBuilding.properties.height}m
          </p>
          <button
            onClick={() => setSelectedBuilding(null)}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <input
          type="text"
          placeholder="e.g., commercial buildings"
          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
          Search
        </button>
      </div>
    </div>
  );
}