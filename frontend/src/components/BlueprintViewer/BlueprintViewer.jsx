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
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 2]} />
        <Suspense fallback={null}>
          <BuildingModel />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
      <p className="blueprint-label">Koncept Blueprint Building</p>
    </div>
  );
};

export default BlueprintViewer;
