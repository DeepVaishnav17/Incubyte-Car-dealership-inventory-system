import { useRef, useEffect, useState, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    useGLTF, Environment, ContactShadows,
    useProgress, Html, PerspectiveCamera
} from '@react-three/drei';
import {
    EffectComposer, Bloom, DepthOfField, Vignette
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';

// ── Ferrari GLB (Three.js official example model, PBR) ────────────────────
const CAR_URL = 'https://threejs.org/examples/models/gltf/ferrari.glb';
useGLTF.preload(CAR_URL);

// ── Loading overlay ────────────────────────────────────────────────────────
function LoadingOverlay({ progress }) {
    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#000',
            transition: 'opacity 0.5s ease',
        }}>
            {/* Logo */}
            <div style={{
                width: '56px', height: '56px',
                background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                borderRadius: '16px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(59,130,246,0.4)',
                marginBottom: '2rem',
            }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
                </svg>
            </div>

            <div style={{ width: '220px', marginBottom: '1rem' }}>
                <div style={{
                    height: '2px', background: 'rgba(255,255,255,0.07)',
                    borderRadius: '999px', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        borderRadius: '999px',
                        boxShadow: '0 0 10px rgba(59,130,246,0.7)',
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#334155', textTransform: 'uppercase' }}>
                Loading assets — {Math.round(progress)}%
            </p>
        </div>
    );
}

// ── Sports car scene component ─────────────────────────────────────────────
function SportsCar({ wheelSpeed }) {
    const { scene } = useGLTF(CAR_URL);
    const wheelsRef = useRef([]);
    const bodyRef = useRef(null);

    useEffect(() => {
        wheelsRef.current = [];
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.envMapIntensity = 2;
                    child.material.needsUpdate = true;
                }
                // Collect wheel meshes by name
                const n = child.name.toLowerCase();
                if (n.includes('wheel') || n.includes('tyre') || n.includes('tire')) {
                    wheelsRef.current.push(child);
                }
            }
        });
        bodyRef.current = scene;
    }, [scene]);

    useFrame((_, delta) => {
        wheelsRef.current.forEach(w => {
            w.rotation.x -= delta * wheelSpeed.current;
        });
    });

    return (
        <primitive
            object={scene}
            scale={[0.4, 0.4, 0.4]}
            position={[0, 0.05, 0]}
            rotation={[0, Math.PI, 0]}
        />
    );
}

// ── Headlights ─────────────────────────────────────────────────────────────
function Headlights({ on }) {
    const intensity = on ? 4 : 0;
    return (
        <>
            <spotLight
                position={[-0.6, 0.35, -1.4]}
                angle={0.4} penumbra={0.4}
                intensity={intensity} color="#fef9e7"
                distance={14} castShadow={false}
            />
            <spotLight
                position={[0.6, 0.35, -1.4]}
                angle={0.4} penumbra={0.4}
                intensity={intensity} color="#fef9e7"
                distance={14} castShadow={false}
            />
            {on && (
                <>
                    <pointLight position={[-0.6, 0.35, -1.6]} intensity={0.8} color="#fff8dc" distance={4} />
                    <pointLight position={[0.6, 0.35, -1.6]} intensity={0.8} color="#fff8dc" distance={4} />
                </>
            )}
        </>
    );
}

// ── Post-processing ─────────────────────────────────────────────────────────
function Effects({ bloomIntensity, dofEnabled }) {
    return (
        <EffectComposer multisampling={4}>
            <Bloom
                intensity={bloomIntensity}
                luminanceThreshold={0.25}
                luminanceSmoothing={0.85}
                blendFunction={BlendFunction.SCREEN}
            />
            {dofEnabled && (
                <DepthOfField
                    focusDistance={0.012}
                    focalLength={0.025}
                    bokehScale={2.5}
                    height={480}
                />
            )}
            <Vignette
                offset={0.2}
                darkness={0.9}
                eskil={false}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}

// ── GSAP Camera animation ───────────────────────────────────────────────────
function CameraRig({ onPhase, onDone, wheelSpeed, bloomRef }) {
    const { camera } = useThree();
    const lookAt = useRef(new THREE.Vector3(0, 0.4, 0));
    const shake = useRef({ x: 0, y: 0 });

    useEffect(() => {
        camera.position.set(0, 3.5, 18);
        camera.lookAt(0, 0.4, 0);

        const tl = gsap.timeline({ delay: 0.3 });

        // ① Slow dolly in — reveal the car
        tl.to(camera.position, {
            z: 8, y: 2,
            duration: 2.2,
            ease: 'power2.inOut',
            onStart: () => onPhase('reveal'),
        })

        // ② Engine turn-on & headlights — camera shakes
        .to(shake.current, {
            x: 0.012, y: 0.008,
            duration: 0.15,
            yoyo: true, repeat: 9,
            ease: 'none',
            onStart: () => onPhase('headlights'),
        })

        // ③ Orbit to side — cinematic sweep
        .to(camera.position, {
            x: 3.5, z: 5, y: 1.4,
            duration: 1.8,
            ease: 'power1.inOut',
            onStart: () => {
                wheelSpeed.current = 2.5;
            },
        }, '-=0.1')

        .to(lookAt.current, {
            x: 0.5, y: 0.3,
            duration: 1.8,
            ease: 'power1.inOut',
        }, '<')

        // ④ Swing back front — car is moving
        .to(camera.position, {
            x: 0, z: 4.5, y: 1.1,
            duration: 1.2,
            ease: 'power2.inOut',
        })

        .to(lookAt.current, {
            x: 0, y: 0.4,
            duration: 1.2,
            ease: 'power2.inOut',
        }, '<')

        // ⑤ Low-angle dramatic shot
        .to(camera.position, {
            x: 0, z: 3.2, y: 0.3,
            duration: 0.9,
            ease: 'power2.in',
            onStart: () => {
                wheelSpeed.current = 6;
                onPhase('rush');
                gsap.to(bloomRef, { current: 2.5, duration: 0.9 });
            },
        })

        .to(lookAt.current, {
            y: 0.2,
            duration: 0.9,
            ease: 'power2.in',
        }, '<')

        // ⑥ Final rush — camera nearly hit
        .to(camera.position, {
            z: 0.35, y: 0.15,
            duration: 0.55,
            ease: 'expo.in',
            onStart: () => wheelSpeed.current = 18,
            onComplete: onDone,
        });

        return () => tl.kill();
    }, []);

    useFrame((state) => {
        camera.lookAt(lookAt.current);
        // Subtle organic camera float
        const t = state.clock.elapsedTime;
        camera.position.x += (shake.current.x * (Math.random() - 0.5));
        camera.position.y += (shake.current.y * (Math.random() - 0.5));
        camera.position.x += Math.sin(t * 0.18) * 0.003;
        camera.position.y += Math.cos(t * 0.24) * 0.002;
    });

    return null;
}

// ── 3D Scene ────────────────────────────────────────────────────────────────
function Scene({ onPhase, onDone, wheelSpeed, bloomRef }) {
    const [headlightsOn, setHeadlightsOn] = useState(false);

    const handlePhase = useCallback((p) => {
        if (p === 'headlights') setHeadlightsOn(true);
        onPhase(p);
    }, [onPhase]);

    return (
        <>
            {/* Camera */}
            <PerspectiveCamera makeDefault fov={45} near={0.05} far={500} />

            {/* Environment */}
            <Environment preset="night" />

            {/* Ambient */}
            <ambientLight intensity={0.08} />
            <directionalLight
                position={[5, 8, 5]} intensity={0.6}
                color="#b0c4de" castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-5, 3, -5]} intensity={0.2} color="#4169e1" />

            {/* Ground rim light */}
            <pointLight position={[0, -0.2, 0]} intensity={0.3} color="#1a237e" distance={5} />

            {/* Headlights */}
            <Headlights on={headlightsOn} />

            {/* The car */}
            <Suspense fallback={null}>
                <SportsCar wheelSpeed={wheelSpeed} />
            </Suspense>

            {/* Ground shadows */}
            <ContactShadows
                position={[0, -0.001, 0]}
                opacity={0.7}
                scale={8}
                blur={2.5}
                far={4}
                color="#000010"
            />

            {/* Subtle reflective floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial
                    color="#050510"
                    metalness={0.8}
                    roughness={0.6}
                    envMapIntensity={0.5}
                />
            </mesh>

            {/* Camera rig */}
            <CameraRig
                onPhase={handlePhase}
                onDone={onDone}
                wheelSpeed={wheelSpeed}
                bloomRef={bloomRef}
            />

            {/* Post FX */}
            <Effects bloomIntensity={0.8} dofEnabled={true} />
        </>
    );
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function CinematicSplash({ onComplete }) {
    const { progress, loaded, total } = useProgress();
    const wheelSpeed = useRef(0);
    const bloomRef = useRef(0.8);
    const [phase, setPhase] = useState('loading');
    const [flash, setFlash] = useState(false);
    const [logoVisible, setLogoVisible] = useState(false);
    const [done, setDone] = useState(false);
    const [modelReady, setModelReady] = useState(false);

    // Once model is loaded, let scene know
    useEffect(() => {
        if (loaded >= total && total > 0) {
            setModelReady(true);
        }
    }, [loaded, total]);

    const handleDone = useCallback(() => {
        // Flash sequence
        setFlash(true);
        setTimeout(() => {
            setFlash(false);
            setLogoVisible(true);
            setTimeout(() => {
                setDone(true);
                setTimeout(onComplete, 600);
            }, 1400);
        }, 250);
    }, [onComplete]);

    // Fallback: if loading takes >12s, just complete
    useEffect(() => {
        const t = setTimeout(() => {
            if (!done) onComplete();
        }, 14000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#000',
            opacity: done ? 0 : 1,
            transition: done ? 'opacity 0.6s ease' : 'none',
        }}>
            {/* 3D Canvas */}
            <Canvas
                shadows="soft"
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.4,
                    powerPreference: 'high-performance',
                }}
                style={{ position: 'absolute', inset: 0 }}
            >
                <Suspense fallback={null}>
                    <Scene
                        onPhase={setPhase}
                        onDone={handleDone}
                        wheelSpeed={wheelSpeed}
                        bloomRef={bloomRef}
                    />
                </Suspense>
            </Canvas>

            {/* Loading progress overlay */}
            {progress < 100 && (
                <LoadingOverlay progress={progress} />
            )}

            {/* Flash */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 20,
                background: 'white',
                opacity: flash ? 1 : 0,
                pointerEvents: 'none',
                transition: flash ? 'none' : 'opacity 0.4s ease',
            }} />

            {/* Logo reveal */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 15,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                opacity: logoVisible ? 1 : 0,
                transform: logoVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
                transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(12px)',
            }}>
                <div style={{
                    width: '80px', height: '80px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 80px rgba(59,130,246,0.5), 0 0 160px rgba(59,130,246,0.2)',
                    marginBottom: '1.5rem',
                }}>
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                    </svg>
                </div>
                <h1 style={{
                    fontSize: '2.75rem', fontWeight: 900,
                    letterSpacing: '-0.05em', color: '#fff',
                    textShadow: '0 0 60px rgba(59,130,246,0.5)',
                    marginBottom: '0.5rem', lineHeight: 1,
                    fontFamily: "'Inter', sans-serif",
                }}>
                    INCUBYTE
                </h1>
                <p style={{
                    fontSize: '0.75rem', letterSpacing: '0.4em',
                    color: 'rgba(148,163,184,0.7)',
                    textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    Dealership
                </p>

                {/* Animated bottom line */}
                <div style={{
                    width: logoVisible ? '200px' : '0px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, transparent)',
                    marginTop: '2rem',
                    transition: 'width 1.2s ease 0.3s',
                    boxShadow: '0 0 10px rgba(59,130,246,0.6)',
                }} />
            </div>
        </div>
    );
}
