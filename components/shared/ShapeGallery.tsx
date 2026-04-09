import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeJSManager } from '../../lib/ThreeJSManager';
import { RotateCcw, Box, Triangle, Circle, Cylinder, Pyramid } from 'lucide-react';

// --- SHAPE GENERATORS ---
/**
 * Membuat mesh kubus 3D.
 * @param {number} size - Ukuran sisi kubus.
 * @param {number} color - Warna kubus dalam format hex.
 * @returns {THREE.Mesh} objek kubus.
 */
const createCube = (size: number, color: number) => {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
};

/**
 * Membuat mesh balok (prisma segiempat) 3D.
 * @param {number} width - Lebar balok.
 * @param {number} height - Tinggi balok.
 * @param {number} depth - Kedalaman (panjang) balok.
 * @param {number} color - Warna balok dalam format hex.
 * @returns {THREE.Mesh} objek balok.
 */
const createRectangularPrism = (width: number, height: number, depth: number, color: number) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
};

/**
 * Membuat mesh prisma segitiga 3D.
 * @param {number} radius - Jari-jari silinder dasar pembentuk segitiga.
 * @param {number} height - Tinggi prisma.
 * @param {number} color - Warna prisma dalam format hex.
 * @returns {THREE.Mesh} objek prisma segitiga.
 */
const createTriangularPrism = (radius: number, height: number, color: number) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 3);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2; // Lay flat? No, usually prisms stand up. But CylinderGeometry is vertical.
  return mesh;
};

/**
 * Membuat mesh limas segiempat (piramida) 3D.
 * @param {number} radius - Jari-jari kerucut dasar pembentuk segiempat.
 * @param {number} height - Tinggi limas.
 * @param {number} color - Warna limas dalam format hex.
 * @returns {THREE.Mesh} objek limas segiempat.
 */
const createPyramid = (radius: number, height: number, color: number) => {
  const geometry = new THREE.ConeGeometry(radius, height, 4); // 4 segments = Square Pyramid
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
};

/**
 * Membuat mesh tabung (silinder) 3D.
 * @param {number} radius - Jari-jari alas tabung.
 * @param {number} height - Tinggi tabung.
 * @param {number} color - Warna tabung dalam format hex.
 * @returns {THREE.Mesh} objek tabung.
 */
const createCylinder = (radius: number, height: number, color: number) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
};

/**
 * Membuat mesh kerucut 3D.
 * @param {number} radius - Jari-jari alas kerucut.
 * @param {number} height - Tinggi kerucut.
 * @param {number} color - Warna kerucut dalam format hex.
 * @returns {THREE.Mesh} objek kerucut.
 */
const createCone = (radius: number, height: number, color: number) => {
  const geometry = new THREE.ConeGeometry(radius, height, 32);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
};

/**
 * Membuat mesh bola 3D.
 * @param {number} radius - Jari-jari bola.
 * @param {number} color - Warna bola dalam format hex.
 * @returns {THREE.Mesh} objek bola.
 */
const createSphere = (radius: number, color: number) => {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
};

type ShapeType = 'cube' | 'balok' | 'prisma' | 'limas' | 'tabung' | 'kerucut' | 'bola';
type Category = 'datar' | 'lengkung';

interface ShapeConfig {
  id: ShapeType;
  category: Category;
  label: string;
  description: string;
  color: string; // Tailwind color class for UI
  hexColor: number; // Hex for Three.js
  icon: React.ReactNode;
}

const SHAPES: ShapeConfig[] = [
  // Sisi Datar
  { id: 'cube', category: 'datar', label: 'Kubus', description: '6 sisi persegi identik.', color: 'red', hexColor: 0xff4b4b, icon: <Box size={18} /> },
  { id: 'balok', category: 'datar', label: 'Balok', description: '3 pasang sisi persegi panjang.', color: 'blue', hexColor: 0x3b82f6, icon: <Box size={18} className="scale-x-125" /> },
  { id: 'prisma', category: 'datar', label: 'Prisma Segitiga', description: 'Alas & tutup segitiga.', color: 'green', hexColor: 0x10b981, icon: <Triangle size={18} /> },
  { id: 'limas', category: 'datar', label: 'Limas Segiempat', description: 'Alas persegi, sisi tegak segitiga.', color: 'orange', hexColor: 0xf97316, icon: <Triangle size={18} className="rotate-180" /> },
  
  // Sisi Lengkung
  { id: 'tabung', category: 'lengkung', label: 'Tabung', description: 'Alas & tutup lingkaran.', color: 'cyan', hexColor: 0x06b6d4, icon: <Cylinder size={18} /> },
  { id: 'kerucut', category: 'lengkung', label: 'Kerucut', description: 'Alas lingkaran, satu titik puncak.', color: 'purple', hexColor: 0xa855f7, icon: <Triangle size={18} className="rounded-full" /> }, // Icon approx
  { id: 'bola', category: 'lengkung', label: 'Bola', description: 'Satu sisi lengkung sempurna.', color: 'pink', hexColor: 0xec4899, icon: <Circle size={18} /> },
];

const COLOR_MAP: Record<string, { border: string, text: string, bg: string, textLight: string, borderLight: string, bgLight: string }> = {
  red: { border: 'border-red-500', text: 'text-red-700', bg: 'bg-red-500', textLight: 'text-red-600', borderLight: 'border-red-200', bgLight: 'bg-red-50' },
  blue: { border: 'border-blue-500', text: 'text-blue-700', bg: 'bg-blue-500', textLight: 'text-blue-600', borderLight: 'border-blue-200', bgLight: 'bg-blue-50' },
  green: { border: 'border-green-500', text: 'text-green-700', bg: 'bg-green-500', textLight: 'text-green-600', borderLight: 'border-green-200', bgLight: 'bg-green-50' },
  orange: { border: 'border-orange-500', text: 'text-orange-700', bg: 'bg-orange-500', textLight: 'text-orange-600', borderLight: 'border-orange-200', bgLight: 'bg-orange-50' },
  cyan: { border: 'border-cyan-500', text: 'text-cyan-700', bg: 'bg-cyan-500', textLight: 'text-cyan-600', borderLight: 'border-cyan-200', bgLight: 'bg-cyan-50' },
  purple: { border: 'border-purple-500', text: 'text-purple-700', bg: 'bg-purple-500', textLight: 'text-purple-600', borderLight: 'border-purple-200', bgLight: 'bg-purple-50' },
  pink: { border: 'border-pink-500', text: 'text-pink-700', bg: 'bg-pink-500', textLight: 'text-pink-600', borderLight: 'border-pink-200', bgLight: 'bg-pink-50' },
};

/**
 * Komponen galeri 3D interaktif untuk menampilkan berbagai bangun ruang.
 * Menggunakan Three.js untuk merender model 3D yang dapat diputar oleh pengguna.
 * 
 * @returns {JSX.Element} Elemen galeri bangun ruang yang dirender.
 */
export const ShapeGallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ThreeJSManager | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('datar');
  const [activeShape, setActiveShape] = useState<ShapeType>('cube');
  const [autoRotate, setAutoRotate] = useState(true);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const manager = new ThreeJSManager(containerRef.current);
    managerRef.current = manager;
    return () => manager.cleanup();
  }, []);

  useEffect(() => {
    if (!managerRef.current) return;
    const scene = managerRef.current.getScene();
    
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    let mesh: THREE.Mesh;
    const config = SHAPES.find(s => s.id === activeShape)!;
    
    switch (activeShape) {
      case 'cube': mesh = createCube(2, config.hexColor); break;
      case 'balok': mesh = createRectangularPrism(3, 1.5, 1.5, config.hexColor); break;
      case 'prisma': mesh = createTriangularPrism(1.5, 2.5, config.hexColor); break;
      case 'limas': mesh = createPyramid(1.5, 2.5, config.hexColor); break;
      case 'tabung': mesh = createCylinder(1.2, 2.5, config.hexColor); break;
      case 'kerucut': mesh = createCone(1.5, 2.5, config.hexColor); break;
      case 'bola': mesh = createSphere(1.5, config.hexColor); break;
      default: mesh = createCube(2, 0xffffff);
    }

    // Add edges (only for 'datar' usually, but helpful for all to see wireframe)
    // For 'lengkung', edges might look messy (too many lines), so maybe skip or use threshold
    if (config.category === 'datar') {
        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
        mesh.add(line);
    } else {
        // For curved shapes, maybe just a rim or subtle wireframe?
        // Let's just skip edges for curved to keep it clean, or use a wireframe helper
    }

    scene.add(mesh);
    meshRef.current = mesh;
    managerRef.current.needsUpdate = true;

  }, [activeShape]);

  useEffect(() => {
    if (managerRef.current) {
        managerRef.current.getControls().autoRotate = autoRotate;
        managerRef.current.needsUpdate = true;
    }
  }, [autoRotate]);

  const currentConfig = SHAPES.find(s => s.id === activeShape)!;
  const filteredShapes = SHAPES.filter(s => s.category === activeCategory);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-slate-200 mt-8">
      <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-2 text-xs font-bold text-slate-500 uppercase">Galeri Bangun Ruang</span>
         </div>
         <button onClick={() => setAutoRotate(!autoRotate)} className="text-slate-400 hover:text-slate-600 transition-colors" title="Auto Rotate">
            {autoRotate ? <RotateCcw size={18} className="animate-spin-slow" /> : <RotateCcw size={18} />}
         </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative col-span-2 h-[400px] bg-slate-50">
            <div ref={containerRef} className="w-full h-full cursor-move relative overflow-hidden" />
            <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                <span className={`inline-block px-4 py-2 rounded-xl bg-white/90 backdrop-blur shadow-sm border-2 ${COLOR_MAP[currentConfig.color]?.borderLight} ${COLOR_MAP[currentConfig.color]?.textLight} font-black text-lg`}>
                    {currentConfig.label}
                </span>
            </div>
          </div>

          <div className="p-4 bg-white border-l-2 border-slate-100 flex flex-col h-[400px]">
              <div className="flex p-1 bg-slate-100 rounded-xl mb-4 shrink-0">
                  <button 
                    onClick={() => { setActiveCategory('datar'); setActiveShape('cube'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === 'datar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      Sisi Datar
                  </button>
                  <button 
                    onClick={() => { setActiveCategory('lengkung'); setActiveShape('tabung'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === 'lengkung' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      Sisi Lengkung
                  </button>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {filteredShapes.map((shape) => {
                      const isActive = activeShape === shape.id;
                      const cMap = COLOR_MAP[shape.color];
                      return (
                      <button
                        key={shape.id}
                        onClick={() => setActiveShape(shape.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left group ${isActive ? `${cMap.bgLight} ${cMap.border}` : 'bg-white border-slate-100 hover:border-slate-300'}`}
                      >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isActive ? `${cMap.bg} text-white` : `bg-slate-100 text-slate-400 group-hover:bg-slate-200`}`}>
                              {shape.icon}
                          </div>
                          <div>
                              <div className={`font-bold text-sm ${isActive ? cMap.text : 'text-slate-600'}`}>{shape.label}</div>
                              <div className="text-[10px] text-slate-400 leading-tight">{shape.description}</div>
                          </div>
                      </button>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
};
