import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    Environment,
    ContactShadows,
    Html,
    Float,
    Sparkles,
    MeshDistortMaterial,
} from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Machine3DProps {
    machineId: string;
    type: string;
    status: 'active' | 'maintenance' | 'failure';
    temperature?: number;
    vibration?: number;
}

// ─── Status palette ─────────────────────────────────────────────────────────

const STATUS_COLOR = {
    active: '#22c55e',
    maintenance: '#f59e0b',
    failure: '#ef4444',
} as const;

// ─── Machine visual profiles (one per recognized type) ───────────────────────

interface MachineProfile {
    /** Base chassis color (hex) */
    bodyColor: string;
    /** Accent / LED color */
    accentColor: string;
    /** Emissive base intensity */
    emissiveIntensity: number;
    /** Metalness of chassis */
    metalness: number;
    /** Roughness of chassis */
    roughness: number;
    /** Body scale [x, y, z] */
    bodyScale: [number, number, number];
}

function getProfile(type: string): MachineProfile {
    const t = type.toLowerCase();

    if (t.includes('compresseur') || t.includes('compressor')) {
        return { bodyColor: '#1e3a5f', accentColor: '#38bdf8', emissiveIntensity: 1.8, metalness: 0.92, roughness: 0.08, bodyScale: [1.1, 1.5, 1.1] };
    }
    if (t.includes('turbine')) {
        return { bodyColor: '#3b1a1a', accentColor: '#f97316', emissiveIntensity: 2.0, metalness: 0.95, roughness: 0.05, bodyScale: [0.9, 1.2, 0.9] };
    }
    if (t.includes('géné') || t.includes('gene') || t.includes('generator')) {
        return { bodyColor: '#1a2e1a', accentColor: '#4ade80', emissiveIntensity: 1.6, metalness: 0.85, roughness: 0.15, bodyScale: [1.3, 1.0, 1.0] };
    }
    if (t.includes('pompe') || t.includes('pump')) {
        return { bodyColor: '#2a1a3e', accentColor: '#a78bfa', emissiveIntensity: 1.5, metalness: 0.88, roughness: 0.12, bodyScale: [0.85, 1.1, 0.85] };
    }
    if (t.includes('moteur') || t.includes('motor')) {
        return { bodyColor: '#2e1a00', accentColor: '#fbbf24', emissiveIntensity: 1.4, metalness: 0.9, roughness: 0.1, bodyScale: [1.0, 1.25, 1.0] };
    }
    if (t.includes('convoyeur') || t.includes('conveyor')) {
        return { bodyColor: '#1a1a1a', accentColor: '#e2e8f0', emissiveIntensity: 1.2, metalness: 0.75, roughness: 0.25, bodyScale: [1.8, 0.7, 0.8] };
    }
    if (t.includes('robot') || t.includes('bras') || t.includes('arm')) {
        return { bodyColor: '#0f172a', accentColor: '#818cf8', emissiveIntensity: 2.2, metalness: 0.96, roughness: 0.04, bodyScale: [0.7, 1.8, 0.7] };
    }
    if (t.includes('four') || t.includes('four') || t.includes('furnace')) {
        return { bodyColor: '#3a1500', accentColor: '#fb923c', emissiveIntensity: 2.5, metalness: 0.7, roughness: 0.3, bodyScale: [1.2, 1.2, 1.2] };
    }
    // default — "machine outil"
    return { bodyColor: '#1c2333', accentColor: '#465fff', emissiveIntensity: 1.6, metalness: 0.88, roughness: 0.12, bodyScale: [1.0, 1.0, 1.0] };
}

// ─── Shared sub-components ───────────────────────────────────────────────────

/** Animated fan with N blades */
function RotatingFan({
    position,
    radius = 0.28,
    active,
    speed = 8,
}: {
    position: [number, number, number];
    radius?: number;
    active: boolean;
    speed?: number;
}) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (ref.current && active) ref.current.rotation.z += dt * speed;
    });
    return (
        <group position={position}>
            {/* Ring frame */}
            <mesh>
                <torusGeometry args={[radius + 0.045, 0.025, 8, 32]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Blades */}
            <group ref={ref}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <mesh key={i} rotation={[0, 0, (i / 6) * Math.PI * 2]}>
                        <boxGeometry args={[radius * 1.6, 0.055, 0.025]} />
                        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                    </mesh>
                ))}
                {/* Hub */}
                <mesh>
                    <cylinderGeometry args={[0.038, 0.038, 0.06, 12]} />
                    <meshStandardMaterial color="#444" metalness={0.85} roughness={0.15} />
                </mesh>
            </group>
        </group>
    );
}

/** Pulsing LED strip along an edge */
function LEDStrip({
    position,
    rotation,
    color,
    length = 1.0,
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    color: string;
    length?: number;
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((s) => {
        if (ref.current) {
            const m = ref.current.material as THREE.MeshStandardMaterial;
            m.emissiveIntensity = 1.2 + Math.sin(s.clock.elapsedTime * 2.5) * 0.6;
        }
    });
    return (
        <mesh
            ref={ref}
            position={position}
            rotation={rotation ? new THREE.Euler(...rotation) : undefined}
        >
            <boxGeometry args={[length, 0.012, 0.012]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5}
                toneMapped={false}
            />
        </mesh>
    );
}

/** Vent slot row on one face */
function VentRow({
    position,
    rotation,
    count = 4,
    slotWidth = 0.22,
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    count?: number;
    slotWidth?: number;
}) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
            {Array.from({ length: count }).map((_, i) => (
                <mesh key={i} position={[0, (i - (count - 1) / 2) * 0.1, 0]}>
                    <boxGeometry args={[slotWidth, 0.035, 0.02]} />
                    <meshStandardMaterial color="#0a0a0a" metalness={0.7} roughness={0.3} />
                </mesh>
            ))}
        </group>
    );
}

/** Glowing core orb */
function CoreOrb({
    color,
    coreShape,
    distort = false,
}: {
    color: string;
    coreShape: 'sphere' | 'octahedron' | 'torus' | 'cylinder' | 'cone';
    distort?: boolean;
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((s) => {
        if (ref.current) {
            ref.current.rotation.y += 0.008;
            ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.7) * 0.25;
        }
    });

    const geometry = () => {
        switch (coreShape) {
            case 'torus': return <torusGeometry args={[0.18, 0.07, 12, 48]} />;
            case 'cylinder': return <cylinderGeometry args={[0.14, 0.14, 0.55, 24]} />;
            case 'cone': return <coneGeometry args={[0.18, 0.45, 6]} />;
            case 'octahedron': return <octahedronGeometry args={[0.22]} />;
            default: return <sphereGeometry args={[0.18, 24, 24]} />;
        }
    };

    return (
        <mesh ref={ref}>
            {geometry()}
            {distort ? (
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2.5}
                    distort={0.3}
                    speed={3}
                    toneMapped={false}
                />
            ) : (
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2.5}
                    metalness={0.1}
                    roughness={0.05}
                    toneMapped={false}
                />
            )}
        </mesh>
    );
}

/** Upright pipe accent */
function Pipe({
    position,
    height = 0.8,
    radius = 0.04,
    color = '#333',
}: {
    position: [number, number, number];
    height?: number;
    radius?: number;
    color?: string;
}) {
    return (
        <mesh position={position}>
            <cylinderGeometry args={[radius, radius, height, 8]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
    );
}

// ─── Per-type machine models ──────────────────────────────────────────────────

/** Compresseur — tall cylindrical body, two fans on top, pipes on sides */
function CompresseurModel({ profile, statusColor }: { profile: MachineProfile; statusColor: string }) {
    return (
        <group>
            {/* Main cylinder body */}
            <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.55, 0.6, 1.4, 32]} />
                <meshStandardMaterial color={profile.bodyColor} metalness={profile.metalness} roughness={profile.roughness} />
            </mesh>
            {/* Top dome */}
            <mesh castShadow position={[0, 1.42, 0]}>
                <sphereGeometry args={[0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#111" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Base flange */}
            <mesh receiveShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[0.7, 0.7, 0.12, 32]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* LED ring */}
            <mesh position={[0, 0.9, 0]}>
                <torusGeometry args={[0.56, 0.012, 8, 64]} />
                <meshStandardMaterial color={profile.accentColor} emissive={profile.accentColor} emissiveIntensity={2} toneMapped={false} />
            </mesh>
            {/* Pipes */}
            <Pipe position={[0.68, 0.55, 0]} height={0.7} color="#222" />
            <Pipe position={[-0.68, 0.55, 0]} height={0.7} color="#222" />
            {/* Gauge on front */}
            <mesh position={[0, 0.65, 0.57]}>
                <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Core */}
            <group position={[0, 0.7, 0]}>
                <CoreOrb color={profile.accentColor} coreShape="cylinder" />
            </group>
            {/* Fan top */}
            <RotatingFan position={[0, 1.5, 0]} radius={0.32} active={true} speed={10} />
            {/* Status glow bottom */}
            <pointLight position={[0, -0.1, 0]} color={statusColor} intensity={2.5} distance={2} />
        </group>
    );
}

/** Turbine — wide flat ring + rotating torus + blade details */
function TurbineModel({ profile, statusColor }: { profile: MachineProfile; statusColor: string }) {
    const torusRef = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (torusRef.current) torusRef.current.rotation.z += dt * 3;
    });

    return (
        <group>
            {/* Outer housing ring */}
            <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
                <torusGeometry args={[0.65, 0.22, 12, 48]} />
                <meshStandardMaterial color={profile.bodyColor} metalness={profile.metalness} roughness={profile.roughness} />
            </mesh>
            {/* Center shaft */}
            <mesh castShadow position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.55, 16]} />
                <meshStandardMaterial color="#111" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Base plate */}
            <mesh receiveShadow position={[0, 0.05, 0]}>
                <boxGeometry args={[1.5, 0.1, 0.5]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Mounting bolts */}
            {[-0.55, 0.55].map((x, i) => (
                <mesh key={i} position={[x, 0.05, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.12, 8]} />
                    <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
            {/* LED on torus edge */}
            <LEDStrip position={[0, 0.6, 0.88]} color={profile.accentColor} length={0.01} rotation={[0, 0, 0]} />
            {/* Rotating inner blade ring */}
            <mesh ref={torusRef} position={[0, 0.6, 0]}>
                <torusGeometry args={[0.38, 0.06, 6, 16]} />
                <meshStandardMaterial
                    color={profile.accentColor}
                    emissive={profile.accentColor}
                    emissiveIntensity={profile.emissiveIntensity}
                    metalness={0.3}
                    roughness={0.05}
                    toneMapped={false}
                />
            </mesh>
            {/* Core */}
            <group position={[0, 0.6, 0]}>
                <CoreOrb color={profile.accentColor} coreShape="torus" />
            </group>
            <pointLight position={[0, 0.6, 0]} color={statusColor} intensity={3} distance={2.5} />
        </group>
    );
}

/** Générateur — horizontal elongated body, exhaust on the side */
function GenerateurModel({ profile, statusColor }: { profile: MachineProfile; statusColor: string }) {
    return (
        <group>
            {/* Main body */}
            <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
                <boxGeometry args={[1.6, 0.9, 1.0]} />
                <meshStandardMaterial color={profile.bodyColor} metalness={profile.metalness} roughness={profile.roughness} />
            </mesh>
            {/* Top cover */}
            <mesh castShadow position={[0, 1.05, 0]}>
                <boxGeometry args={[1.65, 0.12, 1.05]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.9} roughness={0.08} />
            </mesh>
            {/* Front panel */}
            <mesh position={[0, 0.6, 0.52]}>
                <boxGeometry args={[0.7, 0.55, 0.015]} />
                <meshStandardMaterial color="#111" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Exhaust cylinder right */}
            <mesh castShadow position={[0.9, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.12, 0.42, 12]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Exhaust cap */}
            <mesh position={[1.12, 0.8, 0]}>
                <cylinderGeometry args={[0.13, 0.09, 0.08, 12]} />
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Vent slats left side */}
            <VentRow position={[-0.82, 0.55, 0]} rotation={[0, Math.PI / 2, 0]} count={5} />
            {/* LED strips along top edges */}
            <LEDStrip position={[0, 1.12, 0.52]} color={profile.accentColor} length={1.6} />
            <LEDStrip position={[0, 1.12, -0.52]} color={profile.accentColor} length={1.6} />
            {/* Core */}
            <group position={[0, 0.55, 0]}>
                <CoreOrb color={profile.accentColor} coreShape="sphere" />
            </group>
            {/* Fan on top */}
            <RotatingFan position={[-0.5, 1.12, 0]} radius={0.22} active={true} speed={7} />
            <RotatingFan position={[0.5, 1.12, 0]} radius={0.22} active={true} speed={6} />
            <pointLight position={[0, 0.5, 0]} color={statusColor} intensity={2} distance={2} />
        </group>
    );
}

/** Pompe — compact, vertical, with inlet/outlet flanges */
function PompeModel({ profile, statusColor }: { profile: MachineProfile; statusColor: string }) {
    return (
        <group>
            {/* Body */}
            <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.45, 0.5, 1.0, 24]} />
                <meshStandardMaterial color={profile.bodyColor} metalness={profile.metalness} roughness={profile.roughness} />
            </mesh>
            {/* Top cap */}
            <mesh castShadow position={[0, 1.12, 0]}>
                <cylinderGeometry args={[0.3, 0.45, 0.15, 24]} />
                <meshStandardMaterial color="#111" metalness={0.92} roughness={0.08} />
            </mesh>
            {/* Base */}
            <mesh receiveShadow position={[0, 0.08, 0]}>
                <boxGeometry args={[1.1, 0.16, 0.85]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Inlet flange — left */}
            <mesh position={[-0.62, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.12, 0.25, 12]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Outlet flange — right bottom */}
            <mesh position={[0.62, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.25, 12]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* LED ring accent */}
            <mesh position={[0, 0.75, 0]}>
                <torusGeometry args={[0.46, 0.01, 6, 48]} />
                <meshStandardMaterial color={profile.accentColor} emissive={profile.accentColor} emissiveIntensity={2} toneMapped={false} />
            </mesh>
            {/* Core */}
            <group position={[0, 0.6, 0]}>
                <CoreOrb color={profile.accentColor} coreShape="sphere" distort />
            </group>
            <pointLight position={[0, 0.6, 0]} color={statusColor} intensity={2} distance={1.8} />
        </group>
    );
}

/** Moteur — classic box, shaft on front, cooling fins */
function MoteurModel({ profile, statusColor }: { profile: MachineProfile; statusColor: string }) {
    return (
        <group>
            {/* Body */}
            <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
                <boxGeometry args={[1.2, 1.1, 1.0]} />
                <meshStandardMaterial color={profile.bodyColor} metalness={profile.metalness} roughness={profile.roughness} />
            </mesh>
            {/* Cooling fins */}
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} castShadow position={[0, 0.6, -0.52 + i * 0.2]}>
                    <boxGeometry args={[1.3, 1.15, 0.025]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.15} />
                </mesh>
            ))}
            {/* Shaft */}
            <mesh castShadow position={[0.73, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.32, 10]} />
                <meshStandardMaterial color="#555" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Terminal box */}
            <mesh castShadow position={[0, 1.2, 0.25]}>
                <boxGeometry args={[0.35, 0.18, 0.28]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* LEDs */}
            <LEDStrip position={[0, 0.06, 0.52]} color={profile.accentColor} length={1.2} />
            <LEDStrip position={[0, 0.06, -0.52]} color={profile.accentColor} length={1.2} />
            {/* Fan at back */}
            <RotatingFan position={[-0.62, 0.6, 0]} radius={0.28} active={true} speed={9} />
            {/* Core */}
            <group position={[0, 0.6, 0]}>
                <CoreOrb color={profile.accentColor} coreShape="octahedron" />
            </group>
            <pointLight position={[0, 0.55, 0]} color={statusColor} intensity={2.2} distance={2} />
        </group>
    );
}

/** Default / generic machine — simple box with a holographic core */
function DefaultModel({ profile, statusColor }: { profile: MachineProfile; statusColor: string }) {
    const [sx, sy, sz] = profile.bodyScale;
    return (
        <group>
            {/* Main body */}
            <mesh castShadow receiveShadow position={[0, sy * 0.5, 0]}>
                <boxGeometry args={[1.2 * sx, sy, 1.2 * sz]} />
                <meshStandardMaterial color={profile.bodyColor} metalness={profile.metalness} roughness={profile.roughness} />
            </mesh>
            {/* Top panel */}
            <mesh castShadow position={[0, sy + 0.03, 0]}>
                <boxGeometry args={[1.25 * sx, 0.05, 1.25 * sz]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.9} roughness={0.08} />
            </mesh>
            {/* Base */}
            <mesh receiveShadow position={[0, 0.04, 0]}>
                <boxGeometry args={[1.3 * sx, 0.08, 1.3 * sz]} />
                <meshStandardMaterial color="#0a0a0a" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Vents */}
            <VentRow position={[0.62 * sx, sy * 0.5, 0]} rotation={[0, Math.PI / 2, 0]} count={4} />
            <VentRow position={[-0.62 * sx, sy * 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} count={4} />
            {/* LED bottom edge */}
            <LEDStrip position={[0, 0.09, 0.62 * sz]} color={profile.accentColor} length={1.2 * sx} />
            <LEDStrip position={[0, 0.09, -0.62 * sz]} color={profile.accentColor} length={1.2 * sx} />
            {/* Fan */}
            <RotatingFan position={[0, sy + 0.06, 0]} radius={0.25} active={true} speed={7} />
            {/* Core */}
            <group position={[0, sy * 0.5, 0]}>
                <CoreOrb color={profile.accentColor} coreShape="octahedron" />
            </group>
            <pointLight position={[0, sy * 0.4, 0]} color={statusColor} intensity={2} distance={2} />
        </group>
    );
}

// ─── Router: choose the right model for the machine type ─────────────────────

function MachineModel({ type, status }: { type: string; status: 'active' | 'maintenance' | 'failure' }) {
    const profile = useMemo(() => getProfile(type), [type]);
    const statusColor = STATUS_COLOR[status];
    const t = type.toLowerCase();

    let Model: React.ReactNode;
    if (t.includes('compresseur') || t.includes('compressor')) {
        Model = <CompresseurModel profile={profile} statusColor={statusColor} />;
    } else if (t.includes('turbine')) {
        Model = <TurbineModel profile={profile} statusColor={statusColor} />;
    } else if (t.includes('géné') || t.includes('gene') || t.includes('generator')) {
        Model = <GenerateurModel profile={profile} statusColor={statusColor} />;
    } else if (t.includes('pompe') || t.includes('pump')) {
        Model = <PompeModel profile={profile} statusColor={statusColor} />;
    } else if (t.includes('moteur') || t.includes('motor')) {
        Model = <MoteurModel profile={profile} statusColor={statusColor} />;
    } else {
        Model = <DefaultModel profile={profile} statusColor={statusColor} />;
    }

    return (
        <>
            {Model}
            {/* Sparkles only when active */}
            {status === 'active' && (
                <Sparkles count={20} scale={2.5} size={0.8} speed={0.3} color={statusColor} opacity={0.4} />
            )}
        </>
    );
}

// ─── Loading placeholder ──────────────────────────────────────────────────────

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Chargement…</p>
            </div>
        </Html>
    );
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function Machine3DView({ machineId, type, status, temperature, vibration }: Machine3DProps) {
    const statusColor = STATUS_COLOR[status];
    const profile = useMemo(() => getProfile(type), [type]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* ── Canvas ── */}
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.6 }}
                style={{ position: 'absolute', inset: 0 }}
            >
                <PerspectiveCamera makeDefault position={[3, 2.6, 3]} fov={45} />

                {/* ── Strong, clear lighting ── */}
                <ambientLight intensity={0.7} />
                {/* Key light — bright warm-white */}
                <spotLight
                    position={[5, 8, 5]}
                    angle={0.25}
                    penumbra={0.7}
                    intensity={4.5}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    color="#f0f0ff"
                />
                {/* Directional fill for even illumination */}
                <directionalLight
                    position={[-4, 6, -3]}
                    intensity={2}
                    color="#e8eeff"
                />
                {/* Blue fill from below-left */}
                <pointLight position={[-5, 2, -5]} intensity={1.5} color="#6688cc" />
                {/* Rim/back light to detach machine from background */}
                <pointLight position={[0, 3, -5]} intensity={1.8} color="#aabbee" />
                {/* Colored status accent from below */}
                <pointLight position={[0, -1.5, 0]} intensity={1.2} color={statusColor} />

                <Environment preset="studio" />

                <Suspense fallback={<Loader />}>
                    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
                        <MachineModel type={type} status={status} />
                    </Float>
                    <ContactShadows
                        position={[0, 0, 0]}
                        opacity={0.35}
                        scale={5}
                        blur={2.5}
                        far={3}
                    />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    minDistance={2.2}
                    maxDistance={6.5}
                    minPolarAngle={Math.PI / 8}
                    maxPolarAngle={Math.PI / 2.1}
                    autoRotate
                    autoRotateSpeed={0.9}
                    makeDefault
                />

                {/* 3D label floating above machine */}
                <Html position={[0, 2.2, 0]} center distanceFactor={5}>
                    <div className="px-3 py-1.5 rounded-full bg-gray-900/70 backdrop-blur-sm border border-white/10 pointer-events-none select-none whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-1.5 h-1.5 rounded-full block animate-pulse"
                                style={{ backgroundColor: statusColor }}
                            />
                            <span className="text-white/90 font-mono text-[10px] font-semibold">
                                {machineId}
                            </span>
                        </div>
                    </div>
                </Html>
            </Canvas>

            {/* ── HUD top-left ── */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Digital Twin · BMI
                </p>
                <p className="text-gray-800 dark:text-white text-sm font-bold leading-tight">
                    {type}
                </p>
                <p
                    className="text-[9px] font-semibold uppercase tracking-wider mt-0.5"
                    style={{ color: profile.accentColor }}
                >
                    {status === 'active' ? 'Opérationnel' : status === 'maintenance' ? 'Maintenance' : 'En panne'}
                </p>
            </div>

            {/* ── HUD bottom-right ── */}
            {(temperature !== undefined || vibration !== undefined) && (
                <div className="absolute bottom-3 right-3 z-10 pointer-events-none text-right font-mono">
                    {temperature !== undefined && (
                        <p className="text-[10px] text-gray-600 dark:text-gray-300">
                            TEMP {temperature.toFixed(1)} °C
                        </p>
                    )}
                    {vibration !== undefined && (
                        <p className="text-[10px] text-gray-600 dark:text-gray-300">
                            VIB  {vibration.toFixed(2)} Hz
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
