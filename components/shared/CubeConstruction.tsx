import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ThreeJSManager } from '../../lib/ThreeJSManager';
import { Check, RotateCcw } from 'lucide-react';

// --- CONSTANTS ---
// Balok dimensions: p=2, l=1, t=1.5
const p = 2;
const l = 1;
const t = 1.5;

const VERTICES = [
  new THREE.Vector3(-p/2, -t/2, -l/2), // 0: A (kiri bawah belakang)
  new THREE.Vector3(p/2, -t/2, -l/2),  // 1: B (kanan bawah belakang)
  new THREE.Vector3(p/2, -t/2, l/2),   // 2: C (kanan bawah depan)
  new THREE.Vector3(-p/2, -t/2, l/2),  // 3: D (kiri bawah depan)
  new THREE.Vector3(-p/2, t/2, -l/2),  // 4: E (kiri atas belakang)
  new THREE.Vector3(p/2, t/2, -l/2),   // 5: F (kanan atas belakang)
  new THREE.Vector3(p/2, t/2, l/2),    // 6: G (kanan atas depan)
  new THREE.Vector3(-p/2, t/2, l/2)    // 7: H (kiri atas depan)
];

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const EDGES = [
  [0,1], [1,2], [2,3], [3,0], // Alas
  [4,5], [5,6], [6,7], [7,4], // Tutup
  [0,4], [1,5], [2,6], [3,7]  // Tegak
];

const FACES = [
  [0,1,2,3], // Alas (Bawah)
  [4,5,6,7], // Tutup (Atas)
  [0,1,5,4], // Belakang
  [2,3,7,6], // Depan
  [0,3,7,4], // Kiri
  [1,2,6,5]  // Kanan
];

const DIAGONAL_BIDANG = [
  [0,2], [1,3], // Alas
  [4,6], [5,7], // Tutup
  [0,5], [1,4], // Belakang
  [2,7], [3,6], // Depan
  [0,7], [3,4], // Kiri
  [1,6], [2,5]  // Kanan
];

const DIAGONAL_RUANG = [
  [0,6], [1,7], [2,4], [3,5]
];

const BIDANG_DIAGONAL = [
  [0,1,6,7], // ABGH
  [3,2,5,4], // CDEF
  [0,3,6,5], // ADGF
  [1,2,7,4], // BCHE
  [0,4,6,2], // AEGC
  [1,5,7,3]  // BFHD
];

// --- COMPONENT ---
/**
 * Komponen interaktif untuk memvisualisasikan konstruksi balok 3D.
 * Memungkinkan pengguna untuk menampilkan atau menyembunyikan berbagai elemen geometri
 * seperti titik sudut, rusuk, sisi, diagonal bidang, diagonal ruang, dan bidang diagonal.
 * 
 * @returns {JSX.Element} Elemen laboratorium 3D yang dirender.
 */
export const CubeConstruction: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ThreeJSManager | null>(null);
  const objectsRef = useRef<Record<string, THREE.Object3D[]>>({});
  
  // State Visibility
  const [showVertices, setShowVertices] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showFaces, setShowFaces] = useState(true);
  const [showFaceDiagonals, setShowFaceDiagonals] = useState(false);
  const [showSpaceDiagonals, setShowSpaceDiagonals] = useState(false);
  const [showDiagonalPlanes, setShowDiagonalPlanes] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Init Manager
    const manager = new ThreeJSManager(containerRef.current);
    managerRef.current = manager;
    const scene = manager.getScene();
    
    // Adjust camera for closer zoom
    const camera = manager.getCamera();
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);

    // 2. Create Geometry Groups
    const group = new THREE.Group();
    scene.add(group);

    const materials = {
      vertex: new THREE.MeshStandardMaterial({ color: 0xff4b4b }),
      edge: new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 }),
      face: new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.1, side: THREE.DoubleSide }),
      faceDiagonal: new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 1 }), // Green
      spaceDiagonal: new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 }), // Orange
      diagonalPlane: new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.3, side: THREE.DoubleSide }), // Purple
    };

    const objs: Record<string, THREE.Object3D[]> = {
      vertices: [],
      edges: [],
      faces: [],
      faceDiagonals: [],
      spaceDiagonals: [],
      diagonalPlanes: []
    };

    // --- BUILDERS ---

    // Vertices (Titik Sudut)
    VERTICES.forEach((v, i) => {
      const geo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8); 
      const mesh = new THREE.Mesh(geo, materials.vertex);
      mesh.position.copy(v);
      mesh.rotation.x = Math.PI / 2; 
      group.add(mesh);
      objs.vertices.push(mesh);

      // Label
      const div = document.createElement('div');
      div.className = 'text-sm font-bold text-slate-800 pointer-events-none drop-shadow-md';
      div.textContent = LABELS[i];
      const label = new CSS2DObject(div);
      label.position.copy(v).add(new THREE.Vector3(0.15, 0.15, 0));
      group.add(label);
      objs.vertices.push(label);
    });

    // Edges (Rusuk)
    EDGES.forEach(([start, end]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([VERTICES[start], VERTICES[end]]);
      const line = new THREE.Line(geo, materials.edge);
      group.add(line);
      objs.edges.push(line);
    });

    // Faces (Sisi)
    FACES.forEach(faceIndices => {
      const pts = [
        VERTICES[faceIndices[0]], VERTICES[faceIndices[1]], VERTICES[faceIndices[2]],
        VERTICES[faceIndices[0]], VERTICES[faceIndices[2]], VERTICES[faceIndices[3]]
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, materials.face);
      group.add(mesh);
      objs.faces.push(mesh);
    });

    // Face Diagonals
    DIAGONAL_BIDANG.forEach(([start, end]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([VERTICES[start], VERTICES[end]]);
      const line = new THREE.Line(geo, materials.faceDiagonal);
      group.add(line);
      objs.faceDiagonals.push(line);
    });

    // Space Diagonals
    DIAGONAL_RUANG.forEach(([start, end]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([VERTICES[start], VERTICES[end]]);
      const line = new THREE.Line(geo, materials.spaceDiagonal);
      group.add(line);
      objs.spaceDiagonals.push(line);
    });

    // Diagonal Planes (Bidang Diagonal)
    BIDANG_DIAGONAL.forEach(faceIndices => {
      const pts = [
        VERTICES[faceIndices[0]], VERTICES[faceIndices[1]], VERTICES[faceIndices[2]],
        VERTICES[faceIndices[0]], VERTICES[faceIndices[2]], VERTICES[faceIndices[3]]
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, materials.diagonalPlane);
      group.add(mesh);
      objs.diagonalPlanes.push(mesh);
    });

    // Labels p, l, t
    const createLabel = (text: string, position: THREE.Vector3) => {
      const div = document.createElement('div');
      div.className = 'bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-slate-700 border border-slate-200';
      div.textContent = text;
      const label = new CSS2DObject(div);
      label.position.copy(position);
      group.add(label);
    };

    // p (depan bawah) - between C and D
    createLabel('p', new THREE.Vector3(0, -t/2 - 0.3, l/2 + 0.3));
    // l (mendatar ke belakang) - between B and C
    createLabel('l', new THREE.Vector3(p/2 + 0.3, -t/2 - 0.3, 0));
    // t (tegak) - between C and G
    createLabel('t', new THREE.Vector3(p/2 + 0.3, 0, l/2 + 0.3));

    objectsRef.current = objs;

    return () => {
      manager.cleanup();
    };
  }, []);

  // --- VISIBILITY UPDATES ---
  useEffect(() => {
    const objs = objectsRef.current;
    if (!objs.vertices) return;

    objs.vertices.forEach(o => o.visible = showVertices);
    objs.edges.forEach(o => o.visible = showEdges);
    objs.faces.forEach(o => o.visible = showFaces);
    objs.faceDiagonals.forEach(o => o.visible = showFaceDiagonals);
    objs.spaceDiagonals.forEach(o => o.visible = showSpaceDiagonals);
    objs.diagonalPlanes.forEach(o => o.visible = showDiagonalPlanes);
    
    if (managerRef.current) {
        managerRef.current.getControls().autoRotate = autoRotate;
        managerRef.current.needsUpdate = true;
    }

  }, [showVertices, showEdges, showFaces, showFaceDiagonals, showSpaceDiagonals, showDiagonalPlanes, autoRotate]);

  /**
   * Komponen tombol toggle untuk mengatur visibilitas elemen 3D.
   * Menggunakan warna yang berbeda berdasarkan status aktif.
   */
  const ToggleBtn = ({ label, active, onClick, colorClass }: { label: string, active: boolean, onClick: () => void, colorClass: string }) => {
    // Determine border color based on active state
    const colorMap: Record<string, { active: string, icon: string }> = {
      red: { active: 'border-red-500 bg-red-50 text-red-700', icon: 'text-red-600' },
      slate: { active: 'border-slate-500 bg-slate-50 text-slate-700', icon: 'text-slate-600' },
      blue: { active: 'border-blue-500 bg-blue-50 text-blue-700', icon: 'text-blue-600' },
      emerald: { active: 'border-emerald-500 bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' },
      orange: { active: 'border-orange-500 bg-orange-50 text-orange-700', icon: 'text-orange-600' },
      purple: { active: 'border-purple-500 bg-purple-50 text-purple-700', icon: 'text-purple-600' },
    };

    const activeBorderClass = active ? colorMap[colorClass]?.active : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
    
    return (
      <button 
        onClick={onClick}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${activeBorderClass}`}
      >
        <span>{label}</span>
        {active && <Check size={14} className={colorMap[colorClass]?.icon} />}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-slate-200 mt-8">
      <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-2 text-xs font-bold text-slate-500 uppercase">Laboratorium 3D</span>
         </div>
         <button onClick={() => setAutoRotate(!autoRotate)} className="text-slate-400 hover:text-slate-600 transition-colors" title="Auto Rotate">
            {autoRotate ? <RotateCcw size={18} className="animate-spin-slow" /> : <RotateCcw size={18} />}
         </button>
      </div>
      
      <div className="w-full h-[400px] cursor-move bg-slate-50 relative overflow-hidden" ref={containerRef} />
      
      {/* CONTROLS OUTSIDE RENDERING BOX */}
      <div className="p-4 bg-white border-t-2 border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
           <ToggleBtn label="Titik Sudut" active={showVertices} onClick={() => setShowVertices(!showVertices)} colorClass="red" />
           <ToggleBtn label="Rusuk" active={showEdges} onClick={() => setShowEdges(!showEdges)} colorClass="slate" />
           <ToggleBtn label="Sisi" active={showFaces} onClick={() => setShowFaces(!showFaces)} colorClass="blue" />
           <ToggleBtn label="Diagonal Bidang" active={showFaceDiagonals} onClick={() => setShowFaceDiagonals(!showFaceDiagonals)} colorClass="emerald" />
           <ToggleBtn label="Diagonal Ruang" active={showSpaceDiagonals} onClick={() => setShowSpaceDiagonals(!showSpaceDiagonals)} colorClass="orange" />
           <ToggleBtn label="Bidang Diagonal" active={showDiagonalPlanes} onClick={() => setShowDiagonalPlanes(!showDiagonalPlanes)} colorClass="purple" />
        </div>
      </div>
      
      <div className="p-3 bg-slate-50 text-center text-xs text-slate-400 font-bold border-t border-slate-200">
          Geser untuk memutar • Scroll untuk zoom
      </div>
    </div>
  );
};
