import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface HeroDiaper3DProps {
    size: number;
}

// Reusable vector to avoid GC pressure in useFrame (called 60x/sec)
const _targetScale = new THREE.Vector3();

function Model({ size }: { size: number }) {
    const { scene: originalScene } = useGLTF('/assets/diaper_model.glb');

    // Clone the scene to ensure persistent visibility during SPA navigation.
    // Primitives in R3F can only belong to one parent; cloning ensures fresh references.
    const scene = useMemo(() => {
        const clone = originalScene.clone();
        // Traverse original materials to copy over any color adjustments if needed
        // but since we're doing it in useEffect on the clone, it's safer.
        return clone;
    }, [originalScene]);

    const group = useRef<THREE.Group>(null);

    // Apply color correction once on mount or when scene changes
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    mats.forEach(m => {
                        const mat = m as THREE.MeshStandardMaterial;
                        // Use a soft off-white to allow highlights to be visible
                        if (mat.color) mat.color.set('#fafafa');
                        // softer roughness for fabric-like texture, slightly higher for better shadow catching
                        if (mat.roughness !== undefined) mat.roughness = 0.65;
                        if (mat.metalness !== undefined) mat.metalness = 0.05;
                        // enhance lighting response
                        mat.envMapIntensity = 1.2;
                    });
                }
            }
        });
    }, [scene]);

    // Scale: Size 1 → 1.45, Size 6 → 2.2
    const targetScale = useMemo(() => 1.45 + (size - 1) * 0.15, [size]);

    useFrame(() => {
        if (!group.current) return;
        // Reuse vector instead of creating new one each frame
        _targetScale.set(targetScale, targetScale, targetScale);
        group.current.scale.lerp(_targetScale, 0.1);
    });

    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} />
        </group>
    );
}

function LoadingFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-3 border-[#E84B8A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[10px] text-gray-400">جاري تحميل المجسم...</p>
            </div>
        </div>
    );
}

export default function HeroDiaper3D({ size }: HeroDiaper3DProps) {
    return (
        <div className="w-full h-[350px] sm:h-[450px] lg:h-[500px] relative mt-[-20px] sm:mt-[-50px]">
            <Suspense fallback={<LoadingFallback />}>
                <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
                    <PerspectiveCamera makeDefault position={[0, 0.5, 5.5]} fov={38} />

                    <OrbitControls
                        enableZoom={false}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 1.5}
                        autoRotate
                        autoRotateSpeed={0.5}
                    />

                    {/* Optimized Studio Lighting for depth and contrast */}
                    <ambientLight intensity={0.6} />
                    <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#E84B8A" />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={4} color="#ffffff" />
                    <pointLight position={[-10, -5, -10]} intensity={2} color="#8BD7EF" />
                    <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
                    <directionalLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />

                    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
                        <Model size={size} />
                    </Float>
                </Canvas>
            </Suspense>

            {/* CSS shadow instead of GPU ContactShadows */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/10 rounded-[50%] blur-md" />


        </div>
    );
}

useGLTF.preload('/assets/diaper_model.glb');
