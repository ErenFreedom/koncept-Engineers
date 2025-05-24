import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./BlueprintViewer.css";

const BuildingModel = () => {
  const gltf = useGLTF("/building.glb", true); // ⬅️ Your public/ file
  return <primitive object={gltf.scene} scale={2.5} rotation={[0, Math.PI, 0]} />;
};

const BlueprintViewer = () => {
    return (
      <div className="blueprint-wrapper">
        <Canvas camera={{ position: [0, 1.5, 4], fov: 40 }}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="skyblue" />
          </mesh>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
        <p className="blueprint-label">Koncept Blueprint Building</p>
      </div>
    );
  };
  

export default BlueprintViewer;
