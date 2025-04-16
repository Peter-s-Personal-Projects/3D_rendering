'use client';
import { useState, useMemo } from 'react';
import * as THREE from 'three';

export default function Building({ building, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { geometry, properties } = building;
  const coords = geometry.coordinates[0];

  const center = coords.reduce(
    (acc, [lon, lat]) => [acc[0] + lon / coords.length, acc[1] + lat / coords.length],
    [0, 0]
  );
  const points = coords.map(([lon, lat]) => [
    (lon - center[0]) * 10000,
    (lat - center[1]) * 10000,
  ]);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      s.lineTo(points[i][0], points[i][1]);
    }
    return s;
  }, [points]);

  const extrudeSettings = {
    depth: parseFloat(properties.height) || 10,
    bevelEnabled: false,
  };

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color={hovered ? '#FFFF00' : properties.building === 'commercial' ? '#0000FF' : '#808080'}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}