import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import "./BlueprintViewer.css";

const BuildingModel = () => {
  const gltf = useGLTF("/building.glb");

  // Optional: center the model
  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.side = THREE.DoubleSide;
    }
  });

  // Apply transform to center + scale
  return (
    <group position={[0, -1.5, 0]} rotation={[0, Math.PI, 0]} scale={0.007}>
      <primitive object={model} />
    </group>
  );
};

const BlueprintViewer = () => {
  return (
    <div className="blueprint-wrapper">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 4]} intensity={1.5} castShadow />
        <Suspense fallback={<Html><p style={{ color: 'white' }}>Loading...</p></Html>}>
          <BuildingModel />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.5}
          target={[0, 0, 0]}
        />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
